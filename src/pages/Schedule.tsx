import { useState } from 'react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

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
    <div>
      <div className="glass-card" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px' }}>
        <h1 style={{ color: 'var(--text-primary)', margin: 0 }}>Schedule Management</h1>
        <div>
          {userRole === 'owner' && (
            <>
              <button 
                className="glass-btn"
                onClick={() => setOpenDialog(true)}
                style={{ marginRight: '16px' }}
              >
                Add Shift
              </button>
              <button 
                className="glass-btn"
                onClick={handleAutoGenerate}
                style={{ marginRight: '16px' }}
              >
                Auto-Generate Schedule
              </button>
            </>
          )}
          <button
            className="glass-btn"
            onClick={() => navigate('/')}
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>

      {error && (
        <div className="glass-card" style={{ marginBottom: '16px', padding: '16px', backgroundColor: 'var(--glass-danger)', color: 'var(--text-primary)' }}>
          {error}
          <button onClick={() => setError(null)} style={{ float: 'right', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>×</button>
        </div>
      )}

      <div className="glass-card" style={{ padding: '16px', marginBottom: '24px' }}>
        <h2 style={{ color: 'var(--text-primary)', marginBottom: '16px' }}>Schedule Parameters</h2>
        <div style={{ display: 'flex', gap: '16px' }}>
          <div>
            <label style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Minimum Staffing</label>
            <input
              type="number"
              value={minStaffing}
              onChange={(e) => setMinStaffing(Number(e.target.value))}
              className="glass-input"
              style={{ width: '200px' }}
            />
          </div>
          <div>
            <label style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Maximum Hours</label>
            <input
              type="number"
              value={maxHours}
              onChange={(e) => setMaxHours(Number(e.target.value))}
              className="glass-input"
              style={{ width: '200px' }}
            />
          </div>
        </div>
      </div>

      <div className="glass-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', padding: '20px' }}>
        <button className="glass-btn" onClick={() => setDocIndex((docIndex + scheduleDocs.length - 1) % scheduleDocs.length)}>
          ←
        </button>
        <h2 style={{ margin: '0 16px', color: 'var(--text-primary)' }}>{scheduleDocs[docIndex].label} Schedule</h2>
        <button className="glass-btn" onClick={() => setDocIndex((docIndex + 1) % scheduleDocs.length)}>
          →
        </button>
      </div>
      
      <div className="glass-card" style={{ width: '100%', height: '80vh', overflow: 'hidden', marginBottom: '16px' }}>
        <iframe
          title={scheduleDocs[docIndex].label + ' Schedule'}
          src={scheduleDocs[docIndex].url.replace('/edit', '/preview')}
          style={{ width: '100%', height: '100%', border: 'none', background: 'white' }}
          allowFullScreen
        />
      </div>
      
      {/* Color Legend */}
      <div className="glass-card" style={{ display: 'flex', gap: '16px', marginTop: '24px', alignItems: 'center', flexWrap: 'wrap', padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div style={{ width: '16px', height: '16px', backgroundColor: 'rgba(76, 175, 80, 0.3)', borderRadius: '4px', border: '1px solid var(--glass-border)' }} />
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Leave</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div style={{ width: '16px', height: '16px', backgroundColor: 'rgba(244, 67, 54, 0.3)', borderRadius: '4px', border: '1px solid var(--glass-border)' }} />
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Court</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div style={{ width: '16px', height: '16px', backgroundColor: 'rgba(33, 150, 243, 0.3)', borderRadius: '4px', border: '1px solid var(--glass-border)' }} />
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Training</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div style={{ width: '16px', height: '16px', backgroundColor: 'rgba(255, 214, 0, 0.3)', borderRadius: '4px', border: '1px solid var(--glass-border)' }} />
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Overtime</span>
        </div>
      </div>

      {openDialog && (
        <div className="glass-modal" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div className="glass-card" style={{ minWidth: '320px', maxWidth: '400px', padding: '32px 24px' }}>
            <h3 style={{ color: 'var(--text-primary)', marginBottom: '18px' }}>Add New Shift</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Shift Date</label>
                <input
                  type="date"
                  value={selectedDate ? format(selectedDate, 'yyyy-MM-dd') : ''}
                  onChange={(e) => setSelectedDate(e.target.value ? new Date(e.target.value) : null)}
                  className="glass-input"
                />
              </div>
              <div>
                <label style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Start Time</label>
                <input
                  id="startTime"
                  type="time"
                  className="glass-input"
                />
              </div>
              <div>
                <label style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>End Time</label>
                <input
                  id="endTime"
                  type="time"
                  className="glass-input"
                />
              </div>
              <div>
                <label style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Shift Type</label>
                <select id="shiftType" className="glass-input" defaultValue="Day Shift">
                  <option value="Day Shift">Day Shift</option>
                  <option value="Night Shift">Night Shift</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '18px' }}>
              <button className="glass-btn" onClick={() => setOpenDialog(false)}>Cancel</button>
              <button className="glass-btn" onClick={handleAddShift}>Add</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Schedule; 