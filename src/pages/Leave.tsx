import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Grid,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format } from 'date-fns';

interface LeaveRequest {
  id: number;
  officerId: number;
  startDate: Date;
  endDate: Date;
  type: string;
  hours: number;
  status: 'pending' | 'approved' | 'rejected';
  attachmentUrl?: string;
  signature?: string;
}

const Leave = () => {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [leaveType, setLeaveType] = useState('');
  const [hours, setHours] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [signature, setSignature] = useState('');
  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const steps = ['Request Details', 'Documentation', 'Review & Submit'];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
    }
  };

  const checkConflicts = () => {
    if (!startDate || !endDate) return false;
    
    return requests.some(request => {
      const requestStart = new Date(request.startDate);
      const requestEnd = new Date(request.endDate);
      return (
        (startDate >= requestStart && startDate <= requestEnd) ||
        (endDate >= requestStart && endDate <= requestEnd)
      );
    });
  };

  const handleSubmit = () => {
    if (checkConflicts()) {
      setError('Conflict detected with existing leave requests');
      return;
    }

    if (!startDate || !endDate || !leaveType || !hours) {
      setError('Please fill in all required fields');
      return;
    }

    const newRequest: LeaveRequest = {
      id: requests.length + 1,
      officerId: 123, // Replace with actual officer ID
      startDate: startDate,
      endDate: endDate,
      type: leaveType,
      hours: Number(hours),
      status: 'pending',
      attachmentUrl: file ? URL.createObjectURL(file) : undefined,
      signature: signature,
    };

    setRequests([...requests, newRequest]);
    resetForm();
  };

  const resetForm = () => {
    setStartDate(null);
    setEndDate(null);
    setLeaveType('');
    setHours('');
    setFile(null);
    setSignature('');
    setActiveStep(0);
    setError(null);
  };

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box>
        <Typography variant="h4" sx={{ mb: 3 }}>Leave Request</Typography>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {activeStep === 0 && (
            <Grid container spacing={2}>
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
                <FormControl fullWidth>
                  <InputLabel>Leave Type</InputLabel>
                  <Select
                    value={leaveType}
                    onChange={(e) => setLeaveType(e.target.value)}
                    label="Leave Type"
                  >
                    <MenuItem value="annual">Annual Leave</MenuItem>
                    <MenuItem value="sick">Sick Leave</MenuItem>
                    <MenuItem value="personal">Personal Leave</MenuItem>
                    <MenuItem value="bereavement">Bereavement</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Hours Requested"
                  type="number"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                />
              </Grid>
            </Grid>
          )}

          {activeStep === 1 && (
            <Box>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>Supporting Documents (PDF)</Typography>
              <TextField
                type="file"
                fullWidth
                inputProps={{ accept: 'application/pdf' }}
                onChange={handleFileUpload}
                sx={{ mb: 2 }}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                fullWidth
                label="Digital Signature"
                value={signature}
                onChange={(e) => setSignature(e.target.value)}
                placeholder="Type your full name as signature"
              />
            </Box>
          )}

          {activeStep === 2 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>Review Request</Typography>
              <Typography>Start Date: {startDate ? format(startDate, 'MMM dd, yyyy') : 'Not set'}</Typography>
              <Typography>End Date: {endDate ? format(endDate, 'MMM dd, yyyy') : 'Not set'}</Typography>
              <Typography>Leave Type: {leaveType}</Typography>
              <Typography>Hours: {hours}</Typography>
              <Typography>Attachment: {file ? file.name : 'None'}</Typography>
              <Typography>Signature: {signature}</Typography>
            </Box>
          )}

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
            >
              Back
            </Button>
            <Box>
              <Button
                onClick={resetForm}
                sx={{ mr: 1 }}
              >
                Reset
              </Button>
              {activeStep === steps.length - 1 ? (
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                >
                  Submit Request
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleNext}
                >
                  Next
                </Button>
              )}
            </Box>
          </Box>
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Recent Requests</Typography>
          {requests.map(request => (
            <Box
              key={request.id}
              sx={{
                p: 2,
                mb: 1,
                bgcolor: 'background.default',
                borderRadius: 1,
                border: 1,
                borderColor: 'divider'
              }}
            >
              <Typography variant="subtitle1">
                {format(request.startDate, 'MMM dd, yyyy')} - {format(request.endDate, 'MMM dd, yyyy')}
              </Typography>
              <Typography color="textSecondary">
                {request.type} - {request.hours} hours
              </Typography>
              <Typography
                sx={{
                  color: request.status === 'approved' ? 'success.main' :
                        request.status === 'rejected' ? 'error.main' :
                        'warning.main'
                }}
              >
                Status: {request.status.toUpperCase()}
              </Typography>
            </Box>
          ))}
        </Paper>
      </Box>
      {/* Color Legend */}
      <Box sx={{ display: 'flex', gap: 2, mt: 3, alignItems: 'center', flexWrap: 'wrap' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 16, height: 16, bgcolor: '#4CAF50', borderRadius: 1, border: '1px solid #ccc' }} />
          <Typography variant="body2">Leave</Typography>
        </Box>
      </Box>
    </LocalizationProvider>
  );
};

export default Leave; 