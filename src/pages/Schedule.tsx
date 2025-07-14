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
import { ChevronLeft, ChevronRight } from '@mui/icons-material';

interface Shift {
  id: number;
  officerId: number;
  date: Date;
  startTime: string;
  endTime: string;
  type: string;
}

// Add event interface for schedule
interface ScheduleEvent {
  id: number;
  title: string;
  date: Date;
  type: 'leave-pending' | 'leave-approved' | 'training' | 'court';
  color: string;
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

  // Centralized event state (mock for now, to be updated by other pages)
  const [events, setEvents] = useState<ScheduleEvent[]>([
    // Example events
    { id: 1, title: 'Annual Leave', date: new Date(2024, 5, 15), type: 'leave-approved', color: '#4CAF50' },
    { id: 2, title: 'Pending Leave', date: new Date(2024, 5, 18), type: 'leave-pending', color: '#FFD600' },
    { id: 3, title: 'Court Appearance', date: new Date(2024, 5, 20), type: 'court', color: '#F44336' },
    { id: 4, title: 'Training Session', date: new Date(2024, 5, 25), type: 'training', color: '#2196F3' },
  ]);

  // Helper to get events for a given day
  const getEventsForDay = (date: Date) => {
    return events.filter(event => format(event.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'));
  };

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

  // Google Doc URLs for each month
  const scheduleDocs = [
    {
      label: 'June',
      url: 'https://docs.google.com/document/d/1Qqnl1I1RzWPRgu0zVsAqANRbLrwFPa--/edit?usp=drive_link&ouid=117352121642263211642&rtpof=true&sd=true',
    },
    {
      label: 'July',
      url: 'https://docs.google.com/document/d/1w3ljHJyOc2ub4tPNK-I2LXOoA9yZ4Gzj/edit?usp=drive_link&ouid=117352121642263211642&rtpof=true&sd=true',
    },
    {
      label: 'August',
      url: 'https://docs.google.com/document/d/1MBrSDcRQMHFh6a-AGaqo7Te3hdlIquWa/edit?usp=drive_link&ouid=117352121642263211642&rtpof=true&sd=true',
    },
  ];
  const [docIndex, setDocIndex] = useState(0);

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

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
          <Button onClick={() => setDocIndex((docIndex + scheduleDocs.length - 1) % scheduleDocs.length)}>
            <ChevronLeft />
          </Button>
          <Typography variant="h5" sx={{ mx: 2 }}>{scheduleDocs[docIndex].label} Schedule</Typography>
          <Button onClick={() => setDocIndex((docIndex + 1) % scheduleDocs.length)}>
            <ChevronRight />
          </Button>
        </Box>
        <Box sx={{ width: '100%', height: '80vh', bgcolor: 'white', borderRadius: 2, overflow: 'hidden', boxShadow: 2, mb: 2 }}>
          <iframe
            title={scheduleDocs[docIndex].label + ' Schedule'}
            src={scheduleDocs[docIndex].url.replace('/edit', '/preview')}
            style={{ width: '100%', height: '100%', border: 'none', background: 'white' }}
            allowFullScreen
          />
        </Box>
        {/* Color Legend */}
        <Box sx={{ display: 'flex', gap: 2, mt: 3, alignItems: 'center', flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 16, height: 16, bgcolor: '#4CAF50', borderRadius: 1, border: '1px solid #ccc' }} />
            <Typography variant="body2">Leave</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 16, height: 16, bgcolor: '#F44336', borderRadius: 1, border: '1px solid #ccc' }} />
            <Typography variant="body2">Court</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 16, height: 16, bgcolor: '#2196F3', borderRadius: 1, border: '1px solid #ccc' }} />
            <Typography variant="body2">Training</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 16, height: 16, bgcolor: '#FFD600', borderRadius: 1, border: '1px solid #ccc' }} />
            <Typography variant="body2">Overtime</Typography>
          </Box>
        </Box>

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