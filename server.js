const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const XLSX = require('xlsx');
const mammoth = require('mammoth');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Enable CORS
app.use(cors());

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files from the React app build
app.use(express.static(path.join(__dirname, 'dist')));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// JWT secret key
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// In-memory storage (replace with database in production)
let schedules = [];
let users = [];
let leaveRequests = [];
let overtimeEvents = [];
let trainingRequests = [];
let courtEvents = [];

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  }
});

// Authentication routes
app.post('/api/auth/register', async (req, res) => {
  const { email, password, role } = req.body;

  if (!email.endsWith('@cnu.edu')) {
    return res.status(400).json({ error: 'Only @cnu.edu email addresses are allowed' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = {
    id: users.length + 1,
    email,
    password: hashedPassword,
    role
  };

  users.push(user);
  res.status(201).json({ message: 'User registered successfully' });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email);

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET);
  res.json({ token });
});

// Schedule routes
app.get('/api/schedules', authenticateToken, (req, res) => {
  res.json(schedules);
});

app.post('/api/schedules', authenticateToken, (req, res) => {
  try {
    const { date, startTime, endTime, type } = req.body;
    
    if (!date || !startTime || !endTime || !type) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const newSchedule = {
      id: schedules.length + 1,
      officerId: req.user.id,
      date: new Date(date),
      startTime,
      endTime,
      type,
      createdBy: req.user.id,
      createdAt: new Date()
    };

    schedules.push(newSchedule);
    io.emit('schedule-update', { type: 'add', schedule: newSchedule });
    res.status(201).json(newSchedule);
  } catch (error) {
    console.error('Error creating schedule:', error);
    res.status(500).json({ error: 'Failed to create schedule' });
  }
});

app.put('/api/schedules/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const { date, startTime, endTime, type } = req.body;
    const scheduleIndex = schedules.findIndex(s => s.id === parseInt(id));

    if (scheduleIndex === -1) {
      return res.status(404).json({ error: 'Schedule not found' });
    }

    const updatedSchedule = {
      ...schedules[scheduleIndex],
      date: date ? new Date(date) : schedules[scheduleIndex].date,
      startTime: startTime || schedules[scheduleIndex].startTime,
      endTime: endTime || schedules[scheduleIndex].endTime,
      type: type || schedules[scheduleIndex].type,
      updatedAt: new Date()
    };

    schedules[scheduleIndex] = updatedSchedule;
    io.emit('schedule-update', { type: 'update', schedule: updatedSchedule });
    res.json(updatedSchedule);
  } catch (error) {
    console.error('Error updating schedule:', error);
    res.status(500).json({ error: 'Failed to update schedule' });
  }
});

app.delete('/api/schedules/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const scheduleIndex = schedules.findIndex(s => s.id === parseInt(id));

    if (scheduleIndex === -1) {
      return res.status(404).json({ error: 'Schedule not found' });
    }

    const deletedSchedule = schedules[scheduleIndex];
    schedules.splice(scheduleIndex, 1);
    io.emit('schedule-update', { type: 'delete', scheduleId: id });
    res.json({ message: 'Schedule deleted successfully', schedule: deletedSchedule });
  } catch (error) {
    console.error('Error deleting schedule:', error);
    res.status(500).json({ error: 'Failed to delete schedule' });
  }
});

// Leave request routes
app.post('/api/leave', authenticateToken, upload.single('document'), (req, res) => {
  const { startDate, endDate, type, hours } = req.body;
  const newRequest = {
    id: leaveRequests.length + 1,
    officerId: req.user.id,
    startDate,
    endDate,
    type,
    hours,
    status: 'pending',
    documentUrl: req.file ? `/uploads/${req.file.filename}` : null
  };
  leaveRequests.push(newRequest);
  io.emit('leave-update', { type: 'add', request: newRequest });
  res.json(newRequest);
});

// Overtime routes
app.get('/api/overtime', authenticateToken, (req, res) => {
  res.json(overtimeEvents);
});

app.get('/api/overtime/mine', authenticateToken, (req, res) => {
  const myEvents = overtimeEvents.filter(ev => ev.signups && ev.signups.includes(req.user.id));
  res.json(myEvents);
});

app.post('/api/overtime', authenticateToken, (req, res) => {
  const { date, hours, description, required, location, event } = req.body;
  const newEvent = {
    id: overtimeEvents.length + 1,
    officerId: req.user.id,
    date,
    hours,
    description,
    required: required || 1,
    location: location || '',
    event: event || '',
    signups: [],
    status: 'available'
  };
  overtimeEvents.push(newEvent);
  io.emit('overtime-update', { type: 'add', event: newEvent });
  res.json(newEvent);
});

app.post('/api/overtime/:id/signup', authenticateToken, (req, res) => {
  const { id } = req.params;
  const event = overtimeEvents.find(ev => ev.id === parseInt(id));
  if (!event) {
    return res.status(404).json({ error: 'Event not found' });
  }
  if (!event.signups) event.signups = [];
  if (event.signups.includes(req.user.id)) {
    return res.status(400).json({ error: 'Already signed up' });
  }
  if (event.signups.length >= event.required) {
    return res.status(400).json({ error: 'Event is full' });
  }
  event.signups.push(req.user.id);
  io.emit('overtime-update', { type: 'signup', eventId: event.id, officerId: req.user.id });
  res.json(event);
});

// Training routes
app.post('/api/training', authenticateToken, upload.single('document'), (req, res) => {
  const { title, date, duration, location } = req.body;
  const newTraining = {
    id: trainingRequests.length + 1,
    officerId: req.user.id,
    title,
    date,
    duration,
    location,
    status: 'pending',
    documentUrl: req.file ? `/uploads/${req.file.filename}` : null
  };
  trainingRequests.push(newTraining);
  io.emit('training-update', { type: 'add', training: newTraining });
  res.json(newTraining);
});

// Court routes
app.post('/api/court', authenticateToken, upload.single('subpoena'), (req, res) => {
  const { date, time, location, caseNumber } = req.body;
  const newCourt = {
    id: courtEvents.length + 1,
    officerId: req.user.id,
    date,
    time,
    location,
    caseNumber,
    subpoenaUrl: req.file ? `/uploads/${req.file.filename}` : null
  };
  courtEvents.push(newCourt);
  io.emit('court-update', { type: 'add', court: newCourt });
  res.json(newCourt);
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected');
  
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Catch-all to serve React's index.html for any non-API route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Commented out the default Hello World route to allow React app to be served
// app.get('/', (req, res) => {
//   res.send('Hello World');
// });

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 