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
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-blue-900 text-white flex flex-col py-6 px-2">
        <div className="mb-8 text-2xl font-bold text-center">CNU Scheduler App</div>
        <nav className="flex-1">
          {sidebarTabs.map(tab => (
            <Link
              key={tab.name}
              to={tab.path}
              className={`block px-4 py-2 rounded mb-2 hover:bg-blue-700 transition ${location.pathname.startsWith(tab.path) ? 'bg-blue-700 font-semibold' : ''}`}
            >
              {tab.name}
            </Link>
          ))}
        </nav>
      </aside>
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Notification Bar */}
        <div className="bg-yellow-200 text-yellow-900 py-2 px-4 flex items-center overflow-x-auto whitespace-nowrap border-b border-yellow-300 animate-marquee">
          <div className="flex space-x-8">
            {notifications.map((note, idx) => (
              <span key={idx} className="font-medium">{note}</span>
            ))}
          </div>
        </div>
        {/* Print & Share Buttons */}
        <div className="flex justify-end items-center gap-2 p-4 bg-white border-b">
          <button onClick={handlePrint} className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">Print</button>
          <button onClick={handleShare} className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700">Share</button>
        </div>
        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout; 