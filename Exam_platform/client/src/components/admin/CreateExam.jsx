import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import Navbar from '../shared/Navbar';
import { CheckSquare, Square } from 'lucide-react';

const CreateExam = () => {
  const [formData, setFormData] = useState({
    title: '', description: '', duration_minutes: 30, start_time: '', end_time: ''
  });
  const [questions, setQuestions] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await API.get('/api/questions');
        setQuestions(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchQuestions();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleQuestion = (id) => {
    setSelectedQuestions(prev =>
      prev.includes(id) ? prev.filter(q => q !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedQuestions.length === 0) {
      setMessage('Please select at least one question.');
      return;
    }
    try {
      await API.post('/api/exams', { ...formData, question_ids: selectedQuestions });
      setMessage('Exam created successfully!');
      setTimeout(() => navigate('/admin/dashboard'), 2000);
    } catch (err) {
      setMessage('Error creating exam.');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Navbar title="Create Exam" />
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
        <h2 style={{ color: 'var(--text-primary)', marginBottom: '1.5rem', fontSize: '22px' }}>Create New Exam</h2>

        {message && (
          <div style={{ background: message.includes('Error') || message.includes('Please') ? 'var(--danger-light)' : 'var(--success-light)', color: message.includes('Error') || message.includes('Please') ? 'var(--danger)' : 'var(--success)', padding: '10px 14px', borderRadius: 'var(--radius)', marginBottom: '1rem', fontSize: '14px' }}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: 'var(--shadow)' }}>
            <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem', fontSize: '16px' }}>Exam Details</h3>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '6px' }}>Exam Title</label>
              <input type="text" name="title" value={formData.title} onChange={handleChange} required placeholder="e.g. Mid-term Science Test" />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '6px' }}>Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange} rows={2} placeholder="Brief description..." style={{ width: '100%', padding: '10px', background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontFamily: 'inherit', resize: 'vertical' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '6px' }}>Duration (minutes)</label>
                <input type="number" name="duration_minutes" value={formData.duration_minutes} onChange={handleChange} required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '6px' }}>Start Time</label>
                <input type="datetime-local" name="start_time" value={formData.start_time} onChange={handleChange} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '6px' }}>End Time</label>
                <input type="datetime-local" name="end_time" value={formData.end_time} onChange={handleChange} />
              </div>
            </div>
          </div>

          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: 'var(--shadow)' }}>
            <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem', fontSize: '16px' }}>Select Questions ({selectedQuestions.length} selected)</h3>
            {questions.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No questions available. Add questions first.</p>
            ) : (
              questions.map((q) => (
                <div key={q.id} onClick={() => toggleQuestion(q.id)} style={{ padding: '1rem', marginBottom: '8px', border: `2px solid ${selectedQuestions.includes(q.id) ? 'var(--accent)' : 'var(--border)'}`, borderRadius: 'var(--radius)', cursor: 'pointer', background: selectedQuestions.includes(q.id) ? 'var(--accent-light)' : 'var(--bg-primary)', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <span style={{ color: selectedQuestions.includes(q.id) ? 'var(--accent)' : 'var(--text-muted)', marginTop: '2px', flexShrink: 0 }}>
                    {selectedQuestions.includes(q.id) ? <CheckSquare size={18} /> : <Square size={18} />}
                  </span>
                  <div>
                    <p style={{ color: 'var(--text-primary)', fontSize: '14px', fontWeight: '500' }}>{q.question_text}</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '4px' }}>Topic: {q.topic} | Difficulty: {q.difficulty}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          <button type="submit" style={{ width: '100%', padding: '12px', background: 'var(--success)', color: 'white', borderRadius: 'var(--radius)', fontSize: '15px', fontWeight: '600' }}>
            Create Exam
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateExam;