import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login'; // Import the new Login page

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;