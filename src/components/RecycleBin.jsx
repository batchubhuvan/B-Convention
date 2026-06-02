import React, { useEffect, useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { db } from '../utils/db';

export default function RecycleBin() {
  const recycleBin = useAppStore((state) => state.recycleBin);
  const selectedMonth = useAppStore((state) => state.selectedMonth);
  const selectedYear = useAppStore((state) => state.selectedYear);
  
  const restoreBooking = useAppStore((state) => state.restoreBooking);
  const deleteBookingPermanently = useAppStore((state) => state.deleteBookingPermanently);
  const reloadData = useAppStore((state) => state.reloadData);

  const [filterType, setFilterType] = useState('selected-month');
  const [ticks, setTicks] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setTicks((t) => t + 1), 60000);
    return () => clearInterval(timer);
  }, []);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handleRestore = (id, name, date) => {
    try {
      restoreBooking(id);
      db.addNotification(
        `Booking for "${name}" on ${date} restored successfully!`,
        'success'
      );
      reloadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handlePermanentDelete = (id, name) => {
    if (
      !window.confirm(
        `⚠️ WARNING: Are you sure you want to permanently delete booking for "${name}"? This action CANNOT be undone.`
      )
    )
      return;
    try {
      deleteBookingPermanently(id);
      db.addNotification(
        `Booking for "${name}" permanently deleted from database.`,
        'error'
      );
      reloadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const getRemainingTime = (deletedAtStr) => {
    if (!deletedAtStr) return 'Unknown';
    const ninetyDaysMs = 90 * 24 * 60 * 60 * 1000;
    const deletedTime = new Date(deletedAtStr).getTime();
    const now = Date.now();
    const elapsed = now - deletedTime;
    const remainingMs = ninetyDaysMs - elapsed;

    if (remainingMs <= 0) {
      return 'Purging...';
    }

    const totalHours = Math.floor(remainingMs / (1000 * 60 * 60));
    const days = Math.floor(totalHours / 24);
    const hours = totalHours % 24;

    if (days > 0) {
      return `${days}d ${hours}h left`;
    } else {
      return `${hours}h left (purging soon)`;
    }
  };

  // Filters Recycle Bin
  const filteredBin = recycleBin.filter((b) => {
    if (filterType === 'selected-month') {
      const bookingDate = new Date(b.date);
      return (
        bookingDate.getMonth() === selectedMonth &&
        bookingDate.getFullYear() === selectedYear
      );
    }
    return true; // 'all-history'
  });

  const formatRupee = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="recycle-bin-card glass-panel animate-fade-in">
      <div className="recycle-header">
        <span className="recycle-logo">🗑️</span>
        <div className="header-info text-left">
          <h2>Events Recycle Bin</h2>
          <p>
            Deleted events remain here. They will automatically permanently purge in 90 days. You can also manually delete them forever at your wish.
          </p>
        </div>
      </div>

      {/* Toolbar filters */}
      <div className="payments-toolbar">
        <div className="selector-group text-left">
          <label htmlFor="bin-filter-select">Display Mode</label>
          <select
            id="bin-filter-select"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="theme-dropdown themed-select"
          >
            <option value="selected-month" className="themed-option">
              Selected Month & Year ({monthNames[selectedMonth]} {selectedYear})
            </option>
            <option value="all-history" className="themed-option">
              All Bookings / Complete History
            </option>
          </select>
        </div>
      </div>

      <div className="table-responsive-container">
        {filteredBin.length === 0 ? (
          <div className="no-records-banner text-muted">
            🗑️ Recycle Bin is empty for the selected filters.
          </div>
        ) : (
          <table className="payments-table bin-table">
            <thead>
              <tr>
                <th>Event Date</th>
                <th>Shift</th>
                <th>Customer Name</th>
                <th>Event Title</th>
                <th>Logistics</th>
                <th>Total Value</th>
                <th>Deleted On</th>
                <th className="th-warning">Purge Timer</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredBin.map((b) => (
                <tr key={b.id} className="table-row-hover">
                  <td className="font-bold text-strike">{b.date}</td>
                  <td>
                    <span className="slot-pill bg-gray-pill text-strike">{b.slot}</span>
                  </td>
                  <td className="text-strike">{b.customerName}</td>
                  <td className="text-strike">{b.eventTitle}</td>
                  <td className="font-small text-strike">
                    Guests: {b.personsAttending} <br />
                    Workers: {b.workersNeeded}
                  </td>
                  <td>{formatRupee(b.payableAmount)}</td>
                  <td>
                    {b.deletedAt
                      ? new Date(b.deletedAt).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })
                      : 'Unknown'}
                  </td>
                  <td className="font-medium text-amber animate-pulse">
                    ⏰ {getRemainingTime(b.deletedAt)}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => handleRestore(b.id, b.customerName, b.date)}
                        className="table-action-restore-btn"
                        title="Restore booking back to live calendar"
                      >
                        Restore ↩️
                      </button>
                      <button
                        onClick={() => handlePermanentDelete(b.id, b.customerName)}
                        className="revoke-btn"
                        title="Permanently erase this booking immediately"
                      >
                        Delete ❌
                      </button>
                    </div>
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
