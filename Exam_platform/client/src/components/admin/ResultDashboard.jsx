import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import Navbar from '../shared/Navbar';
import { Download } from 'lucide-react';

const ResultDashboard = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await API.get('/api/results/all');
        setResults(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, []);

  const totalAttempts = results.length;
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  const avgScore = totalAttempts > 0 ? (results.reduce((sum, r) => sum + parseFloat(r.score), 0) / totalAttempts).toFixed(1) : 0;

  const exportCSV = () => {
    const headers = ['Candidate', 'Exam', 'Score (%)', 'Correct', 'Total', 'Status', 'Date'];
    const rows = results.map(r => [
      r.candidate_name, r.exam_title, parseFloat(r.score).toFixed(1),
      r.correct_answers, r.total_questions, r.passed ? 'PASSED' : 'FAILED',
      new Date(r.generated_at).toLocaleDateString('en-IN')
    ]);
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `exam_results_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)' }}>Loading...</div>;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Navbar title="Results Dashboard" />
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ color: 'var(--text-primary)', fontSize: '22px' }}>Results Dashboard</h2>
          <button onClick={exportCSV} style={{ padding: '8px 18px', background: 'var(--success)', color: 'white', borderRadius: 'var(--radius)', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Download size={16} /> Export CSV
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
          {[
            { label: 'Total Attempts', value: totalAttempts, color: 'var(--accent)' },
            { label: 'Passed', value: passed, color: 'var(--success)' },
            { label: 'Failed', value: failed, color: 'var(--danger)' },
            { label: 'Avg Score', value: `${avgScore}%`, color: 'var(--warning)' },
          ].map((stat, i) => (
            <div key={i} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', textAlign: 'center', boxShadow: 'var(--shadow)' }}>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>{stat.label}</p>
              <p style={{ fontSize: '28px', fontWeight: 'bold', color: stat.color }}>{stat.value}</p>
            </div>
          ))}
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg-secondary)' }}>
                {['Candidate', 'Exam', 'Score', 'Correct', 'Status', 'Date'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {results.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>No results yet.</td></tr>
              ) : (
                results.map(r => (
                  <tr key={r.id} style={{ borderTop: '1px solid var(--border)' }}>
                    <td style={{ padding: '12px 16px', fontSize: '14px', color: 'var(--text-primary)' }}>{r.candidate_name}</td>
                    <td style={{ padding: '12px 16px', fontSize: '14px', color: 'var(--text-primary)' }}>{r.exam_title}</td>
                    <td style={{ padding: '12px 16px', fontSize: '14px', fontWeight: 'bold', color: 'var(--accent)' }}>{parseFloat(r.score).toFixed(1)}%</td>
                    <td style={{ padding: '12px 16px', fontSize: '14px', color: 'var(--text-primary)' }}>{r.correct_answers}/{r.total_questions}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ padding: '3px 10px', borderRadius: '99px', fontSize: '12px', fontWeight: '500', background: r.passed ? 'var(--success-light)' : 'var(--danger-light)', color: r.passed ? 'var(--success)' : 'var(--danger)' }}>
                        {r.passed ? 'PASSED' : 'FAILED'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--text-muted)' }}>{new Date(r.generated_at).toLocaleDateString('en-IN')}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ResultDashboard;