import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Onboarding from './pages/Onboarding';
import Roadmap from './pages/Roadmap';
import SeniorProject from './pages/SeniorProject'; // NEW
import DomainExplore from './pages/DomainExplore'; // NEW

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/roadmap" element={<Roadmap />} />
        
        {/* NEW ROUTES */}
        <Route path="/senior-project" element={<SeniorProject />} />
        <Route path="/domain-explore" element={<DomainExplore />} />
      </Routes>
    </Router>
  );
}

export default App;