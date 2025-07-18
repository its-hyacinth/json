import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';

const sidebarTabs = [
  { name: 'Dashboard', path: '/dashboard' },
  { name: 'Schedule', path: '/schedule' },
  { name: 'Overtime', path: '/overtime' },
  { name: 'Leave Requests', path: '/leave' },
  { name: 'Training Requests', path: '/training' },
  { name: 'Court', path: '/court' },
  { name: 'Accounts', path: '/accounts' },
  { name: 'Settings', path: '/settings' },
];

const Layout: React.FC = () => {
  const location = useLocation();

  // Placeholder notifications
  const notifications = [
    'Pending leave request for Officer Smith',
    'Schedule updated for July 2025',
    'Supervisor approval needed for training',
  ];

  // Print and Share handlers (stub)
  const handlePrint = () => window.print();
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'CNU Scheduler',
        url: window.location.href,
      });
    } else {
      alert('Share not supported on this browser.');
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-primary text-white flex flex-col py-8 px-2 shadow-lg">
        <div className="mb-10 text-2xl font-bold text-center tracking-wide uppercase">CNU Scheduler App</div>
        <nav className="flex-1">
          {sidebarTabs.map(tab => (
            <Link
              key={tab.name}
              to={tab.path}
              className={`block px-5 py-3 rounded-lg mb-2 transition font-semibold tracking-wide text-base uppercase ${location.pathname.startsWith(tab.path) ? 'bg-blue-700 text-white shadow font-bold' : 'hover:bg-blue-800 hover:text-white text-cnu-gray'}`}
              style={{ letterSpacing: '0.04em' }}
            >
              {tab.name}
            </Link>
          ))}
        </nav>
      </aside>
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Notification Bar */}
        <div className="bg-yellow-100 text-yellow-900 py-2 px-6 flex items-center overflow-x-auto whitespace-nowrap border-b border-yellow-300 font-semibold tracking-wide text-sm uppercase" style={{ fontFamily: 'Montserrat, Arial, Helvetica, sans-serif', letterSpacing: '0.04em' }}>
          <div className="flex space-x-8">
            {notifications.map((note, idx) => (
              <span key={idx} className="font-semibold">{note}</span>
            ))}
          </div>
        </div>
        {/* Print & Share Buttons */}
        <div className="flex justify-end items-center gap-2 p-4 bg-white border-b">
          <button onClick={handlePrint} className="px-4 py-2 bg-primary text-white rounded font-bold uppercase tracking-wide hover:bg-blue-800 transition">Print</button>
          <button onClick={handleShare} className="px-4 py-2 bg-green-600 text-white rounded font-bold uppercase tracking-wide hover:bg-green-700 transition">Share</button>
        </div>
        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout; 