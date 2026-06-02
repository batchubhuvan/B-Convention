import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';

export default function Calendar({ onOpenBooking }) {
  const { 
    bookings, 
    selectedMonth, 
    setSelectedMonth, 
    selectedYear, 
    setSelectedYear 
  } = useAppStore();

  const [selectedDayNum, setSelectedDayNum] = useState(null);
  const [showDayDrawer, setShowDayDrawer] = useState(false);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Generate years from 2023 to 2200
  const startYear = 2023;
  const endYear = 2200;
  const yearsList = [];
  for (let y = startYear; y <= endYear; y++) {
    yearsList.push(y);
  }

  // Get calendar parameters for rendering
  const firstDayIndex = new Date(selectedYear, selectedMonth, 1).getDay();
  const totalDays = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  const prevMonthTotalDays = new Date(selectedYear, selectedMonth, 0).getDate();

  // Create grid cells array
  const calendarCells = [];

  // Padding cells from previous month
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    calendarCells.push({
      day: prevMonthTotalDays - i,
      isCurrentMonth: false,
      monthOffset: -1
    });
  }

  // Current month cells
  for (let i = 1; i <= totalDays; i++) {
    calendarCells.push({
      day: i,
      isCurrentMonth: true,
      monthOffset: 0
    });
  }

  // Padding cells for next month
  const totalGridCells = 42; // standard 6 rows
  const remainingCells = totalGridCells - calendarCells.length;
  for (let i = 1; i <= remainingCells; i++) {
    calendarCells.push({
      day: i,
      isCurrentMonth: false,
      monthOffset: 1
    });
  }

  // Format date helper: YYYY-MM-DD
  const getCellFormattedDate = (dayNum, offset) => {
    let year = selectedYear;
    let month = selectedMonth + offset;
    
    if (month < 0) {
      month = 11;
      year -= 1;
    } else if (month > 11) {
      month = 0;
      year += 1;
    }
    
    const formattedMonth = String(month + 1).padStart(2, '0');
    const formattedDay = String(dayNum).padStart(2, '0');
    return `${year}-${formattedMonth}-${formattedDay}`;
  };

  const getBookingsOnDate = (dateStr) => {
    return bookings.filter(b => b.date === dateStr);
  };

  const handleDayCellClick = (cell) => {
    if (!cell.isCurrentMonth) return;
    setSelectedDayNum(cell.day);
    setShowDayDrawer(true);
  };

  const handleAddNewBooking = (dateStr, slot) => {
    setShowDayDrawer(false);
    onOpenBooking(null, { date: dateStr, slot });
  };

  const handleEditBooking = (bookingItem) => {
    setShowDayDrawer(false);
    onOpenBooking(bookingItem);
  };

  // Build the day details popup drawer details with no vertical sliders
  const renderDayDrawer = () => {
    if (!selectedDayNum) return null;
    
    const dateStr = getCellFormattedDate(selectedDayNum, 0);
    const dayBookings = getBookingsOnDate(dateStr);
    
    const morningBooking = dayBookings.find(b => b.slot === 'Morning');
    const nightBooking = dayBookings.find(b => b.slot === 'Night');
    const fullDayBooking = dayBookings.find(b => b.slot === 'Full Day');

    return (
      <div 
        className="day-drawer-overlay animate-fade-in" 
        onClick={() => setShowDayDrawer(false)}
      >
        <div 
          className="day-drawer-card glass-drawer flex flex-col" 
          onClick={(e) => e.stopPropagation()}
        >
          <div className="drawer-header bg-slate-900/40">
            <div className="text-left">
              <h3>📅 Daily Schedule</h3>
              <p className="subtitle">{selectedDayNum} {monthNames[selectedMonth]} {selectedYear}</p>
            </div>
            <button className="close-drawer-btn cursor-pointer" onClick={() => setShowDayDrawer(false)}>×</button>
          </div>

          <div className="drawer-body-compact">
            
            {/* 1. Full Day Shift Detail */}
            <div className="slot-detail-row-compact">
              <div className="slot-header-compact">
                <span className="slot-pill bg-purple-light">
                  Full Day Event (Marriage)
                </span>
              </div>
              {fullDayBooking ? (
                <div className="booked-slot-info-compact">
                  <div className="booked-meta-compact">
                    <strong>{fullDayBooking.eventTitle}</strong>
                    <span>{fullDayBooking.customerName} (+91 {fullDayBooking.customerPhone.slice(-10)})</span>
                    <span>👥 {fullDayBooking.personsAttending} | 👷 {fullDayBooking.workersNeeded}</span>
                  </div>
                  <button onClick={() => handleEditBooking(fullDayBooking)} className="slot-action-btn-compact edit">Edit ✏️</button>
                </div>
              ) : (
                <div className="empty-slot-info-compact">
                  <span>Available</span>
                  {(!morningBooking && !nightBooking) ? (
                    <button 
                      onClick={() => handleAddNewBooking(dateStr, 'Full Day')} 
                      className="slot-action-btn-compact add"
                    >
                      Book Slot ➕
                    </button>
                  ) : (
                    <span style={{ fontSize: '11px', color: '#475569', fontWeight: 'bold' }}>Blocked (Shift Booked)</span>
                  )}
                </div>
              )}
            </div>

            {/* 2. Morning Shift Detail */}
            <div className="slot-detail-row-compact">
              <div className="slot-header-compact">
                <span className="slot-pill bg-orange-light">
                  Morning Shift (5 AM - 4 PM)
                </span>
              </div>
              {morningBooking ? (
                <div className="booked-slot-info-compact">
                  <div className="booked-meta-compact">
                    <strong>{morningBooking.eventTitle}</strong>
                    <span>{morningBooking.customerName} (+91 {morningBooking.customerPhone.slice(-10)})</span>
                    <span>👥 {morningBooking.personsAttending} | 👷 {morningBooking.workersNeeded}</span>
                  </div>
                  <button onClick={() => handleEditBooking(morningBooking)} className="slot-action-btn-compact edit">Edit ✏️</button>
                </div>
              ) : (
                <div className="empty-slot-info-compact">
                  <span>Available</span>
                  {!fullDayBooking ? (
                    <button 
                      onClick={() => handleAddNewBooking(dateStr, 'Morning')} 
                      className="slot-action-btn-compact add"
                    >
                      Book Slot ➕
                    </button>
                  ) : (
                    <span style={{ fontSize: '11px', color: '#475569', fontWeight: 'bold' }}>Blocked (Full Day Booked)</span>
                  )}
                </div>
              )}
            </div>

            {/* 3. Night Shift Detail */}
            <div className="slot-detail-row-compact">
              <div className="slot-header-compact">
                <span className="slot-pill bg-blue-light">
                  Night Shift (4 PM - 11 PM)
                </span>
              </div>
              {nightBooking ? (
                <div className="booked-slot-info-compact">
                  <div className="booked-meta-compact">
                    <strong>{nightBooking.eventTitle}</strong>
                    <span>{nightBooking.customerName} (+91 {nightBooking.customerPhone.slice(-10)})</span>
                    <span>👥 {nightBooking.personsAttending} | 👷 {nightBooking.workersNeeded}</span>
                  </div>
                  <button onClick={() => handleEditBooking(nightBooking)} className="slot-action-btn-compact edit">Edit ✏️</button>
                </div>
              ) : (
                <div className="empty-slot-info-compact">
                  <span>Available</span>
                  {!fullDayBooking ? (
                    <button 
                      onClick={() => handleAddNewBooking(dateStr, 'Night')} 
                      className="slot-action-btn-compact add"
                    >
                      Book Slot ➕
                    </button>
                  ) : (
                    <span style={{ fontSize: '11px', color: '#475569', fontWeight: 'bold' }}>Blocked (Full Day Booked)</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="calendar-card glass-panel animate-fade-in">
      
      {/* Calendar Header Controls */}
      <div className="calendar-controls-bar">
        <div className="calendar-title-info text-left">
          <h2>📅 Bookings Calendar</h2>
          <p>Select Month & Year from dropdowns to manage convention bookings</p>
        </div>

        <div className="controls-selectors">
          <div className="selector-group">
            <label htmlFor="calendar-month-select">Month</label>
            <select
              id="calendar-month-select"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="theme-dropdown themed-select"
            >
              {monthNames.map((name, index) => (
                <option key={name} value={index} className="themed-option">{name}</option>
              ))}
            </select>
          </div>

          <div className="selector-group">
            <label htmlFor="calendar-year-select">Year</label>
            <select
              id="calendar-year-select"
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="theme-dropdown themed-select"
            >
              {yearsList.map((y) => (
                <option key={y} value={y} className="themed-option">{y}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Weekday Grid */}
      <div className="calendar-weekdays-grid">
        {weekdays.map((day) => (
          <div key={day} className="weekday-header-cell">{day}</div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="calendar-days-grid">
        {calendarCells.map((cell, index) => {
          const dateStr = getCellFormattedDate(cell.day, cell.monthOffset);
          const dayBookings = getBookingsOnDate(dateStr);
          
          const hasMorning = dayBookings.some(b => b.slot === 'Morning');
          const hasNight = dayBookings.some(b => b.slot === 'Night');
          const hasFullDay = dayBookings.some(b => b.slot === 'Full Day');

          const isMorningCompleted = dayBookings.find(b => b.slot === 'Morning')?.status === 'Completed';
          const isNightCompleted = dayBookings.find(b => b.slot === 'Night')?.status === 'Completed';
          const isFullDayCompleted = dayBookings.find(b => b.slot === 'Full Day')?.status === 'Completed';

          let cellClassName = 'calendar-day-cell hover-glow ';
          
          if (!cell.isCurrentMonth) {
            cellClassName += 'out-of-month';
          }

          const today = new Date();
          const isToday = cell.isCurrentMonth && 
                          today.getDate() === cell.day && 
                          today.getMonth() === selectedMonth && 
                          today.getFullYear() === selectedYear;

          if (isToday) {
            cellClassName += ' cell-today';
          }

          return (
            <div 
              key={index} 
              className={cellClassName}
              onClick={() => handleDayCellClick(cell)}
            >
              <div className="day-number-label">{cell.day}</div>
              
              <div className="cell-indicators-container">
                {hasFullDay ? (
                  <div className={`cell-banner-full-day ${isFullDayCompleted ? 'completed-banner' : 'booked-banner'}`}>
                    💒 Full Day
                  </div>
                ) : (
                  <>
                    {hasMorning && (
                      <div className={`cell-dot-indicator ${isMorningCompleted ? 'completed-dot' : 'booked-dot'}`}>
                        🌅 Morning
                      </div>
                    )}
                    {hasNight && (
                      <div className={`cell-dot-indicator ${isNightCompleted ? 'completed-dot' : 'booked-dot'}`}>
                        🌃 Night
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="calendar-legend-bar">
        <span className="legend-title">Legend:</span>
        <div className="legend-item">
          <span className="legend-color-box bg-gray"></span> Available
        </div>
        <div className="legend-item">
          <span className="legend-color-box bg-orange"></span> Booked
        </div>
        <div className="legend-item">
          <span className="legend-color-box bg-green"></span> Completed
        </div>
        <div className="legend-item">
          <span className="legend-color-box bg-purple"></span> Full Day Lockout
        </div>
      </div>

      {/* Floating Day Drawer Details */}
      {showDayDrawer && renderDayDrawer()}
    </div>
  );
}
