import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import Navbar from '../shared/Navbar';
import { AlertTriangle, Camera } from 'lucide-react';

const ViolationLogs = () => {
  const [results, setResults] = useState([]);
  const [selectedAttempt, setSelectedAttempt] = useState(null);
  const [violations, setViolations] = useState([]);
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

  const fetchViolations = async (attemptId) => {
    try {
      setSelectedAttempt(attemptId);
      const res = await API.get(`/api/violations/${attemptId}`);
      setViolations(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)' }}>Loading...</div>;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Navbar title="Violation Logs" />
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem' }}>
        <h2 style={{ color: 'var(--text-primary)', marginBottom: '1.5rem', fontSize: '22px' }}>Violation Logs</h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div>
            <h3 style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>All Attempts</h3>
            {results.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>No attempts yet.</p>
            ) : (
              results.map(r => (
                <div key={r.id} onClick={() => fetchViolations(r.attempt_id)} style={{ padding: '1rem 1.25rem', marginBottom: '8px', border: `2px solid ${selectedAttempt === r.attempt_id ? 'var(--accent)' : 'var(--border)'}`, borderRadius: 'var(--radius-lg)', cursor: 'pointer', background: selectedAttempt === r.attempt_id ? 'var(--accent-light)' : 'var(--bg-card)', boxShadow: 'var(--shadow)' }}>
                  <p style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '14px' }}>{r.candidate_name}</p>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>{r.exam_title}</p>
                  <p style={{ fontSize: '12px', color: 'var(--accent)', marginTop: '4px' }}>Attempt #{r.attempt_id}</p>
                </div>
              ))
            )}
          </div>

          <div>
            <h3 style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>
              {selectedAttempt ? `Violations — Attempt #${selectedAttempt}` : 'Select an attempt'}
            </h3>
            {!selectedAttempt ? (
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '3rem', textAlign: 'center' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Click on an attempt to see violations</p>
              </div>
            ) : violations.length === 0 ? (
              <div style={{ background: 'var(--success-light)', border: '1px solid var(--success)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', textAlign: 'center' }}>
                <p style={{ color: 'var(--success)', fontWeight: '600' }}>✓ No violations found!</p>
              </div>
            ) : (
              violations.map(v => (
                <div key={v.id} style={{ padding: '1rem 1.25rem', marginBottom: '8px', background: v.violation_type === 'tab_switch' ? 'var(--danger-light)' : 'var(--warning-light)', border: `1px solid ${v.violation_type === 'tab_switch' ? 'var(--danger)' : 'var(--warning)'}`, borderRadius: 'var(--radius-lg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {v.violation_type === 'tab_switch' ? <AlertTriangle size={16} color='var(--danger)' /> : <Camera size={16} color='var(--warning)' />}
                    <span style={{ fontWeight: '500', color: v.violation_type === 'tab_switch' ? 'var(--danger)' : 'var(--warning)', fontSize: '14px' }}>
                      {v.violation_type === 'tab_switch' ? 'Tab Switch' : 'Webcam Snapshot'}
                    </span>
                  </div>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {new Date(v.occurred_at).toLocaleTimeString('en-IN')}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViolationLogs;