import { Link, useLocation } from 'react-router-dom';
import { TerminalSquare, User, LogIn } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();

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
        <Link to="/login" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500 }}>
          <LogIn size={18} /> Login
        </Link>
        <Link to="/signup" className="btn-primary no-glow">
          <User size={18} /> Sign Up Free
        </Link>
      </div>
    </nav>
  );
}
