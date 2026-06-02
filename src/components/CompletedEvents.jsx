import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';

export default function CompletedEvents({ onOpenBooking }) {
  const bookings = useAppStore((state) => state.bookings);
  const selectedMonth = useAppStore((state) => state.selectedMonth);
  const selectedYear = useAppStore((state) => state.selectedYear);

  // States
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('selected-month');

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Filter Bookings
  const filteredBookings = bookings.filter((b) => {
    if (b.status !== 'Completed') return false;

    // Selection filter type
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

  const formatRupee = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="payments-card glass-panel animate-fade-in">
      <div className="payment-header">
        <div className="header-info text-left">
          <h2>✅ Completed Events Archives</h2>
          <p>Historical archive list of wedding and convention events that have completed.</p>
        </div>

        <div className="total-summary-bubble bg-green-light">
          <span>Completed Events:</span>
          <strong>{filteredBookings.length}</strong>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="payments-toolbar">
        <div className="search-group text-left">
          🔍
          <input
            type="text"
            placeholder="Search completed events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="toolbar-search-input"
          />
        </div>

        <div className="selector-group text-left">
          <label htmlFor="completed-filter-select">Display Mode</label>
          <select
            id="completed-filter-select"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="theme-dropdown themed-select"
          >
            <option value="selected-month" className="themed-option">Selected Month & Year ({monthNames[selectedMonth]} {selectedYear})</option>
            <option value="all-history" className="themed-option">All Bookings / Complete History</option>
          </select>
        </div>
      </div>

      {/* Completed Events Table */}
      <div className="table-responsive-container">
        {filteredBookings.length === 0 ? (
          <div className="no-records-banner text-muted">
            ✅ No completed events found for the selected filters.
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
                <th>Guests</th>
                <th>Workers</th>
                <th>Total Paid</th>
                <th>Outstanding Due</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((b) => (
                <tr key={b.id} className="table-row-hover">
                  <td className="font-bold">{b.date}</td>
                  <td>
                    <span className="slot-pill bg-completed-slot">
                      {b.slot}
                    </span>
                  </td>
                  <td>{b.customerName}</td>
                  <td>+91 {b.customerPhone.slice(-10)}</td>
                  <td>{b.eventTitle}</td>
                  <td>👥 {b.personsAttending}</td>
                  <td>👷 {b.workersNeeded}</td>
                  <td className="text-green font-medium">{formatRupee(b.paidAmount)}</td>
                  <td className={b.balanceDue > 0 ? 'text-red font-bold' : 'text-green font-medium'}>
                    {b.balanceDue > 0 ? formatRupee(b.balanceDue) : 'Cleared ✓'}
                  </td>
                  <td>
                    <button onClick={() => onOpenBooking(b)} className="table-action-edit-btn">
                      Edit Billing ✏️
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
