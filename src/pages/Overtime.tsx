import { useState } from 'react';
import { Box, Paper, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton } from '@mui/material';
import { Print as PrintIcon, Share as ShareIcon } from '@mui/icons-material';

interface OvertimeEvent {
  id: number;
  date: string;
  event: string;
  location: string;
  signups: number;
  required: number;
  signedUp: boolean;
}

const mockEvents: OvertimeEvent[] = [
  { id: 1, date: 'June 7, 2024', event: 'Commencement', location: 'Campus', signups: 3, required: 4, signedUp: true },
  { id: 2, date: 'June 15, 2024', event: 'Concert', location: 'Auditorium', signups: 1, required: 2, signedUp: true },
  { id: 3, date: 'July 20, 2024', event: 'Sports Event', location: 'Stadium', signups: 0, required: 3, signedUp: false },
  { id: 4, date: 'August 5, 2024', event: 'Parade', location: 'Downtown', signups: 2, required: 3, signedUp: false },
];

const Overtime = () => {
  const [userRole] = useState<'officer' | 'supervisor'>('supervisor');
  const [events, setEvents] = useState<OvertimeEvent[]>(mockEvents);
  const [openDialog, setOpenDialog] = useState(false);
  const [newEvent, setNewEvent] = useState({ date: '', event: '', location: '', required: 1 });

  const handleSignUp = (id: number) => {
    setEvents(events.map(ev => ev.id === id ? { ...ev, signups: ev.signups + 1, signedUp: true } : ev));
  };

  const handleCreateEvent = () => {
    setEvents([
      ...events,
      {
        id: events.length + 1,
        date: newEvent.date,
        event: newEvent.event,
        location: newEvent.location,
        signups: 0,
        required: newEvent.required,
        signedUp: false,
      },
    ]);
    setOpenDialog(false);
    setNewEvent({ date: '', event: '', location: '', required: 1 });
  };

  const mySignups = events.filter(ev => ev.signedUp);
  const availableEvents = events.filter(ev => !ev.signedUp);

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
        <Typography variant="h4" sx={{ flexGrow: 1 }}>Overtime</Typography>
        <IconButton color="primary" onClick={() => window.print()}><PrintIcon /></IconButton>
        <IconButton color="primary" onClick={() => navigator.share && navigator.share({ title: 'Overtime Events', url: window.location.href })}><ShareIcon /></IconButton>
      </Box>
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">My Overtime Signups</Typography>
          {userRole === 'supervisor' && (
            <Button variant="contained" onClick={() => setOpenDialog(true)}>Create Overtime Event</Button>
          )}
        </Box>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Event</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {mySignups.map(ev => (
                <TableRow key={ev.id}>
                  <TableCell>{ev.date}</TableCell>
                  <TableCell>{ev.event}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Overtime Events</Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Event</TableCell>
                <TableCell>Signups</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {availableEvents.map(ev => (
                <TableRow key={ev.id}>
                  <TableCell>{ev.date}</TableCell>
                  <TableCell>{ev.event}</TableCell>
                  <TableCell>{ev.signups} / {ev.required}</TableCell>
                  <TableCell>
                    {ev.signups < ev.required && (
                      <Button variant="contained" size="small" onClick={() => handleSignUp(ev.id)}>Sign Up</Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Create Overtime Event</DialogTitle>
        <DialogContent>
          <TextField label="Date" type="text" fullWidth sx={{ mb: 2 }} value={newEvent.date} onChange={e => setNewEvent({ ...newEvent, date: e.target.value })} />
          <TextField label="Event" type="text" fullWidth sx={{ mb: 2 }} value={newEvent.event} onChange={e => setNewEvent({ ...newEvent, event: e.target.value })} />
          <TextField label="Location" type="text" fullWidth sx={{ mb: 2 }} value={newEvent.location} onChange={e => setNewEvent({ ...newEvent, location: e.target.value })} />
          <TextField label="Officers Required" type="number" fullWidth sx={{ mb: 2 }} value={newEvent.required} onChange={e => setNewEvent({ ...newEvent, required: Number(e.target.value) })} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateEvent} variant="contained">Create</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Overtime; 