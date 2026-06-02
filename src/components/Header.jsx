import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Link, useLocation } from 'react-router';

export default function Header() {
  const { 
    currentUser, 
    logout, 
    branding, 
    notifications,
    dismissNotification
  } = useAppStore();

  const [showNotifDrawer, setShowNotifDrawer] = useState(false);

  // Dynamic branding text styling mapped to Tailwind properties
  const brandingStyle = {
    fontFamily: branding.style.fontFamily === 'Outfit' ? '"Outfit", sans-serif' : branding.style.fontFamily === 'Inter' ? '"Inter", sans-serif' : 'sans-serif',
    fontSize: branding.style.fontSize || '28px',
    fontWeight: 'bold',
    background: `linear-gradient(135deg, ${branding.style.gradientStart || '#d4af37'}, ${branding.style.gradientEnd || '#f9d976'})`,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    textShadow: `0px 2px ${branding.style.glowStrength || '10px'} ${branding.style.shadowColor || 'rgba(212, 175, 55, 0.4)'}`,
    display: 'inline-block',
    letterSpacing: '-0.5px',
    transition: 'all 0.4s ease'
  };

  const tabs = [
    { id: 'calendar', label: '📅 Dashboard', permissionRequired: false },
    { id: 'bookings', label: '📋 Bookings', permissionRequired: false },
    { id: 'completed', label: '✅ Completed', permissionRequired: false },
    { id: 'advance', label: '💵 Advances', permissionRequired: false, isGreen: true },
    { id: 'due', label: '🚨 Due Payments', permissionRequired: false, isRed: true },
    { id: 'recycle', label: '🗑️ Recycle Bin', permissionRequired: false },
    { id: 'settings', label: '⚙️ Settings', permissionRequired: true }
  ];

  const visibleTabs = tabs.filter(tab => {
    if (tab.permissionRequired && !currentUser?.isMainAdmin) {
      return false;
    }
    return true;
  });

  const handleDismissNotif = (e, id) => {
    e.stopPropagation();
    dismissNotification(id);
  };

  return (
    <header className="main-header w-full">
      <div className="header-top-bar">
        {/* Top-Left Logo */}
        <div className="flex items-center">
          <span style={brandingStyle}>
            {branding.conventionName}
          </span>
        </div>

        {/* Top-Right Widget */}
        {currentUser && (
          <div className="user-profile-widget">
            
            {/* Notification Bell */}
            <div className="notification-bell-container">
              <button 
                className={`notif-bell-btn ${notifications.length > 0 ? 'animate-wiggle' : ''}`}
                onClick={() => setShowNotifDrawer(!showNotifDrawer)}
                title="System Notifications"
              >
                🔔
                {notifications.length > 0 && (
                  <span className="notif-badge-bubble">
                    {notifications.length}
                  </span>
                )}
              </button>

              {/* Floating Notification Panel */}
              {showNotifDrawer && (
                <div className="notif-floating-drawer animate-slide-down">
                  <div className="drawer-header bg-slate-900/60">
                    <h3>Notifications</h3>
                    <button className="close-btn" onClick={() => setShowNotifDrawer(false)}>×</button>
                  </div>
                  <div className="drawer-body">
                    {notifications.length === 0 ? (
                      <p className="no-notifs">No new notifications. Everything clear!</p>
                    ) : (
                      notifications.map((n) => (
                        <div key={n.id} className="notif-item">
                          <span className="notif-emoji">💬</span>
                          <div className="notif-info">
                            <p>{n.message}</p>
                            <small>{n.time}</small>
                          </div>
                          <button 
                            className="dismiss-notif-btn" 
                            onClick={(e) => handleDismissNotif(e, n.id)}
                            title="Clear alert for yourself"
                          >
                            ❌
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile */}
            <div className="user-badge">
              <span className="text-base">{currentUser.isMainAdmin ? '👑' : '👤'}</span>
              <div className="user-meta">
                <span className="user-display-name">{currentUser.name}</span>
                <span className="user-display-phone">{currentUser.isMainAdmin ? 'Main Admin (Owner)' : 'Sub-Admin'}</span>
              </div>
            </div>

            {/* Logout button */}
            <button onClick={logout} className="logout-btn" title="Sign Out">
              Logout 📤
            </button>
          </div>
        )}
      </div>

      {/* Navigation Tabs Bar */}
      {currentUser && (() => {
        const location = useLocation();
        const currentPath = location.pathname;
        return (
          <nav className="header-navigation-tabs">
            <div className="tabs-flex">
              {visibleTabs.map((tab) => {
                let classNames = 'nav-tab-btn ';
                const isActive = tab.id === 'calendar' ? currentPath === '/' : currentPath === `/${tab.id}`;
                
                if (isActive) {
                  if (tab.isGreen) {
                    classNames += 'active-green-tab';
                  } else if (tab.isRed) {
                    classNames += 'active-red-tab';
                  } else {
                    classNames += 'active-tab';
                  }
                } else {
                  if (tab.isGreen) {
                    classNames += 'hover-green-tab';
                  } else if (tab.isRed) {
                    classNames += 'hover-red-tab';
                  }
                }

                return (
                  <Link
                    key={tab.id}
                    to={tab.id === 'calendar' ? '/' : `/${tab.id}`}
                    className={classNames}
                  >
                    {tab.label}
                  </Link>
                );
              })}
            </div>
          </nav>
        );
      })()}
    </header>
  );
}
