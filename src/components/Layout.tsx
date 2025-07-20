import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import './Layout.css';

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
    <div className="layout-container">
      {/* Sidebar */}
      <aside className="glass-sidebar">
        <div className="sidebar-header">
          <div className="glass-logo">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 5L25 15H35L27.5 22.5L30 32.5L20 27.5L10 32.5L12.5 22.5L5 15H15L20 5Z" fill="#1e3c72"/>
            </svg>
          </div>
          <div className="sidebar-title">
            <h1>CNU POLICE</h1>
            <h2>Scheduler App</h2>
          </div>
        </div>
        <nav className="sidebar-nav">
          {sidebarTabs.map(tab => (
            <Link
              key={tab.name}
              to={tab.path}
              className={`glass-nav-item ${location.pathname.startsWith(tab.path) ? 'active' : ''}`}
            >
              {tab.name}
            </Link>
          ))}
        </nav>
      </aside>
      {/* Main Content */}
      <div className="main-content">
        {/* Notification Bar */}
        <div className="notification-bar glass-card">
          <div className="notification-content">
            {notifications.map((note, idx) => (
              <span key={idx} className="notification-item">{note}</span>
            ))}
          </div>
        </div>
        {/* Print & Share Buttons */}
        <div className="action-bar glass-card">
          <button onClick={handlePrint} className="glass-btn">Print</button>
          <button onClick={handleShare} className="glass-btn">Share</button>
        </div>
        {/* Page Content */}
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout; 