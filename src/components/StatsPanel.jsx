import React from 'react';
import { useAppStore } from '../store/useAppStore';

export default function StatsPanel() {
  const { bookings, selectedMonth, selectedYear } = useAppStore();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Filter bookings in the active Month & Year
  const filteredBookings = bookings.filter(b => {
    const bookingDate = new Date(b.date);
    return bookingDate.getMonth() === selectedMonth && bookingDate.getFullYear() === selectedYear;
  });

  const totalBookings = filteredBookings.length;
  
  const completedEvents = filteredBookings.filter(b => b.status === 'Completed').length;
  
  const totalRevenue = filteredBookings.reduce((sum, b) => sum + (Number(b.paidAmount) || 0), 0);
  
  // Outstanding Due: strictly completed events only have outstanding active due amount!
  const totalDue = filteredBookings
    .filter(b => b.status === 'Completed')
    .reduce((sum, b) => sum + (Number(b.balanceDue) || 0), 0);

  const formatRupee = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="stats-dashboard-container animate-fade-in">
      <div className="stats-header-info text-left">
        <h3>📊 Monthly Performance Summary</h3>
        <p className="subtitle">
          Overview for <strong>{monthNames[selectedMonth]} {selectedYear}</strong>
        </p>
      </div>

      <div className="stats-cards-grid">
        {/* Card 1: Total Bookings */}
        <div className="stats-card glass-panel">
          <div className="stats-card-icon text-yellow-500">📅</div>
          <div className="stats-card-data">
            <span className="stats-card-value">{totalBookings}</span>
            <span className="stats-card-label">Events Booked</span>
          </div>
        </div>

        {/* Card 2: Completed Events */}
        <div className="stats-card glass-panel">
          <div className="stats-card-icon text-green">✅</div>
          <div className="stats-card-data">
            <span className="stats-card-value">{completedEvents}</span>
            <span className="stats-card-label">Completed Events</span>
          </div>
        </div>

        {/* Card 3: Total Revenue Collected */}
        <div className="stats-card glass-panel stats-green-border">
          <div className="stats-card-icon text-green">💰</div>
          <div className="stats-card-data">
            <span className="stats-card-value text-green">{formatRupee(totalRevenue)}</span>
            <span className="stats-card-label">Revenue Collected</span>
          </div>
        </div>

        {/* Card 4: Total Outstanding Due */}
        <div className="stats-card glass-panel stats-red-border">
          <div className="stats-card-icon text-red">🚨</div>
          <div className="stats-card-data">
            <span className="stats-card-value text-red">{formatRupee(totalDue)}</span>
            <span className="stats-card-label">Outstanding Due</span>
          </div>
        </div>
      </div>
    </div>
  );
}
