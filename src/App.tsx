import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
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
import { useNavigate } from 'react-router-dom';

const App = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [user, setUser] = useState<{ role: 'admin' | 'employee' } | null>(null);

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: '#003366', // CNU Blue
      },
      secondary: {
        main: '#8B9DAF', // CNU Gray
      },
    },
  });

  const handleLogin = (role: 'admin' | 'employee') => {
    setUser({ role });
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        {!user ? (
          <Routes>
            <Route path="/*" element={<LandingPage onLogin={handleLogin} />} />
          </Routes>
        ) : (
          <Layout darkMode={darkMode} setDarkMode={setDarkMode} onLogout={() => setUser(null)}>
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
    </ThemeProvider>
  );
};

export default App; 