import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import Navbar from '../components/shared/Navbar';
import { BookOpen, PlusCircle, BarChart2, AlertTriangle, Monitor } from 'lucide-react';

const AdminDashboard = () => {
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

  const cards = [
    { title: 'Question Bank', desc: 'Manage questions', icon: <BookOpen size={24} />, color: 'var(--accent)', path: '/admin/questions' },
    { title: 'Create Exam', desc: 'Schedule new exam', icon: <PlusCircle size={24} />, color: 'var(--success)', path: '/admin/exams/create' },
    { title: 'Results', desc: 'View exam results', icon: <BarChart2 size={24} />, color: 'var(--warning)', path: '/admin/results' },
    { title: 'Violations', desc: 'View proctoring logs', icon: <AlertTriangle size={24} />, color: 'var(--danger)', path: '/admin/violations' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Navbar title="ExamShield — Admin" />
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem' }}>
        <h2 style={{ color: 'var(--text-primary)', marginBottom: '2rem', fontSize: '22px' }}>Welcome back, {user?.name}!</h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2.5rem' }}>
          {cards.map((card, i) => (
            <div key={i} onClick={() => navigate(card.path)} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', cursor: 'pointer', boxShadow: 'var(--shadow)', transition: 'transform 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
              <div style={{ color: card.color, marginBottom: '12px' }}>{card.icon}</div>
              <h3 style={{ color: 'var(--text-primary)', fontSize: '15px', marginBottom: '6px' }}>{card.title}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{card.desc}</p>
            </div>
          ))}
        </div>

        <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem', fontSize: '18px' }}>Live Proctor</h3>
        {exams.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No exams created yet.</p>
        ) : (
          exams.map(exam => (
            <div key={exam.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.25rem 1.5rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: 'var(--shadow)' }}>
              <div>
                <h4 style={{ color: 'var(--text-primary)', marginBottom: '4px' }}>{exam.title}</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{exam.duration_minutes} minutes</p>
              </div>
              <button onClick={() => navigate(`/admin/proctor/${exam.id}`)} style={{ padding: '8px 18px', background: 'var(--accent)', color: 'white', borderRadius: 'var(--radius)', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Monitor size={16} /> Live Proctor
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;