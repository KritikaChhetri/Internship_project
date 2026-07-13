import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ProtectedRoute from './components/shared/ProtectedRoute';
import CandidateDashboard from './pages/CandidateDashboard';
import AdminDashboard from './pages/AdminDashboard';
import QuestionBank from './components/admin/QuestionBank';
import CreateExam from './components/admin/CreateExam';
import ExamPage from './pages/ExamPage';
import ResultPage from './pages/ResultPage';
import ResultDashboard from './components/admin/ResultDashboard';
import ViolationLogs from './components/admin/ViolationLogs';
import ProctorDashboard from './components/admin/ProctorDashboard';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/candidate/dashboard" element={
            <ProtectedRoute allowedRoles={['candidate']}>
              <CandidateDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/dashboard" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/questions" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <QuestionBank />
            </ProtectedRoute>
          } />
          <Route path="/admin/exams/create" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <CreateExam />
            </ProtectedRoute>
          } />
          <Route path="/exam/:id" element={
            <ProtectedRoute allowedRoles={['candidate']}>
              <ExamPage />
            </ProtectedRoute>
          } />
          <Route path="/result/:id" element={
            <ProtectedRoute allowedRoles={['candidate']}>
              <ResultPage />
            </ProtectedRoute>
          } />
          <Route path="/admin/results" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <ResultDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/violations" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <ViolationLogs />
            </ProtectedRoute>
          } />
          <Route path="/admin/proctor/:examId" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <ProctorDashboard />
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;