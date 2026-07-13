import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Sun, Moon, User } from 'lucide-react';

const Navbar = ({ title }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
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

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav style={{
      background: 'var(--bg-secondary)',
      borderBottom: '1px solid var(--border)',
      padding: '0 2rem',
      height: '60px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: 'var(--shadow)'
    }}>
      <span style={{ fontWeight: '600', fontSize: '18px', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="24" height="24">
            <path d="M50 15 L80 28 L80 52 C80 68 65 80 50 85 C35 80 20 68 20 52 L20 28 Z" fill="currentColor" opacity="0.3"/>
            <path d="M50 25 L72 36 L72 52 C72 64 62 74 50 78 C38 74 28 64 28 52 L28 36 Z" fill="currentColor"/>
            <path d="M42 52 L47 57 L58 46" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        </svg>
        {title || 'ExamShield'}
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {user && (
        <span style={{ fontSize: '14px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
            </svg>
            {user.name}
        </span>
        )}
        <button onClick={toggleTheme} style={{ padding: '6px 12px', background: 'var(--accent-light)', color: 'var(--accent)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '16px' }}>{dark ? '☀' : '☽'}</span>
            {dark ? 'Light' : 'Dark'}
        </button>
        {user && (
          <button onClick={handleLogout} style={{
            padding: '6px 14px',
            background: 'var(--danger)',
            color: 'white',
            borderRadius: 'var(--radius)',
            fontSize: '14px'
          }}>
            Logout
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;