import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Clock, Camera, BarChart2, Sun, Moon } from 'lucide-react';

const Home = () => {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') {
      setDark(true);
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, []);

  const toggleTheme = () => {
    const newDark = !dark;
    setDark(newDark);
    document.documentElement.setAttribute('data-theme', newDark ? 'dark' : 'light');
    localStorage.setItem('theme', newDark ? 'dark' : 'light');
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <nav style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)', padding: '0 2rem', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: 'var(--shadow)' }}>
        <span style={{ fontWeight: '700', fontSize: '20px', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="28" height="28">
            <path d="M50 15 L80 28 L80 52 C80 68 65 80 50 85 C35 80 20 68 20 52 L20 28 Z" fill="currentColor" opacity="0.3"/>
            <path d="M50 25 L72 36 L72 52 C72 64 62 74 50 78 C38 74 28 64 28 52 L28 36 Z" fill="currentColor"/>
            <path d="M42 52 L47 57 L58 46" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          </svg>
          ExamShield
        </span>
        <button onClick={toggleTheme} style={{ padding: '6px 12px', background: 'var(--accent-light)', color: 'var(--accent)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '16px' }}>{dark ? '☀' : '☽'}</span>
          {dark ? 'Light' : 'Dark'}
        </button>
      </nav>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '6rem 2rem', textAlign: 'center' }}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="60" height="60" style={{ marginBottom: '1rem' }}>
          <path d="M50 15 L80 28 L80 52 C80 68 65 80 50 85 C35 80 20 68 20 52 L20 28 Z" fill="#F5F0E8" stroke="#5C3519" strokeWidth="2"/>
          <path d="M50 25 L72 36 L72 52 C72 64 62 74 50 78 C38 74 28 64 28 52 L28 36 Z" fill="#7B4F2E"/>
          <path d="M42 52 L47 57 L58 46" stroke="#F5F0E8" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        </svg>
        <h1 style={{ fontSize: '42px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '1rem' }}>ExamShield</h1>
        <p style={{ fontSize: '18px', color: 'var(--text-secondary)', marginBottom: '3rem', lineHeight: '1.6' }}>
          Secure online examination platform with real-time webcam proctoring, automated evaluation, and detailed analytics.
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '4rem' }}>
          <Link to="/login">
            <button style={{ padding: '14px 36px', background: 'var(--accent)', color: 'white', borderRadius: 'var(--radius)', fontSize: '16px', fontWeight: '600', boxShadow: 'var(--shadow)' }}>
              Sign In
            </button>
          </Link>
          <Link to="/register">
            <button style={{ padding: '14px 36px', background: 'transparent', color: 'var(--accent)', border: '2px solid var(--accent)', borderRadius: 'var(--radius)', fontSize: '16px', fontWeight: '600' }}>
              Register
            </button>
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
          {[
            { icon: <Clock size={28} />, title: 'Timed Exams', desc: 'Auto-submit with countdown timer' },
            { icon: <Camera size={28} />, title: 'Live Proctoring', desc: 'WebRTC webcam monitoring' },
            { icon: <BarChart2 size={28} />, title: 'Instant Results', desc: 'Auto-evaluation with analytics' }
          ].map((f, i) => (
            <div key={i} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', boxShadow: 'var(--shadow)' }}>
              <div style={{ color: 'var(--accent)', marginBottom: '12px' }}>{f.icon}</div>
              <h3 style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>{f.title}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;