import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Terminal, LogOut, User } from 'lucide-react';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation(); // Forces Navbar to re-render when the URL changes

  // Check if user is logged in
  const token = localStorage.getItem('compiler_token');
  const username = localStorage.getItem('compiler_user');

  const handleLogout = () => {
    // Clear authentication data
    localStorage.removeItem('compiler_token');
    localStorage.removeItem('compiler_user');
    
    // Redirect to home/dashboard
    navigate('/');
  };

  return (
    <nav style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      padding: '1rem 2rem', 
      background: 'rgba(31, 40, 51, 0.95)', 
      borderBottom: '1px solid var(--glass-border)',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      {/* Brand Logo */}
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none', color: '#fff' }}>
        <Terminal size={24} color="var(--accent)" />
        <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600, letterSpacing: '0.5px' }}>C-Compiler</h1>
      </Link>

      {/* Navigation Links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <Link to="/" style={linkStyle}>Dashboard</Link>
        <Link to="/learn-c" style={linkStyle}>Learn C</Link>
        
        {/* Only show Workspace link if logged in */}
        {token && (
          <Link to="/workspace" style={{ ...linkStyle, color: 'var(--accent)' }}>Workspace</Link>
        )}
      </div>

      {/* Authentication Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {token ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              <User size={16} />
              <span>{username || 'Developer'}</span>
            </div>
            <button 
              onClick={handleLogout} 
              className="btn-secondary" 
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', border: '1px solid #ef4444', color: '#ef4444' }}
            >
              <LogOut size={16} /> Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={{ textDecoration: 'none', color: 'var(--text-primary)', fontSize: '0.875rem', fontWeight: 500 }}>Login</Link>
            <Link to="/signup" className="btn-primary" style={{ textDecoration: 'none', padding: '0.5rem 1.25rem' }}>Sign Up Free</Link>
          </>
        )}
      </div>
    </nav>
  );
}

const linkStyle = {
  textDecoration: 'none',
  color: 'var(--text-secondary)',
  fontSize: '0.875rem',
  fontWeight: 500,
  transition: 'color 0.2s'
};