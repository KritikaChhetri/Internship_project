import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import API from '../services/api';
import Navbar from '../components/shared/Navbar';

const ExamPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [attemptId, setAttemptId] = useState(null);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [violations, setViolations] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const timerRef = useRef(null);
  const webcamRef = useRef(null);
  const socketRef = useRef(null);
  const peerConnectionRef = useRef(null);

  useEffect(() => {
    const fetchAndStart = async () => {
      try {
        const examRes = await API.get(`/api/exams/${id}`);
        setExam(examRes.data);
        setTimeLeft(examRes.data.duration_minutes * 60);
        const attemptRes = await API.post('/api/results/start', { exam_id: id });
        setAttemptId(attemptRes.data.attempt.id);
        const savedAnswers = localStorage.getItem(`answers_${examRes.data.id}`);
        if (savedAnswers) setAnswers(JSON.parse(savedAnswers));
      } catch (err) {
        console.error(err);
      }
    };
    fetchAndStart();
  }, [id]);

  useEffect(() => {
    if (timeLeft === null) return;
    if (timeLeft <= 0) { handleSubmit(); return; }
    timerRef.current = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(timerRef.current);
  }, [timeLeft]);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden && attemptId) {
        setViolations(v => {
          const newV = v + 1;
          alert(`Warning ${newV}: Do not switch tabs!`);
          API.post('/api/violations', { attempt_id: attemptId, violation_type: 'tab_switch' }).catch(err => console.error(err));
          return newV;
        });
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [attemptId]);

  useEffect(() => {
    const startWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (webcamRef.current) webcamRef.current.srcObject = stream;
        const captureInterval = setInterval(async () => {
          if (!webcamRef.current || !attemptId) return;
          const canvas = document.createElement('canvas');
          canvas.width = webcamRef.current.videoWidth;
          canvas.height = webcamRef.current.videoHeight;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(webcamRef.current, 0, 0);
          canvas.toBlob(async (blob) => {
            if (!blob) return;
            await API.post('/api/violations', { attempt_id: attemptId, violation_type: 'webcam_snapshot' }).catch(err => console.error(err));
          }, 'image/jpeg');
        }, 30000);
        return () => clearInterval(captureInterval);
      } catch (err) {
        console.warn('Webcam not available:', err);
      }
    };
    startWebcam();
  }, []);

  useEffect(() => {
    if (!attemptId || !exam) return;
    if (socketRef.current?.connected) return;
    socketRef.current = io(import.meta.env.VITE_API_URL, {
      transports: ['websocket'],
      upgrade: false
    });
    socketRef.current.emit('candidate-join', {
      examId: id,
      candidateName: JSON.parse(localStorage.getItem('user'))?.name || 'Candidate'
    });
    socketRef.current.on('webrtc-offer', async ({ offer, fromId }) => {
      const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
      peerConnectionRef.current = pc;
      let stream = webcamRef.current?.srcObject;
      if (!stream) {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (webcamRef.current) webcamRef.current.srcObject = stream;
      }
      if (stream) stream.getTracks().forEach(track => pc.addTrack(track, stream));
      pc.onicecandidate = (e) => {
        if (e.candidate) socketRef.current.emit('ice-candidate', { candidate: e.candidate, targetId: fromId });
      };
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socketRef.current.emit('webrtc-answer', { answer, targetId: fromId });
    });
    socketRef.current.on('ice-candidate', ({ candidate }) => {
      peerConnectionRef.current?.addIceCandidate(new RTCIceCandidate(candidate));
    });
    return () => {
      socketRef.current?.disconnect();
      peerConnectionRef.current?.close();
    };
  }, [attemptId, exam]);

  const handleAnswer = (questionId, option) => {
    setAnswers(prev => {
      const updated = { ...prev, [questionId]: option };
      localStorage.setItem(`answers_${id}`, JSON.stringify(updated));
      return updated;
    });
  };

  const handleSubmit = async () => {
    if (submitted) return;
    setSubmitted(true);
    clearTimeout(timerRef.current);
    try {
      const formattedAnswers = Object.entries(answers).map(([question_id, selected_option]) => ({
        question_id: parseInt(question_id), selected_option
      }));
      const res = await API.post('/api/results/submit', { attempt_id: attemptId, answers: formattedAnswers });
      localStorage.removeItem(`answers_${id}`);
      navigate(`/result/${res.data.result.id}`);
    } catch (err) {
      console.error(err);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  if (!exam) return <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)' }}>Loading exam...</div>;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <div style={{ position: 'sticky', top: 0, zIndex: 100, background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)', padding: '0.75rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: 'var(--shadow)' }}>
        <h2 style={{ color: 'var(--accent)', fontWeight: '700', fontSize: '18px' }}>{exam.title}</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <video ref={webcamRef} autoPlay muted style={{ width: '70px', height: '52px', borderRadius: '8px', border: '2px solid var(--accent)', objectFit: 'cover' }} />
          <div style={{ background: timeLeft < 60 ? 'var(--danger-light)' : 'var(--accent-light)', padding: '8px 16px', borderRadius: 'var(--radius)', fontWeight: 'bold', color: timeLeft < 60 ? 'var(--danger)' : 'var(--accent)', fontSize: '20px', fontFamily: 'monospace' }}>
            {formatTime(timeLeft)}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '750px', margin: '0 auto', padding: '2rem' }}>
        {violations > 0 && (
          <div style={{ background: 'var(--warning-light)', border: '1px solid var(--warning)', color: 'var(--warning)', padding: '10px 14px', borderRadius: 'var(--radius)', marginBottom: '1.5rem', fontSize: '14px' }}>
            ⚠️ Violations: {violations} — Do not switch tabs!
          </div>
        )}

        {exam.questions.map((q, index) => (
          <div key={q.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', marginBottom: '1.25rem', boxShadow: 'var(--shadow)' }}>
            <p style={{ fontWeight: '600', marginBottom: '1rem', color: 'var(--text-primary)', fontSize: '15px' }}>{index + 1}. {q.question_text}</p>
            {['a', 'b', 'c', 'd'].map(opt => (
              <div key={opt} onClick={() => handleAnswer(q.id, opt)} style={{ padding: '10px 14px', marginBottom: '8px', border: `2px solid ${answers[q.id] === opt ? 'var(--accent)' : 'var(--border)'}`, borderRadius: 'var(--radius)', cursor: 'pointer', background: answers[q.id] === opt ? 'var(--accent-light)' : 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '14px', transition: 'all 0.15s' }}>
                <strong style={{ color: 'var(--accent)' }}>{opt.toUpperCase()}.</strong> {q[`option_${opt}`]}
              </div>
            ))}
          </div>
        ))}

        <button onClick={handleSubmit} disabled={submitted} style={{ width: '100%', padding: '14px', background: 'var(--success)', color: 'white', borderRadius: 'var(--radius)', fontSize: '16px', fontWeight: '600', marginTop: '1rem', opacity: submitted ? 0.7 : 1 }}>
          {submitted ? 'Submitting...' : 'Submit Exam'}
        </button>
      </div>
    </div>
  );
};

export default ExamPage;