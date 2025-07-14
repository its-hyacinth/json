import { useState } from 'react';
import { Box, Paper, Typography, Button, TextField, Alert, Grid } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const Court = () => {
  const [officer, setOfficer] = useState('');
  const [date, setDate] = useState(null);
  const [time, setTime] = useState('');
  const [reference, setReference] = useState('');
  const [court, setCourt] = useState('');
  const [file, setFile] = useState(null);
  const [signature, setSignature] = useState('');
  const [error, setError] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const handleFileUpload = (event) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
    }
  };

  const handleSubmit = () => {
    if (!officer || !date || !time || !reference || !court || !signature) {
      setError('Please fill in all required fields');
      return;
    }
    setError(null);
    setSubmitted(true);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box>
        <Typography variant="h4" sx={{ mb: 3 }}>Court Event</Typography>
        <Paper sx={{ p: 3, mb: 3 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
          )}
          {submitted && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Court event submitted!<br />
              <strong>Preview:</strong> Officer: {officer}, Date: {date ? date.toLocaleDateString() : ''}, Time: {time}, Reference: {reference}, Court: {court}
            </Alert>
          )}
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Officer"
                value={officer}
                onChange={e => setOfficer(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <DatePicker
                label="Date"
                value={date}
                onChange={setDate}
                sx={{ width: '100%' }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Time"
                value={time}
                onChange={e => setTime(e.target.value)}
                placeholder="e.g. 09:00 AM"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Reference"
                value={reference}
                onChange={e => setReference(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Court"
                value={court}
                onChange={e => setCourt(e.target.value)}
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
            <Box sx={{ width: 16, height: 16, bgcolor: '#F44336', borderRadius: 1, border: '1px solid #ccc' }} />
            <Typography variant="body2">Court</Typography>
          </Box>
        </Box>
      </Box>
    </LocalizationProvider>
  );
};

export default Court; 