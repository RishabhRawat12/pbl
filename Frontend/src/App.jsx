import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import Auth from './pages/Auth'
import Workspace from './pages/Workspace'
import LearnC from './pages/LearnC'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const readAuth = () => {
      const token = localStorage.getItem('token');
      setIsAuthenticated(!!token);
    };

    readAuth();
    window.addEventListener('authChanged', readAuth);
    return () => window.removeEventListener('authChanged', readAuth);
  }, []);

  const ProtectedRoute = ({ children }) => {
    return isAuthenticated ? children : <Navigate to="/login" />;
  };

  return (
    <div className="app-layout">
      <Navbar />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/login" element={<Auth type="login" />} />
        <Route path="/signup" element={<Auth type="signup" />} />
        <Route path="/compiler" element={<ProtectedRoute><Workspace /></ProtectedRoute>} />
        <Route path="/learn-c" element={<LearnC />} />
      </Routes>
    </div>
  )
}

export default App
