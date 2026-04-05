import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import Auth from './pages/Auth'
import Workspace from './pages/Workspace'
import LearnC from './pages/LearnC'
import './App.css'

function App() {
  return (
    <div className="app-layout">
      <Toaster position="bottom-right" />
      <Navbar />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/login" element={<Auth type="login" />} />
        <Route path="/signup" element={<Auth type="signup" />} />
        <Route path="/compiler" element={<Workspace />} />
        <Route path="/workspace" element={<Workspace />} />
        <Route path="/learn-c" element={<LearnC />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default App