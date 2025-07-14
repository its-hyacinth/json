import { useState } from 'react';
import { Box, Paper, Typography, Button, TextField, Alert, Grid } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const Training = () => {
  const [employee, setEmployee] = useState('');
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [hours, setHours] = useState('');
  const [link, setLink] = useState('');
  const [file, setFile] = useState(null);
  const [signature, setSignature] = useState('');
  const [error, setError] = useState(null);
  const [conflict, setConflict] = useState(false);
  const [showOvertime, setShowOvertime] = useState(false);

  const handleFileUpload = (event) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
    }
  };

  const handleSubmit = () => {
    // Simulate conflict detection
    if (hours && Number(hours) > 8) {
      setConflict(true);
      setShowOvertime(true);
      setError('Conflict detected: Approving this training would leave a shift understaffed. Create an overtime slot?');
      return;
    }
    setError(null);
    // Submit logic here
  };

  const handleCreateOvertime = () => {
    setShowOvertime(false);
    setError('Overtime slot created for this training conflict.');
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box>
        <Typography variant="h4" sx={{ mb: 3 }}>Training Request</Typography>
        <Paper sx={{ p: 3, mb: 3 }}>
          {error && (
            <Alert severity={conflict ? 'warning' : 'success'} sx={{ mb: 2 }}>
              {error}
              {showOvertime && (
                <Button variant="contained" color="secondary" sx={{ ml: 2 }} onClick={handleCreateOvertime}>
                  Create Overtime Slot
                </Button>
              )}
            </Alert>
          )}
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Employee"
                value={employee}
                onChange={e => setEmployee(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Title"
                value={title}
                onChange={e => setTitle(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <DatePicker
                label="Start Date"
                value={startDate}
                onChange={setStartDate}
                sx={{ width: '100%' }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <DatePicker
                label="End Date"
                value={endDate}
                onChange={setEndDate}
                sx={{ width: '100%' }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Hours"
                type="number"
                value={hours}
                onChange={e => setHours(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Training Link (optional)"
                value={link}
                onChange={e => setLink(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>Supporting Documents (PDF)</Typography>
              <TextField
                type="file"
                fullWidth
                inputProps={{ accept: 'application/pdf' }}
                onChange={handleFileUpload}
                sx={{ mb: 2 }}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Digital Signature"
                value={signature}
                onChange={e => setSignature(e.target.value)}
                placeholder="Type your full name as signature"
              />
            </Grid>
            <Grid item xs={12}>
              <Button variant="contained" color="primary" onClick={handleSubmit}>Submit</Button>
            </Grid>
          </Grid>
        </Paper>
        {/* Color Legend */}
        <Box sx={{ display: 'flex', gap: 2, mt: 3, alignItems: 'center', flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 16, height: 16, bgcolor: '#2196F3', borderRadius: 1, border: '1px solid #ccc' }} />
            <Typography variant="body2">Training</Typography>
          </Box>
        </Box>
      </Box>
    </LocalizationProvider>
  );
};

export default Training; 