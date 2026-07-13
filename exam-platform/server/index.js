const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');

dotenv.config();

const authRoutes = require('./routes/auth.routes');
const questionRoutes = require('./routes/question.routes');
const examRoutes = require('./routes/exam.routes');
const resultRoutes = require('./routes/result.routes');
const violationRoutes = require('./routes/violation.routes');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/violations', violationRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Exam Platform API running' });
});

const rooms = {};

io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);

  socket.on('proctor-join', ({ examId }) => {
    const room = `exam-${examId}`;
    socket.join(room);
    console.log(`Proctor joined room: ${room}`);
  });

  socket.on('candidate-join', ({ examId, candidateName }) => {
    const room = `exam-${examId}`;
    socket.join(room);
    socket.to(room).emit('candidate-joined', { candidateId: socket.id, candidateName });
    console.log(`Candidate ${candidateName} joined room: ${room}`);
  });

  socket.on('webrtc-offer', ({ offer, targetId }) => {
    io.to(targetId).emit('webrtc-offer', { offer, fromId: socket.id });
  });

  socket.on('webrtc-answer', ({ answer, targetId }) => {
    io.to(targetId).emit('webrtc-answer', { answer, fromId: socket.id });
  });

  socket.on('ice-candidate', ({ candidate, targetId }) => {
    io.to(targetId).emit('ice-candidate', { candidate, fromId: socket.id });
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});