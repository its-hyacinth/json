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
  const [userRole] = useState<'owner' | 'employee'>('owner');
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [minStaffing, setMinStaffing] = useState(3);
  const [maxHours, setMaxHours] = useState(12);
  const [error, setError] = useState<string | null>(null);

  const handleAutoGenerate = () => {
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
      const response = await fetch('/api/schedules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: selectedDate,
          startTime: (document.getElementById('startTime') as HTMLInputElement | null)?.value,
          endTime: (document.getElementById('endTime') as HTMLInputElement | null)?.value,
          type: (document.getElementById('shiftType') as HTMLSelectElement | null)?.value,
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

  // Mock overtime events for demonstration
  const overtimeEvents = [
    { date: '2024-06-07', officerId: 101, event: 'Commencement' },
    { date: '2024-06-15', officerId: 102, event: 'Concert' },
  ];

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4">Schedule Management</Typography>
          <Box>
            {userRole === 'owner' && (
              <>
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
              </>
            )}
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
          {shifts.map(shift => {
            const overtime = overtimeEvents.find(ot =>
              format(shift.date, 'yyyy-MM-dd') === ot.date && shift.officerId === ot.officerId
            );
            return (
              <Tooltip
                key={shift.id}
                title={overtime ? `Overtime: ${overtime.event}` : ''}
                arrow
                disableHoverListener={!overtime}
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
            );
          })}
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
                <InputLabel id="shiftType-label">Shift Type</InputLabel>
                <Select
                  labelId="shiftType-label"
                  id="shiftType"
                  label="Shift Type"
                  defaultValue="Day Shift"
                >
                  <MenuItem value="Day Shift">Day Shift</MenuItem>
                  <MenuItem value="Night Shift">Night Shift</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button onClick={handleAddShift} variant="contained">Add</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default Schedule; 