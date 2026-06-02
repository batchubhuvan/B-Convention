import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';

export default function DuePayments({ onOpenBooking }) {
  const { bookings, selectedMonth, selectedYear } = useAppStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('selected-month');

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Filters bookings that are COMPLETED and have a remaining DUE AMOUNT
  const filteredBookings = bookings.filter((b) => {
    // Strictly Completed Events Only can have active due payments!
    if (b.status !== 'Completed' || b.balanceDue <= 0) return false;

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

  const totalOutstandingDue = filteredBookings.reduce((sum, b) => sum + b.balanceDue, 0);

  const formatRupee = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="payments-card glass-panel payment-red-theme animate-fade-in">
      <div className="payment-header">
        <div className="header-info text-left">
          <h2>🚨 Outstanding Due Payments</h2>
          <p>Monitor completed events that still have a remaining unpaid balance. Outstanding amounts must be collected.</p>
        </div>

        <div className="total-summary-bubble bg-red-light">
          <span>Outstanding Selected:</span>
          <strong>{formatRupee(totalOutstandingDue)}</strong>
        </div>
      </div>

      {/* Toolbar controls */}
      <div className="payments-toolbar">
        <div className="search-group text-left">
          🔍
          <input
            type="text"
            placeholder="Search outstanding dues..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="toolbar-search-input"
          />
        </div>

        <div className="selector-group text-left">
          <label htmlFor="due-filter-select">Display Mode</label>
          <select
            id="due-filter-select"
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
            ✅ No outstanding due balances found for completed events under these filters.
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
                <th>Amount Paid</th>
                <th className="th-red">Outstanding Due</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((b) => (
                <tr key={b.id} className="table-row-hover">
                  <td className="font-bold">{b.date}</td>
                  <td>
                    <span className="slot-pill bg-purple-light">
                      {b.slot}
                    </span>
                  </td>
                  <td>{b.customerName}</td>
                  <td>+91 {b.customerPhone.slice(-10)}</td>
                  <td>{b.eventTitle}</td>
                  <td>{formatRupee(b.payableAmount)}</td>
                  <td className="text-green font-medium">{formatRupee(b.paidAmount)}</td>
                  <td className="font-bold text-red bg-red-cell">{formatRupee(b.balanceDue)}</td>
                  <td>
                    <button 
                      onClick={() => onOpenBooking(b)} 
                      className="table-action-edit-btn btn-red-action"
                      title="Open billing panel to record outstanding payment"
                    >
                      Collect Due 🪙
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
