import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import './Layout.css';
import { useState } from 'react';

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
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
            <img src="/assets/badge.png" alt="CNU Police Badge" style={{ width: 40, height: 40, objectFit: 'contain' }} />
          </div>
          <div className="sidebar-title">
            <h1>CNU POLICE</h1>
            <h2>Scheduler App</h2>
          </div>
          {/* Hamburger Icon */}
          <button
            className="sidebar-hamburger"
            aria-label="Open navigation menu"
            aria-controls="sidebar-nav"
            aria-expanded={sidebarOpen}
            onClick={() => setSidebarOpen((open) => !open)}
            style={{ display: 'none' }}
          >
            <span style={{ fontSize: 28, lineHeight: 1 }}>&#9776;</span>
          </button>
        </div>
        <nav
          id="sidebar-nav"
          className={`sidebar-nav${sidebarOpen ? ' open' : ''}`}
          aria-label="Main navigation"
        >
          {sidebarTabs.map(tab => (
            <Link
              key={tab.name}
              to={tab.path}
              className={`glass-nav-item ${location.pathname.startsWith(tab.path) ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
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