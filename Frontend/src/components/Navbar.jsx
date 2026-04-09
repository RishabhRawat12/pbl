import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { TerminalSquare, User, LogIn, LogOut } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const readUserFromStorage = () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      if (token && userData) {
        setUser(JSON.parse(userData));
      } else {
        setUser(null);
      }
    };

    readUserFromStorage();

    window.addEventListener('authChanged', readUserFromStorage);
    return () => window.removeEventListener('authChanged', readUserFromStorage);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    window.dispatchEvent(new Event('authChanged'));
    navigate('/');
  };

  return (
    <nav className="glass-panel" style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1rem 2rem',
      margin: '1rem',
      position: 'sticky',
      top: '1rem',
      zIndex: 50
    }}>
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <TerminalSquare size={32} color="var(--accent)" />
        <h2 style={{ margin: 0, fontSize: '1.5rem' }}>
          C-<span className="text-gradient">Compiler</span>
        </h2>
      </Link>

      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
        {location.pathname !== '/compiler' && (
           <Link to="/compiler" className="btn-secondary">
             Open Compiler
           </Link>
        )}
        {user ? (
          <>
            <span style={{ color: 'var(--text-secondary)' }}>Welcome, {user.name}</span>
            <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500, background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
              <LogOut size={18} /> Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500 }}>
              <LogIn size={18} /> Login
            </Link>
            <Link to="/signup" className="btn-primary no-glow">
              <User size={18} /> Sign Up Free
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
