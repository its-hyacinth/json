import { useState } from 'react';
import { Box, Paper, Typography, Grid, IconButton, Chip } from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth } from 'date-fns';

interface Event {
  id: number;
  title: string;
  date: Date;
  type: 'leave' | 'court' | 'training' | 'overtime';
  color: string;
}

const Dashboard = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Mock events - replace with API call
  const events: Event[] = [
    {
      id: 1,
      title: 'Annual Leave',
      date: new Date(2024, 2, 15),
      type: 'leave',
      color: '#4CAF50'
    },
    {
      id: 2,
      title: 'Court Appearance',
      date: new Date(2024, 2, 20),
      type: 'court',
      color: '#F44336'
    },
    {
      id: 3,
      title: 'Training Session',
      date: new Date(2024, 2, 25),
      type: 'training',
      color: '#2196F3'
    }
  ];

  const handlePreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const days = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate)
  });

  const getEventsForDay = (date: Date) => {
    return events.filter(event => 
      format(event.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={handlePreviousMonth}>
          <ChevronLeft />
        </IconButton>
        <Typography variant="h4" sx={{ mx: 2 }}>
          {format(currentDate, 'MMMM yyyy')}
        </Typography>
        <IconButton onClick={handleNextMonth}>
          <ChevronRight />
        </IconButton>
      </Box>

      <Grid container spacing={1}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <Grid item xs key={day}>
            <Paper sx={{ p: 1, textAlign: 'center', bgcolor: 'primary.main', color: 'white' }}>
              {day}
            </Paper>
          </Grid>
        ))}

        {days.map(day => (
          <Grid item xs key={format(day, 'yyyy-MM-dd')}>
            <Paper 
              sx={{ 
                p: 1, 
                minHeight: 100,
                bgcolor: isSameMonth(day, currentDate) ? 'background.paper' : 'action.hover'
              }}
            >
              <Typography variant="body2" color="text.secondary">
                {format(day, 'd')}
              </Typography>
              <Box sx={{ mt: 1 }}>
                {getEventsForDay(day).map(event => (
                  <Chip
                    key={event.id}
                    label={event.title}
                    size="small"
                    sx={{ 
                      mb: 0.5, 
                      width: '100%',
                      bgcolor: event.color,
                      color: 'white'
                    }}
                  />
                ))}
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Dashboard; 