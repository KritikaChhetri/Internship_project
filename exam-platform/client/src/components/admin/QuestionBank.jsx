import { useState, useEffect } from 'react';
import API from '../../services/api';
import Navbar from '../shared/Navbar';
import { Trash2, PlusCircle } from 'lucide-react';

const QuestionBank = () => {
  const [questions, setQuestions] = useState([]);
  const [formData, setFormData] = useState({
    question_text: '', option_a: '', option_b: '', option_c: '', option_d: '',
    correct_option: 'a', topic: '', difficulty: 'medium'
  });
  const [message, setMessage] = useState('');
  const [showForm, setShowForm] = useState(false);

  const fetchQuestions = async () => {
    try {
      const res = await API.get('/api/questions');
      setQuestions(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchQuestions(); }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/api/questions', formData);
      setMessage('Question added successfully!');
      setFormData({ question_text: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_option: 'a', topic: '', difficulty: 'medium' });
      setShowForm(false);
      fetchQuestions();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('Error adding question.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this question?')) return;
    try {
      await API.delete(`/api/questions/${id}`);
      fetchQuestions();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Navbar title="Question Bank" />
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ color: 'var(--text-primary)', fontSize: '22px' }}>Question Bank ({questions.length})</h2>
          <button onClick={() => setShowForm(!showForm)} style={{ padding: '8px 18px', background: 'var(--accent)', color: 'white', borderRadius: 'var(--radius)', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <PlusCircle size={16} /> {showForm ? 'Cancel' : 'Add Question'}
          </button>
        </div>

        {message && (
          <div style={{ background: message.includes('Error') ? 'var(--danger-light)' : 'var(--success-light)', color: message.includes('Error') ? 'var(--danger)' : 'var(--success)', padding: '10px 14px', borderRadius: 'var(--radius)', marginBottom: '1rem', fontSize: '14px' }}>
            {message}
          </div>
        )}

        {showForm && (
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: 'var(--shadow)' }}>
            <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem', fontSize: '16px' }}>Add New Question</h3>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '6px' }}>Question</label>
                <textarea name="question_text" value={formData.question_text} onChange={handleChange} required rows={2} style={{ width: '100%', padding: '10px', background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontFamily: 'inherit', resize: 'vertical' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                {['a', 'b', 'c', 'd'].map(opt => (
                  <div key={opt}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '6px' }}>Option {opt.toUpperCase()}</label>
                    <input type="text" name={`option_${opt}`} value={formData[`option_${opt}`]} onChange={handleChange} required />
                  </div>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '6px' }}>Correct Option</label>
                  <select name="correct_option" value={formData.correct_option} onChange={handleChange}>
                    <option value="a">A</option>
                    <option value="b">B</option>
                    <option value="c">C</option>
                    <option value="d">D</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '6px' }}>Topic</label>
                  <input type="text" name="topic" value={formData.topic} onChange={handleChange} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '6px' }}>Difficulty</label>
                  <select name="difficulty" value={formData.difficulty} onChange={handleChange}>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>
              <button type="submit" style={{ padding: '10px 24px', background: 'var(--accent)', color: 'white', borderRadius: 'var(--radius)', fontSize: '14px', fontWeight: '600' }}>
                Add Question
              </button>
            </form>
          </div>
        )}

        {questions.length === 0 ? (
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '3rem', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-muted)' }}>No questions added yet.</p>
          </div>
        ) : (
          questions.map((q) => (
            <div key={q.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.25rem 1.5rem', marginBottom: '1rem', boxShadow: 'var(--shadow)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <p style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '15px', flex: 1 }}>{q.question_text}</p>
                <button onClick={() => handleDelete(q.id)} style={{ padding: '6px', background: 'var(--danger-light)', color: 'var(--danger)', border: 'none', borderRadius: 'var(--radius)', marginLeft: '1rem', flexShrink: 0 }}>
                  <Trash2 size={15} />
                </button>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '8px', flexWrap: 'wrap' }}>
                {['a', 'b', 'c', 'd'].map(opt => (
                  <span key={opt} style={{ fontSize: '13px', color: q.correct_option === opt ? 'var(--success)' : 'var(--text-muted)', fontWeight: q.correct_option === opt ? '600' : '400' }}>
                    {opt.toUpperCase()}: {q[`option_${opt}`]} {q.correct_option === opt ? '✓' : ''}
                  </span>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                <span style={{ fontSize: '12px', padding: '2px 8px', background: 'var(--accent-light)', color: 'var(--accent)', borderRadius: '99px' }}>{q.topic}</span>
                <span style={{ fontSize: '12px', padding: '2px 8px', background: 'var(--warning-light)', color: 'var(--warning)', borderRadius: '99px' }}>{q.difficulty}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default QuestionBank;