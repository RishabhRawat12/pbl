import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import Auth from './pages/Auth'
import Workspace from './pages/Workspace'
import LearnC from './pages/LearnC'

function App() {
  return (
    <div className="app-layout">
      <Navbar />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/login" element={<Auth type="login" />} />
        <Route path="/signup" element={<Auth type="signup" />} />
        
        {/* Mapped both paths to Workspace to prevent the blank screen crash */}
        <Route path="/compiler" element={<Workspace />} />
        <Route path="/workspace" element={<Workspace />} />
        
        <Route path="/learn-c" element={<LearnC />} />
        
        {/* Catch-all route: Redirects any unknown URLs back to the dashboard */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default App