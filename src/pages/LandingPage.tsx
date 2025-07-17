import React, { useState } from 'react';
import { Box, Button, Typography, Modal, TextField, Paper } from '@mui/material';

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
    <Box sx={{ minHeight: '100vh', bgcolor: '#003366', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <img src="/assets/cnupd.png" alt="CNU Logo" style={{ width: 120, marginBottom: 24 }} />
      <Typography variant="h3" fontWeight={700} gutterBottom align="center">
        POLICE DEPARTMENT
      </Typography>
      <Typography variant="h4" fontWeight={600} gutterBottom align="center">
        Streamlined Scheduling for Campus Safety
      </Typography>
      <Typography variant="h6" sx={{ mb: 4 }} align="center">
        Efficiently manage police department schedules, leaves, and special events all in one place.
      </Typography>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button variant="contained" color="secondary" onClick={() => handleOpen('admin')}>Admin Login</Button>
        <Button variant="contained" color="secondary" onClick={() => handleOpen('employee')}>Employee Login</Button>
      </Box>
      <Modal open={!!open} onClose={handleClose}>
        <Paper sx={modalStyle}>
          <Typography variant="h6" gutterBottom>{open === 'admin' ? 'Admin Login' : 'Employee Login'}</Typography>
          <TextField label="Username" fullWidth margin="normal" value={username} onChange={e => setUsername(e.target.value)} autoFocus />
          <TextField label="Password" type="password" fullWidth margin="normal" value={password} onChange={e => setPassword(e.target.value)} />
          {error && <Typography color="error" variant="body2">{error}</Typography>}
          <Button variant="contained" color="primary" fullWidth sx={{ mt: 2 }} onClick={handleLogin}>Login</Button>
        </Paper>
      </Modal>
    </Box>
  );
};

export default LandingPage; 