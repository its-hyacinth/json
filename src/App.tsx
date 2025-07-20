import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Schedule from './pages/Schedule';
import Overtime from './pages/Overtime';
import Leave from './pages/Leave';
import Training from './pages/Training';
import Court from './pages/Court';
import Accounts from './pages/Accounts';
import Settings from './pages/Settings';
import LandingPage from './pages/LandingPage';
import './App.css';

const App = () => {
  const [user, setUser] = useState<{ role: 'admin' | 'employee' } | null>(null);

  const handleLogin = (role: 'admin' | 'employee') => {
    setUser({ role });
  };

  return (
    <Router>
      {!user ? (
        <Routes>
          <Route path="/*" element={<LandingPage onLogin={handleLogin} />} />
        </Routes>
      ) : (
        <Layout onLogout={() => setUser(null)}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/overtime" element={<Overtime />} />
            <Route path="/leave" element={<Leave />} />
            <Route path="/training" element={<Training />} />
            <Route path="/court" element={<Court />} />
            <Route path="/accounts" element={<Accounts />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </Layout>
      )}
    </Router>
  );
};

export default App; 