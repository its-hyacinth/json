import React, { useState } from 'react';
import { Box, Button, Typography, Modal, TextField, Paper } from '@mui/material';
import ShieldIcon from '@mui/icons-material/Security';
import PersonIcon from '@mui/icons-material/Person';

const modalStyle = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 350,
  bgcolor: 'background.paper',
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
};

const LandingPage = ({ onLogin }: { onLogin: (role: 'admin' | 'employee') => void }) => {
  const [open, setOpen] = useState<'admin' | 'employee' | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleOpen = (role: 'admin' | 'employee') => {
    setOpen(role);
    setUsername('');
    setPassword('');
    setError('');
  };
  const handleClose = () => setOpen(null);

  const handleLogin = () => {
    // Mock login: accept any non-empty username/password
    if (username && password) {
      onLogin(open!);
      handleClose();
    } else {
      setError('Please enter username and password.');
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#003366', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'Montserrat, Arial, Helvetica, sans-serif' }}>
      <img src="/assets/cnupd.png" alt="CNU Logo" style={{ width: 120, marginBottom: 24, marginTop: 40 }} />
      <Typography variant="h3" fontWeight={700} gutterBottom align="center" sx={{ letterSpacing: '0.04em', textTransform: 'uppercase', fontSize: { xs: '2rem', md: '2.5rem' } }}>
        POLICE DEPARTMENT
      </Typography>
      <Box sx={{ width: '100%', maxWidth: 900, borderBottom: '1px solid #fff', opacity: 0.3, my: 3 }} />
      <Typography variant="h4" fontWeight={700} align="center" sx={{ mb: 2, fontSize: { xs: '1.5rem', md: '2.2rem' } }}>
        Streamlined Scheduling for Campus Safety
      </Typography>
      <Typography variant="h6" align="center" sx={{ mb: 4, fontWeight: 400, maxWidth: 600, fontSize: { xs: '1rem', md: '1.25rem' } }}>
        Efficiently manage police department schedules, leaves, and special events all in one place.
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
        <Button
          variant="outlined"
          startIcon={<ShieldIcon sx={{ color: '#003366' }} />}
          sx={{
            background: 'white',
            color: '#003366',
            border: '2px solid #003366',
            px: 4,
            py: 1.5,
            fontWeight: 700,
            fontSize: '1.1rem',
            borderRadius: 2,
            textTransform: 'none',
            boxShadow: 2,
            '&:hover': {
              background: '#e6e6e6',
              borderColor: '#003366',
            },
          }}
          onClick={() => handleOpen('admin')}
        >
          Admin Login
        </Button>
        <Button
          variant="outlined"
          startIcon={<PersonIcon sx={{ color: '#003366' }} />}
          sx={{
            background: 'white',
            color: '#003366',
            border: '2px solid #003366',
            px: 4,
            py: 1.5,
            fontWeight: 700,
            fontSize: '1.1rem',
            borderRadius: 2,
            textTransform: 'none',
            boxShadow: 2,
            '&:hover': {
              background: '#e6e6e6',
              borderColor: '#003366',
            },
          }}
          onClick={() => handleOpen('employee')}
        >
          Employee Login
        </Button>
      </Box>
      <Modal open={!!open} onClose={handleClose}>
        <Paper sx={modalStyle}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, textAlign: 'center', mb: 2 }}>{open === 'admin' ? 'Admin Login' : 'Employee Login'}</Typography>
          <TextField label="Username" fullWidth margin="normal" value={username} onChange={e => setUsername(e.target.value)} autoFocus />
          <TextField label="Password" type="password" fullWidth margin="normal" value={password} onChange={e => setPassword(e.target.value)} />
          {error && <Typography color="error" variant="body2" sx={{ mt: 1 }}>{error}</Typography>}
          <Button variant="contained" color="primary" fullWidth sx={{ mt: 2, fontWeight: 700 }} onClick={handleLogin}>Login</Button>
        </Paper>
      </Modal>
    </Box>
  );
};

export default LandingPage; 