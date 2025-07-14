import { useState } from 'react';
import { Box, Paper, Typography, Switch, FormControlLabel, TextField, Button, Select, MenuItem, FormGroup, Checkbox, List, ListItem, ListItemText } from '@mui/material';

const Settings = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [emailNotif, setEmailNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(false);
  const [alerts, setAlerts] = useState({ training: true, court: true, emergency: false });
  const [emergencyContact, setEmergencyContact] = useState('');
  const [autoUpdate, setAutoUpdate] = useState(true);
  const [faq, setFaq] = useState([
    'How do I submit a leave request?',
    'How do I sign up for overtime?',
    'Who can approve training requests?'
  ]);
  const [password, setPassword] = useState('');
  const [passcode, setPasscode] = useState('');

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>Settings</Typography>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Theme</Typography>
        <FormControlLabel
          control={<Switch checked={darkMode} onChange={() => setDarkMode(!darkMode)} />}
          label="Dark Mode"
        />
        <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>Notification Preferences</Typography>
        <FormControlLabel
          control={<Checkbox checked={emailNotif} onChange={() => setEmailNotif(!emailNotif)} />}
          label="Email Notifications"
        />
        <FormControlLabel
          control={<Checkbox checked={smsNotif} onChange={() => setSmsNotif(!smsNotif)} />}
          label="SMS Notifications"
        />
        <FormGroup row>
          <FormControlLabel
            control={<Checkbox checked={alerts.training} onChange={() => setAlerts(a => ({ ...a, training: !a.training }))} />}
            label="Training Approvals"
          />
          <FormControlLabel
            control={<Checkbox checked={alerts.court} onChange={() => setAlerts(a => ({ ...a, court: !a.court }))} />}
            label="Court Reminders"
          />
          <FormControlLabel
            control={<Checkbox checked={alerts.emergency} onChange={() => setAlerts(a => ({ ...a, emergency: !a.emergency }))} />}
            label="Emergency Alerts"
          />
        </FormGroup>
        <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>Emergency Contact</Typography>
        <TextField
          fullWidth
          label="Emergency Contact Info"
          value={emergencyContact}
          onChange={e => setEmergencyContact(e.target.value)}
        />
        <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>App Updates</Typography>
        <FormControlLabel
          control={<Switch checked={autoUpdate} onChange={() => setAutoUpdate(!autoUpdate)} />}
          label="Enable Automatic Updates"
        />
        <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>Instructions / FAQ</Typography>
        <List>
          {faq.map((q, i) => (
            <ListItem key={i}><ListItemText primary={q} /></ListItem>
          ))}
        </List>
        <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>Security</Typography>
        <TextField
          fullWidth
          label="Change Password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          label="Mobile Passcode (for quick unlock)"
          type="password"
          value={passcode}
          onChange={e => setPasscode(e.target.value)}
        />
        <Button variant="contained" sx={{ mt: 2 }}>Save Settings</Button>
      </Paper>
    </Box>
  );
};

export default Settings; 