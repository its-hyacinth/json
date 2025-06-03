# CNUPD Scheduler

A comprehensive scheduling system for the Christopher Newport University Police Department.

## Features

- Monthly schedule grid with color-coded events
- Interactive calendar with auto-generation capabilities
- Leave request management with document upload
- Overtime event management
- Training request system
- Court appearance tracking
- Role-based access control
- Real-time notifications
- Print & Share functionality
- Dark mode support

## Tech Stack

- Frontend: React + TypeScript + Material-UI + Tailwind CSS
- Backend: Node.js + Express
- Real-time: Socket.IO
- Authentication: JWT
- File Upload: Multer
- PDF Processing: pdf-parse
- Excel Processing: xlsx
- Word Processing: mammoth

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- XAMPP (if using PHP/MySQL)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/cnupd-scheduler.git
   cd cnupd-scheduler
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory:
   ```
   PORT=3000
   JWT_SECRET=your-secret-key
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

The application will be available at:
- Frontend: http://localhost:5173
- Backend: http://localhost:3000

## Building for Production

1. Build the frontend:
   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm start
   ```

## Project Structure

```
cnupd-scheduler/
├── src/                    # React frontend source
│   ├── components/         # Reusable components
│   ├── pages/             # Page components
│   ├── App.tsx            # Main app component
│   └── main.tsx           # Entry point
├── public/                # Static assets
├── server.js              # Express backend
├── uploads/               # File uploads directory
└── package.json           # Dependencies and scripts
```

## API Endpoints

### Authentication
- POST /api/auth/register - Register new user
- POST /api/auth/login - User login

### Schedules
- GET /api/schedules - Get all schedules
- POST /api/schedules - Create new schedule

### Leave Requests
- POST /api/leave - Submit leave request
- GET /api/leave - Get leave requests

### Overtime
- POST /api/overtime - Create overtime event
- GET /api/overtime - Get overtime events

### Training
- POST /api/training - Submit training request
- GET /api/training - Get training requests

### Court
- POST /api/court - Submit court appearance
- GET /api/court - Get court appearances

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@cnupd.edu or create an issue in the repository. 