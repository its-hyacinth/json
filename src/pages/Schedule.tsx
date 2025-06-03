import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  Alert,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { ArrowBack } from '@mui/icons-material';

interface Shift {
  id: number;
  officerId: number;
  date: Date;
  startTime: string;
  endTime: string;
  type: string;
}

const Schedule = () => {
  const navigate = useNavigate();
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [minStaffing, setMinStaffing] = useState(3);
  const [maxHours, setMaxHours] = useState(12);
  const [error, setError] = useState<string | null>(null);

  const handleAutoGenerate = () => {
    // Mock auto-generation logic
    const newShifts: Shift[] = [
      {
        id: 1,
        officerId: 101,
        date: new Date(),
        startTime: '07:00',
        endTime: '19:00',
        type: 'Day Shift'
      },
      {
        id: 2,
        officerId: 102,
        date: new Date(),
        startTime: '19:00',
        endTime: '07:00',
        type: 'Night Shift'
      }
    ];
    setShifts([...shifts, ...newShifts]);
  };

  const handleAddShift = async () => {
    try {
      // Add shift logic
      const response = await fetch('/api/schedules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: selectedDate,
          startTime: document.getElementById('startTime')?.value,
          endTime: document.getElementById('endTime')?.value,
          type: document.getElementById('shiftType')?.value,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add shift');
      }

      const newShift = await response.json();
      setShifts([...shifts, newShift]);
      setOpenDialog(false);
      setError(null);
    } catch (err) {
      setError('Error adding shift: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  const checkConflicts = (newShift: Partial<Shift>) => {
    // Check for conflicts with existing shifts
    return shifts.some(shift => 
      format(shift.date, 'yyyy-MM-dd') === format(newShift.date as Date, 'yyyy-MM-dd') &&
      shift.officerId === newShift.officerId
    );
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4">Schedule Management</Typography>
          <Box>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={() => setOpenDialog(true)}
              sx={{ mr: 2 }}
            >
              Add Shift
            </Button>
            <Button 
              variant="contained" 
              color="secondary" 
              onClick={handleAutoGenerate}
              sx={{ mr: 2 }}
            >
              Auto-Generate Schedule
            </Button>
            <Button
              variant="outlined"
              startIcon={<ArrowBack />}
              onClick={() => navigate('/')}
            >
              Back to Dashboard
            </Button>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Schedule Parameters</Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Minimum Staffing"
              type="number"
              value={minStaffing}
              onChange={(e) => setMinStaffing(Number(e.target.value))}
              sx={{ width: 200 }}
            />
            <TextField
              label="Maximum Hours"
              type="number"
              value={maxHours}
              onChange={(e) => setMaxHours(Number(e.target.value))}
              sx={{ width: 200 }}
            />
          </Box>
        </Paper>

        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Current Schedule</Typography>
          {shifts.map(shift => (
            <Tooltip 
              key={shift.id}
              title={`Officer ID: ${shift.officerId}\nTime: ${shift.startTime} - ${shift.endTime}`}
            >
              <Box sx={{ 
                p: 2, 
                mb: 1, 
                bgcolor: 'primary.light',
                color: 'white',
                borderRadius: 1,
                cursor: 'pointer'
              }}>
                <Typography>{format(shift.date, 'MMM dd, yyyy')} - {shift.type}</Typography>
              </Box>
            </Tooltip>
          ))}
        </Paper>

        <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
          <DialogTitle>Add New Shift</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <DatePicker
                label="Shift Date"
                value={selectedDate}
                onChange={(newValue) => setSelectedDate(newValue)}
              />
              <TextField
                id="startTime"
                label="Start Time"
                type="time"
                InputLabelProps={{ shrink: true }}
                inputProps={{ step: 300 }}
              />
              <TextField
                id="endTime"
                label="End Time"
                type="time"
                InputLabelProps={{ shrink: true }}
                inputProps={{ step: 300 }}
              />
              <FormControl>
                <InputLabel>Shift Type</InputLabel>
                <Select id="shiftType" label="Shift Type" defaultValue="day">
                  <MenuItem value="day">Day Shift</MenuItem>
                  <MenuItem value="night">Night Shift</MenuItem>
                  <MenuItem value="special">Special Detail</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button onClick={handleAddShift} variant="contained">Add Shift</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default Schedule; 