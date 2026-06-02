import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router';
import { useAppStore } from './store/useAppStore';

// Components
import Login from './components/Login';
import Header from './components/Header';
import StatsPanel from './components/StatsPanel';
import Calendar from './components/Calendar';
import BookedEvents from './components/BookedEvents';
import CompletedEvents from './components/CompletedEvents';
import AdvancePayments from './components/AdvancePayments';
import DuePayments from './components/DuePayments';
import RecycleBin from './components/RecycleBin';
import BrandingEditor from './components/BrandingEditor';
import AdminTracker from './components/AdminTracker';
import SessionSimulator from './components/SessionSimulator';
import BookingModal from './components/BookingModal';
import PhysicsParticles from './components/PhysicsParticles';

export default function App() {
  const currentUser = useAppStore((state) => state.currentUser);
  const notifications = useAppStore((state) => state.notifications);
  const isKicked = useAppStore((state) => state.isKicked);
  const init = useAppStore((state) => state.init);

  // Initialize store listeners
  useEffect(() => {
    init();
  }, [init]);

  // Booking Modal Trigger States
  const [isOpenBooking, setIsOpenBooking] = useState(false);
  const [modalBooking, setModalBooking] = useState(null);
  const [modalDefaults, setModalDefaults] = useState(null);

  const handleOpenBookingModal = (bookingObj = null, defaultVals = null) => {
    setModalBooking(bookingObj);
    setModalDefaults(defaultVals);
    setIsOpenBooking(true);
  };

  const handleCloseBookingModal = () => {
    setIsOpenBooking(false);
    setModalBooking(null);
    setModalDefaults(null);
  };

  const handleClearKickedState = () => {
    localStorage.removeItem('main_admin_kicked');
    // Force direct refresh
    window.location.href = '/';
  };

  // Render Forced Invalidation Overlay Kicked page
  if (isKicked) {
    return (
      <div className="forced-logout-overlay animate-fade-in">
        <div className="kicked-card animate-scale-up">
          <span className="kicked-icon">🚫</span>
          <h2>Session Terminated</h2>
          <p>
            This session was logged out because the <strong>Main Admin (Owner)</strong> logged in on another device or phone tab. The owner has a strict single-session security rule.
          </p>
          <button onClick={handleClearKickedState} className="kicked-btn">
            Re-Authorize Session 🔄
          </button>
        </div>
      </div>
    );
  }

  // 1. If not authenticated, render Login Setup / Portal
  if (!currentUser) {
    return (
      <>
        <PhysicsParticles />
        <Login />
      </>
    );
  }

  return (
    <div className="main-app-container">
      {/* Background Interactive Sparks */}
      <PhysicsParticles />

      {/* Dynamic Styled Branding Header & Navigation Tabs */}
      <Header />

      {/* Main Workspace Body Content router */}
      <main className="app-workspace-body animate-fade-in">
        <Routes>
          <Route
            path="/"
            element={
              <>
                <StatsPanel />
                <Calendar onOpenBooking={handleOpenBookingModal} />
              </>
            }
          />
          <Route
            path="/bookings"
            element={<BookedEvents onOpenBooking={handleOpenBookingModal} />}
          />
          <Route
            path="/completed"
            element={<CompletedEvents onOpenBooking={handleOpenBookingModal} />}
          />
          <Route
            path="/advance"
            element={<AdvancePayments onOpenBooking={handleOpenBookingModal} />}
          />
          <Route
            path="/due"
            element={<DuePayments onOpenBooking={handleOpenBookingModal} />}
          />
          <Route
            path="/recycle"
            element={<RecycleBin />}
          />
          <Route
            path="/settings"
            element={
              currentUser.isMainAdmin ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                  <BrandingEditor />
                  <AdminTracker />
                </div>
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Floating Real-Time Notifications list on the bottom-right */}
      <div className="floating-notifications-toast-container">
        {notifications.map((notif) => (
          <div key={notif.id} className="floating-toast-alert animate-slide-down">
            <span className="alert-badge-icon">🔔</span>
            <div className="alert-content">
              <span className="alert-title">Login Alert</span>
              <p className="alert-message">{notif.message}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Simulated Device Tester Panel Drawer */}
      <SessionSimulator />

      {/* Booking Form Dialog Modal */}
      {isOpenBooking && (
        <BookingModal
          booking={modalBooking}
          defaultValues={modalDefaults}
          onClose={handleCloseBookingModal}
        />
      )}
    </div>
  );
}
