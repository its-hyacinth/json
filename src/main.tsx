import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';

const Placeholder = ({ title }: { title: string }) => (
  <div className="text-2xl font-bold text-gray-800">{title} (Coming Soon)</div>
);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="schedule" element={<Placeholder title="Schedule" />} />
          <Route path="overtime" element={<Placeholder title="Overtime" />} />
          <Route path="leave" element={<Placeholder title="Leave Requests" />} />
          <Route path="training" element={<Placeholder title="Training Requests" />} />
          <Route path="court" element={<Placeholder title="Court" />} />
          <Route path="accounts" element={<Placeholder title="Accounts" />} />
          <Route path="settings" element={<Placeholder title="Settings" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);