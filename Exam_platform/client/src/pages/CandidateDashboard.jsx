import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import Navbar from '../components/shared/Navbar';
import { PlayCircle, Clock } from 'lucide-react';

const CandidateDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const res = await API.get('/api/exams');
        setExams(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchExams();
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Navbar title="ExamShield" />
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
        <h2 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem', fontSize: '22px' }}>Welcome, {user?.name}!</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '14px' }}>Here are your available exams</p>

        {exams.length === 0 ? (
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '3rem', textAlign: 'center', boxShadow: 'var(--shadow)' }}>
            <p style={{ color: 'var(--text-muted)' }}>No exams available right now. Check back later.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem' }}>
            {exams.map(exam => (
              <div key={exam.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', boxShadow: 'var(--shadow)' }}>
                <h3 style={{ color: 'var(--text-primary)', marginBottom: '8px', fontSize: '17px' }}>{exam.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '1rem', lineHeight: '1.5' }}>{exam.description}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '13px', marginBottom: '1.25rem' }}>
                  <Clock size={14} />
                  <span>{exam.duration_minutes} minutes</span>
                </div>
                <button onClick={() => navigate(`/exam/${exam.id}`)} style={{ width: '100%', padding: '10px', background: 'var(--accent)', color: 'white', borderRadius: 'var(--radius)', fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <PlayCircle size={16} /> Start Exam
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CandidateDashboard;