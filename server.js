const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files
app.use(express.static('.'));
app.use('/public', express.static('public'));
app.use('/admin', express.static('admin'));
app.use('/officer', express.static('officer'));
app.use('/js', express.static('public/js'));
app.use('/css', express.static('public/css'));
app.use('/assets', express.static('assets'));

// MongoDB connection
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/cnupd_scheduler';
mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// User model
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: String,
  role: { type: String, enum: ['admin', 'supervisor', 'officer'], required: true },
});
const User = mongoose.model('User', userSchema);

// Schedule model
const scheduleSchema = new mongoose.Schema({
  officer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  shift: String, // e.g., '7', 'C', 'M', etc.
  eventType: String, // e.g., 'leave', 'training', 'court', 'overtime', etc.
  details: String,
});
const Schedule = mongoose.model('Schedule', scheduleSchema);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Serve index.html for root route
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Serve test-login.html
app.get('/test-login', (req, res) => {
  res.sendFile(__dirname + '/test-login.html');
});

// Login endpoint (demo only, hardcoded credentials)
app.post('/login', (req, res) => {
  const { email, password, role } = req.body;
  // Demo credentials
  const admin = { email: 'jason.richards@cnu.edu', password: 'admin123' };
  const employee = { email: 'sarah.wilson@cnu.edu', password: 'officer123' };

  if (
    role === 'admin' &&
    email === admin.email &&
    password === admin.password
  ) {
    return res.json({ success: true, role: 'admin' });
  }
  if (
    role === 'employee' &&
    email === employee.email &&
    password === employee.password
  ) {
    return res.json({ success: true, role: 'employee' });
  }
  return res.status(401).json({ success: false, message: 'Invalid credentials' });
});

// TODO: Add CRUD endpoints for users, schedules, requests, etc.

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 