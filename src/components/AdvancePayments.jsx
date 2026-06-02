import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';

export default function AdvancePayments({ onOpenBooking }) {
  const { bookings, selectedMonth, selectedYear } = useAppStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('selected-month');

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const filteredBookings = bookings.filter((b) => {
    if (b.advancePaid <= 0) return false;

    if (filterType === 'selected-month') {
      const bookingDate = new Date(b.date);
      if (bookingDate.getMonth() !== selectedMonth || bookingDate.getFullYear() !== selectedYear) {
        return false;
      }
    }

    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      const matchName = b.customerName.toLowerCase().includes(query);
      const matchPhone = b.customerPhone.includes(query);
      const matchEvent = b.eventTitle.toLowerCase().includes(query);
      return matchName || matchPhone || matchEvent;
    }

    return true;
  });

  const totalAdvancesCollected = filteredBookings.reduce((sum, b) => sum + b.advancePaid, 0);

  const formatRupee = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="payments-card glass-panel payment-green-theme animate-fade-in">
      <div className="payment-header">
        <div className="header-info text-left">
          <h2>💵 Advance Payments Registry</h2>
          <p>Review deposit bookings that have fulfilled the compulsory 20% advance payment rule.</p>
        </div>

        <div className="total-summary-bubble bg-green-light">
          <span>Advances Selected:</span>
          <strong>{formatRupee(totalAdvancesCollected)}</strong>
        </div>
      </div>

      {/* Toolbar filters */}
      <div className="payments-toolbar">
        <div className="search-group text-left">
          🔍
          <input
            type="text"
            placeholder="Search by name, phone, or event..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="toolbar-search-input"
          />
        </div>

        <div className="selector-group text-left">
          <label htmlFor="advance-filter-select">Display Mode</label>
          <select
            id="advance-filter-select"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="theme-dropdown themed-select"
          >
            <option value="selected-month" className="themed-option">Selected Month & Year ({monthNames[selectedMonth]} {selectedYear})</option>
            <option value="all-history" className="themed-option">All Bookings / Complete History</option>
          </select>
        </div>
      </div>

      <div className="table-responsive-container">
        {filteredBookings.length === 0 ? (
          <div className="no-records-banner">
            📁 No advance payments found for the selected filters.
          </div>
        ) : (
          <table className="payments-table standard-table">
            <thead>
              <tr>
                <th>Event Date</th>
                <th>Shift</th>
                <th>Customer Name</th>
                <th>Phone Number</th>
                <th>Event Title</th>
                <th>Total Payable</th>
                <th className="th-green">Advance Paid</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((b) => (
                <tr key={b.id} className="table-row-hover">
                  <td className="font-bold">{b.date}</td>
                  <td>
                    <span className={`slot-pill ${b.slot === 'Full Day' ? 'bg-purple-light' : b.slot === 'Morning' ? 'bg-orange-light' : 'bg-blue-light'}`}>
                      {b.slot}
                    </span>
                  </td>
                  <td>{b.customerName}</td>
                  <td>+91 {b.customerPhone.slice(-10)}</td>
                  <td>{b.eventTitle}</td>
                  <td className="font-medium">{formatRupee(b.payableAmount)}</td>
                  <td className="font-bold text-green">{formatRupee(b.advancePaid)}</td>
                  <td>
                    <span className={`status-pill ${b.status === 'Completed' ? 'status-green' : 'status-amber'}`}>
                      {b.status}
                    </span>
                  </td>
                  <td>
                    <button onClick={() => onOpenBooking(b)} className="table-action-edit-btn">
                      Edit ✏️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
