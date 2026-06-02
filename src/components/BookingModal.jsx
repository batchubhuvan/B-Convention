import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { db } from '../utils/db';

export default function BookingModal({ booking, defaultValues, onClose }) {
  const { addBooking, updateBooking, deleteBooking, showLiveToast } = useAppStore();

  const isEdit = !!booking;

  // Form Fields - Clean defaults with no hardcoded placeholders
  const [date, setDate] = useState(isEdit ? booking.date : (defaultValues?.date || ''));
  const [slot, setSlot] = useState(isEdit ? booking.slot : (defaultValues?.slot || 'Morning'));
  const [customerName, setCustomerName] = useState(isEdit ? booking.customerName : '');
  const [customerPhone, setCustomerPhone] = useState(isEdit ? booking.customerPhone : '');
  const [eventTitle, setEventTitle] = useState(isEdit ? booking.eventTitle : '');
  const [personsAttending, setPersonsAttending] = useState(isEdit ? booking.personsAttending.toString() : '');
  const [workersNeeded, setWorkersNeeded] = useState(isEdit ? booking.workersNeeded.toString() : '');
  const [status, setStatus] = useState(isEdit ? booking.status : 'Booked');

  // Financial Subdivisions
  const [hallRent, setHallRent] = useState(isEdit ? booking.hallRent.toString() : '');
  const [power, setPower] = useState(isEdit ? booking.power.toString() : '');
  const [cleaning, setCleaning] = useState(isEdit ? booking.cleaning.toString() : '');
  const [acCharges, setAcCharges] = useState(isEdit ? booking.acCharges.toString() : '');
  const [rooms, setRooms] = useState(isEdit ? booking.rooms.toString() : '');
  const [discount, setDiscount] = useState(isEdit ? booking.discount.toString() : '');
  const [advancePaid, setAdvancePaid] = useState(isEdit ? booking.advancePaid.toString() : '');
  const [additionalPaid, setAdditionalPaid] = useState(isEdit ? booking.additionalPaid.toString() : '');

  // Computed Variables
  const [subtotal, setSubtotal] = useState(0);
  const [payableAmount, setPayableAmount] = useState(0);
  const [minAdvance, setMinAdvance] = useState(0);
  const [paidAmount, setPaidAmount] = useState(0);
  const [balanceDue, setBalanceDue] = useState(0);
  
  // Validation / Error state
  const [error, setError] = useState('');

  // Dynamically compute financials
  useEffect(() => {
    const rentVal = Number(hallRent) || 0;
    const powerVal = Number(power) || 0;
    const cleanVal = Number(cleaning) || 0;
    const acVal = Number(acCharges) || 0;
    const roomsVal = Number(rooms) || 0;
    const discVal = Number(discount) || 0;
    const advVal = Number(advancePaid) || 0;
    const addVal = Number(additionalPaid) || 0;

    const computedSubtotal = rentVal + powerVal + cleanVal + acVal + roomsVal;
    const computedPayable = Math.max(0, computedSubtotal - discVal);
    const computedMinAdvance = Math.round(computedPayable * 0.20);
    const computedPaid = advVal + addVal;
    const computedDue = Math.max(0, computedPayable - computedPaid);

    setSubtotal(computedSubtotal);
    setPayableAmount(computedPayable);
    setMinAdvance(computedMinAdvance);
    setPaidAmount(computedPaid);
    setBalanceDue(computedDue);
  }, [hallRent, power, cleaning, acCharges, rooms, discount, advancePaid, additionalPaid]);

  const handlePhoneInput = (e) => {
    const val = e.target.value.replace(/[^\d+]/g, '');
    setCustomerPhone(val);
  };

  const handleSave = (e) => {
    e.preventDefault();
    setError('');

    // Field Validations
    if (!date) return setError('Please select an event date.');
    if (!customerName.trim()) return setError('Please enter the customer name.');
    if (!customerPhone) return setError('Please enter the customer phone number.');
    if (!db.validateIndianPhone(customerPhone)) {
      return setError('Please enter a valid 10-digit Indian phone number (starting with 6,7,8, or 9).');
    }
    if (!eventTitle.trim()) return setError('Please enter the event title.');
    if (!personsAttending || Number(personsAttending) <= 0) return setError('Please enter the number of guests.');
    if (!workersNeeded || Number(workersNeeded) <= 0) return setError('Please enter the number of workers.');

    // Financial Validations
    if (Number(hallRent) <= 0) return setError('Hall Rent amount is required.');
    if (Number(power) <= 0) return setError('Power charge is required.');
    if (Number(cleaning) <= 0) return setError('Cleaning charge is required.');
    
    // 20% Compulsory Advance Validation
    if (Number(advancePaid) < minAdvance) {
      return setError(`Compulsory Rule: Advance payment must be at least 20% of the total amount. Minimum required is ₹${minAdvance.toLocaleString('en-IN')}.`);
    }

    const payload = {
      date,
      slot,
      customerName,
      customerPhone,
      eventTitle,
      personsAttending: Number(personsAttending),
      workersNeeded: Number(workersNeeded),
      status,
      hallRent: Number(hallRent),
      power: Number(power),
      cleaning: Number(cleaning),
      acCharges: Number(acCharges) || 0,
      rooms: Number(rooms) || 0,
      discount: Number(discount) || 0,
      advancePaid: Number(advancePaid),
      additionalPaid: Number(additionalPaid) || 0,
      subtotal,
      payableAmount,
      paidAmount,
      balanceDue
    };

    try {
      if (isEdit && booking) {
        updateBooking(booking.id, payload);
        showLiveToast(`Booking for "${customerName}" updated successfully.`);
      } else {
        addBooking(payload);
        showLiveToast(`New booking for "${customerName}" confirmed successfully!`);
      }

      // Trigger premium physics confetti burst!
      window.triggerConfetti?.();

      onClose();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = () => {
    if (!booking) return;
    if (!window.confirm(`Are you sure you want to delete this booking for "${customerName}"? It will be sent to the Recycle Bin.`)) return;
    try {
      deleteBooking(booking.id);
      showLiveToast(`Booking for "${customerName}" moved to Recycle Bin.`);
      onClose();
    } catch (err) {
      setError(err.message);
    }
  };

  const formatRupee = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="booking-modal-overlay animate-fade-in" onClick={onClose}>
      <div 
        className="booking-modal-card animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Header */}
        <div className="modal-header bg-slate-900/40">
          <div className="text-left">
            <h3>{isEdit ? '✏️ Edit Booking Details' : '💒 New Booking Schedule'}</h3>
            <p className="subtitle">Enter customer details and billing subdivisions.</p>
          </div>
          <button className="close-modal-btn" onClick={onClose}>×</button>
        </div>

        {error && (
          <div className="modal-error-banner animate-fade-in">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSave} className="modal-form-grid">
          
          {/* LEFT: General Info & Details */}
          <div className="form-column">
            <h4 className="section-title">1. Schedule & Logistics</h4>
            
            <div className="form-row-two">
              <div className="form-group">
                <label>Event Date</label>
                <input 
                  type="date" 
                  value={date} 
                  onChange={(e) => setDate(e.target.value)} 
                  className="theme-input font-bold"
                  required
                />
              </div>

              <div className="form-group">
                <label>Shift Slot</label>
                <select 
                  value={slot} 
                  onChange={(e) => setSlot(e.target.value)} 
                  className="theme-dropdown themed-select"
                >
                  <option value="Morning" className="themed-option">Morning Shift (5am - 4pm)</option>
                  <option value="Night" className="themed-option">Night Shift (4pm - 11pm)</option>
                  <option value="Full Day" className="themed-option">Full Day (Marriage)</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Event Title</label>
              <input 
                type="text" 
                placeholder="Enter event title..." 
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                className="theme-input"
                required
              />
            </div>

            <div className="form-row-two">
              <div className="form-group">
                <label>Customer Name</label>
                <input 
                  type="text" 
                  placeholder="Enter full name..." 
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="theme-input font-bold"
                  required
                />
              </div>

              <div className="form-group">
                <label>Indian Mobile (+91)</label>
                <input 
                  type="tel" 
                  placeholder="Enter 10-digit number" 
                  value={customerPhone}
                  onChange={handlePhoneInput}
                  maxLength={10}
                  className="theme-input"
                  required
                />
              </div>
            </div>

            <div className="form-row-two">
              <div className="form-group">
                <label>Estimated Guests (Persons)</label>
                <input 
                  type="number" 
                  placeholder="Enter guest count..." 
                  value={personsAttending}
                  onChange={(e) => setPersonsAttending(e.target.value)}
                  className="theme-input"
                  required
                />
              </div>

              <div className="form-group">
                <label>Workers Required</label>
                <input 
                  type="number" 
                  placeholder="Enter worker count..." 
                  value={workersNeeded}
                  onChange={(e) => setWorkersNeeded(e.target.value)}
                  className="theme-input"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Event Status</label>
              <div className="status-toggle-container">
                <button 
                  type="button" 
                  className={`toggle-btn ${status === 'Booked' ? 'active-booked' : ''}`}
                  onClick={() => setStatus('Booked')}
                >
                  📅 Booked / Upcoming
                </button>
                <button 
                  type="button" 
                  className={`toggle-btn ${status === 'Completed' ? 'active-completed' : ''}`}
                  onClick={() => setStatus('Completed')}
                >
                  ✅ Completed
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT: Financial Subdivision Panel */}
          <div className="billing-column flex flex-col gap-4">
            <h4 className="section-title">2. Billing Subdivisions (₹ INR)</h4>

            <div className="form-row-two">
              <div className="form-group">
                <label>Hall Rent (₹)</label>
                <input 
                  type="number" 
                  placeholder="Enter rent amount..." 
                  value={hallRent} 
                  onChange={(e) => setHallRent(e.target.value)}
                  className="theme-input font-bold"
                  required
                />
              </div>

              <div className="form-group">
                <label>Power / Electricity (₹)</label>
                <input 
                  type="number" 
                  placeholder="Enter power charges..." 
                  value={power} 
                  onChange={(e) => setPower(e.target.value)}
                  className="theme-input"
                  required
                />
              </div>
            </div>

            <div className="form-row-three">
              <div className="form-group">
                <label>Cleaning</label>
                <input 
                  type="number" 
                  placeholder="Cleaning..." 
                  value={cleaning} 
                  onChange={(e) => setCleaning(e.target.value)}
                  className="theme-input text-sm"
                  required
                />
              </div>

              <div className="form-group">
                <label>AC (Opt)</label>
                <input 
                  type="number" 
                  placeholder="AC charges..." 
                  value={acCharges} 
                  onChange={(e) => setAcCharges(e.target.value)}
                  className="theme-input text-sm"
                />
              </div>

              <div className="form-group">
                <label>Rooms (Opt)</label>
                <input 
                  type="number" 
                  placeholder="Rooms..." 
                  value={rooms} 
                  onChange={(e) => setRooms(e.target.value)}
                  className="theme-input text-sm"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Discount Amount (₹)</label>
              <input 
                type="number" 
                placeholder="Enter discount value..." 
                value={discount} 
                onChange={(e) => setDiscount(e.target.value)}
                className="theme-input font-bold"
              />
            </div>

            <div className="calculations-display-panel flex flex-col gap-2">
              <div className="calc-row">
                <span>Subtotal rent & charges:</span>
                <strong>{formatRupee(subtotal)}</strong>
              </div>
              <div className="calc-row text-payable">
                <span>Total Payable Amount:</span>
                <strong>{formatRupee(payableAmount)}</strong>
              </div>
              <div className="calc-row min-advance-row">
                <span>Compulsory 20% Advance:</span>
                <span className="min-adv-val">{formatRupee(minAdvance)}</span>
              </div>
            </div>

            <div className="form-row-two">
              <div className="form-group">
                <label>Advance Paid (₹) *</label>
                <input 
                  type="number" 
                  placeholder="Min 20% advance..." 
                  value={advancePaid} 
                  onChange={(e) => setAdvancePaid(e.target.value)}
                  className={`theme-input font-bold ${Number(advancePaid) < minAdvance ? 'input-error-border' : 'billing-highlight-input'}`}
                  required
                />
              </div>

              <div className="form-group">
                <label>Additional Payments (₹)</label>
                <input 
                  type="number" 
                  placeholder="Enter subsequent paid..." 
                  value={additionalPaid} 
                  disabled={!isEdit}
                  onChange={(e) => setAdditionalPaid(e.target.value)}
                  className="theme-input disabled:opacity-40 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            <div className="due-summary-panel flex flex-col gap-2">
              <div className="calc-row">
                <span>Total Amount Paid:</span>
                <strong>{formatRupee(paidAmount)}</strong>
              </div>
              <div className={`calc-row ${balanceDue > 0 ? 'calc-due-warning' : 'calc-due-cleared'}`}>
                <span>Remaining Balance Due:</span>
                <strong>{formatRupee(balanceDue)}</strong>
              </div>
            </div>

            {Number(advancePaid) < minAdvance && payableAmount > 0 && (
              <div className="validation-warning-banner">
                ⚠️ Warning: Advance must be at least ₹{minAdvance.toLocaleString('en-IN')} (20% of ₹{payableAmount.toLocaleString('en-IN')}).
              </div>
            )}
          </div>

          {/* FOOTER ACTIONS */}
          <div className="modal-actions-footer">
            {isEdit && (
              <button 
                type="button" 
                onClick={handleDelete} 
                className="delete-booking-btn"
              >
                🗑️ Move to Recycle Bin
              </button>
            )}

            <div className="footer-right-buttons">
              <button type="button" onClick={onClose} className="cancel-modal-btn">Cancel</button>
              <button type="submit" className="theme-btn-primary save-modal-btn">
                {isEdit ? 'Update Booking ✅' : 'Confirm & Save Booking 💒'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
