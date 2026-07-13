import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { Trophy, XCircle } from 'lucide-react';

const ResultPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const res = await API.get('/api/results/my');
        const found = res.data.find(r => r.id === parseInt(id));
        setResult(found);
      } catch (err) {
        console.error(err);
      }
    };
    fetchResult();
  }, [id]);

  if (!result) return <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)' }}>Loading result...</div>;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: '500px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '2.5rem', boxShadow: 'var(--shadow-lg)', textAlign: 'center' }}>
        <div style={{ color: result.passed ? 'var(--success)' : 'var(--danger)', marginBottom: '1rem' }}>
          {result.passed ? <Trophy size={52} /> : <XCircle size={52} />}
        </div>
        <h2 style={{ color: 'var(--text-primary)', marginBottom: '6px', fontSize: '22px' }}>{result.exam_title}</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '14px' }}>Exam Result</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>Score</p>
            <p style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--accent)' }}>{parseFloat(result.score).toFixed(1)}%</p>
          </div>
          <div style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>Correct</p>
            <p style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--success)' }}>{result.correct_answers}/{result.total_questions}</p>
          </div>
        </div>

        <div style={{ padding: '1rem', borderRadius: 'var(--radius-lg)', background: result.passed ? 'var(--success-light)' : 'var(--danger-light)', border: `1px solid ${result.passed ? 'var(--success)' : 'var(--danger)'}`, marginBottom: '2rem' }}>
          <p style={{ fontWeight: 'bold', color: result.passed ? 'var(--success)' : 'var(--danger)', fontSize: '20px' }}>
            {result.passed ? 'PASSED ✓' : 'FAILED ✗'}
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>Passing criteria: 50%</p>
        </div>

        <button onClick={() => navigate('/candidate/dashboard')} style={{ width: '100%', padding: '12px', background: 'var(--accent)', color: 'white', borderRadius: 'var(--radius)', fontSize: '15px', fontWeight: '600' }}>
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default ResultPage;