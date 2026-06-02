const KEYS = {
  MAIN_ADMIN: 'convention_main_admin',
  SUB_ADMINS: 'convention_sub_admins',
  BOOKINGS: 'convention_bookings',
  RECYCLE_BIN: 'convention_recycle_bin',
  LOGIN_LOGS: 'convention_login_logs',
  BRANDING: 'convention_branding',
  NOTIFICATIONS: 'convention_global_notifications'
};

// Default styling settings - Now B Convention!
const DEFAULT_BRANDING = {
  conventionName: 'B Convention',
  style: {
    fontFamily: 'Outfit',
    gradientStart: '#d4af37', // Premium Gold
    gradientEnd: '#f9d976', // Lighter Gold
    shadowColor: 'rgba(212, 175, 55, 0.4)',
    glowStrength: '10px',
    fontSize: '28px'
  }
};

export const GLOBAL_CREDENTIALS = {
  USERNAME: 'B Convention',
  PASSWORD: 'Brp@2856'
};

export const db = {
  // Initialize Database on load
  init() {
    if (!localStorage.getItem(KEYS.BOOKINGS)) {
      localStorage.setItem(KEYS.BOOKINGS, JSON.stringify([]));
    }
    if (!localStorage.getItem(KEYS.RECYCLE_BIN)) {
      localStorage.setItem(KEYS.RECYCLE_BIN, JSON.stringify([]));
    }
    if (!localStorage.getItem(KEYS.SUB_ADMINS)) {
      localStorage.setItem(KEYS.SUB_ADMINS, JSON.stringify([]));
    }
    if (!localStorage.getItem(KEYS.LOGIN_LOGS)) {
      localStorage.setItem(KEYS.LOGIN_LOGS, JSON.stringify([]));
    }
    if (!localStorage.getItem(KEYS.BRANDING)) {
      localStorage.setItem(KEYS.BRANDING, JSON.stringify(DEFAULT_BRANDING));
    }
    if (!localStorage.getItem(KEYS.NOTIFICATIONS)) {
      localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify([]));
    }
    this.sweepRecycleBin();
  },

  // Main Admin Management
  getMainAdmin() {
    const data = localStorage.getItem(KEYS.MAIN_ADMIN);
    return data ? JSON.parse(data) : null;
  },

  setMainAdmin(name) {
    const mainAdmin = { name: name.trim(), initialized: true };
    localStorage.setItem(KEYS.MAIN_ADMIN, JSON.stringify(mainAdmin));
    return mainAdmin;
  },

  // Sub Admins Management
  getSubAdmins() {
    const data = localStorage.getItem(KEYS.SUB_ADMINS);
    return data ? JSON.parse(data) : [];
  },

  // Direct signup / Name verification logic using global credentials
  verifyAndRegisterAdmin(username, password, personalName) {
    const cleanUser = username.trim().toLowerCase();
    const cleanName = personalName.trim();

    // 1. Verify global credentials
    if (cleanUser !== GLOBAL_CREDENTIALS.USERNAME.toLowerCase()) {
      throw new Error('Incorrect Username. Please enter "B Convention".');
    }
    if (password !== GLOBAL_CREDENTIALS.PASSWORD) {
      throw new Error('Incorrect Password. Please check characters, symbols (@), and capital letters.');
    }
    if (!cleanName) {
      throw new Error('Please enter your name to identify your session.');
    }

    // 2. Resolve role
    const mainAdmin = this.getMainAdmin();
    if (!mainAdmin) {
      // First person to log in becomes the permanent Main Admin (Owner)
      const newMain = this.setMainAdmin(cleanName);
      return { name: newMain.name, isMain: true };
    }

    // Check if name matches Main Admin
    if (mainAdmin.name.toLowerCase() === cleanName.toLowerCase()) {
      return { name: mainAdmin.name, isMain: true };
    }

    // Check if name matches an existing sub-admin name
    const subAdmins = this.getSubAdmins();
    const existing = subAdmins.find(admin => admin.name.toLowerCase() === cleanName.toLowerCase());

    if (existing) {
      return { name: existing.name, isMain: false };
    } else {
      // Register as a new Sub-Admin name if slot is available (max 4 sub-admins)
      if (subAdmins.length >= 4) {
        throw new Error('Access Denied: Maximum 4 sub-admin slots have been registered. The owner must free up a slot in Settings.');
      }
      
      subAdmins.push({ name: cleanName });
      localStorage.setItem(KEYS.SUB_ADMINS, JSON.stringify(subAdmins));
      return { name: cleanName, isMain: false };
    }
  },

  removeSubAdminByName(name) {
    let list = this.getSubAdmins();
    list = list.filter(admin => admin.name.toLowerCase() !== name.toLowerCase());
    localStorage.setItem(KEYS.SUB_ADMINS, JSON.stringify(list));
    return list;
  },

  // Booking Checks & Logic
  getBookings() {
    const data = localStorage.getItem(KEYS.BOOKINGS);
    return data ? JSON.parse(data) : [];
  },

  saveBookings(bookings) {
    localStorage.setItem(KEYS.BOOKINGS, JSON.stringify(bookings));
  },

  checkConflict(date, slot, excludeId = null) {
    const bookings = this.getBookings();
    const dayBookings = bookings.filter(b => b.date === date && b.id !== excludeId);
    
    for (const b of dayBookings) {
      if (b.slot === 'Full Day') {
        return b;
      }
      if (slot === 'Full Day') {
        return b;
      }
      if (b.slot === slot) {
        return b;
      }
    }
    return null;
  },

  addBooking(bookingData) {
    const conflict = this.checkConflict(bookingData.date, bookingData.slot);
    if (conflict) {
      throw new Error(`Conflict! Slot "${bookingData.slot}" is already booked on ${bookingData.date} by "${conflict.customerName}".`);
    }

    const bookings = this.getBookings();
    const newBooking = {
      ...bookingData,
      id: 'b-' + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString()
    };
    bookings.push(newBooking);
    this.saveBookings(bookings);
    return newBooking;
  },

  updateBooking(id, updatedData) {
    const bookings = this.getBookings();
    const index = bookings.findIndex(b => b.id === id);
    if (index === -1) throw new Error('Booking not found.');

    const current = bookings[index];
    const checkDate = updatedData.date || current.date;
    const checkSlot = updatedData.slot || current.slot;

    const conflict = this.checkConflict(checkDate, checkSlot, id);
    if (conflict) {
      throw new Error(`Conflict! Slot "${checkSlot}" is already booked on ${checkDate} by "${conflict.customerName}".`);
    }

    bookings[index] = {
      ...current,
      ...updatedData
    };
    
    this.saveBookings(bookings);
    return bookings[index];
  },

  deleteBooking(id) {
    const bookings = this.getBookings();
    const index = bookings.findIndex(b => b.id === id);
    if (index === -1) throw new Error('Booking not found.');

    const removed = bookings.splice(index, 1)[0];
    this.saveBookings(bookings);

    const recycleBin = this.getRecycleBin();
    recycleBin.push({
      ...removed,
      deletedAt: new Date().toISOString()
    });
    localStorage.setItem(KEYS.RECYCLE_BIN, JSON.stringify(recycleBin));
    return removed;
  },

  // Recycle Bin Management
  getRecycleBin() {
    const data = localStorage.getItem(KEYS.RECYCLE_BIN);
    return data ? JSON.parse(data) : [];
  },

  restoreBooking(id) {
    const recycleBin = this.getRecycleBin();
    const index = recycleBin.findIndex(b => b.id === id);
    if (index === -1) throw new Error('Booking not found in Recycle Bin.');

    const restored = recycleBin.splice(index, 1)[0];
    
    const conflict = this.checkConflict(restored.date, restored.slot);
    if (conflict) {
      throw new Error(`Cannot restore! Slot "${restored.slot}" on ${restored.date} has since been booked by "${conflict.customerName}".`);
    }

    delete restored.deletedAt;

    const bookings = this.getBookings();
    bookings.push(restored);
    
    localStorage.setItem(KEYS.RECYCLE_BIN, JSON.stringify(recycleBin));
    this.saveBookings(bookings);
    return restored;
  },

  deleteBookingPermanently(id) {
    const recycleBin = this.getRecycleBin();
    const index = recycleBin.findIndex(b => b.id === id);
    if (index === -1) throw new Error('Booking not found in Recycle Bin.');

    const removed = recycleBin.splice(index, 1)[0];
    localStorage.setItem(KEYS.RECYCLE_BIN, JSON.stringify(recycleBin));
    return removed;
  },

  sweepRecycleBin() {
    const recycleBin = this.getRecycleBin();
    const ninetyDaysMs = 90 * 24 * 60 * 60 * 1000;
    const now = Date.now();

    const filtered = recycleBin.filter(item => {
      if (!item.deletedAt) return false;
      const deletedTime = new Date(item.deletedAt).getTime();
      return (now - deletedTime) < ninetyDaysMs;
    });

    localStorage.setItem(KEYS.RECYCLE_BIN, JSON.stringify(filtered));
  },

  // Branding Management
  getBranding() {
    const data = localStorage.getItem(KEYS.BRANDING);
    return data ? JSON.parse(data) : DEFAULT_BRANDING;
  },

  saveBranding(branding) {
    localStorage.setItem(KEYS.BRANDING, JSON.stringify(branding));
    return branding;
  },

  // Logs and Timers (Admin Duration Tracking by Name)
  getLoginLogs() {
    const data = localStorage.getItem(KEYS.LOGIN_LOGS);
    return data ? JSON.parse(data) : [];
  },

  writeLoginLog(name) {
    const logs = this.getLoginLogs();
    const newLog = {
      id: 'log-' + Math.random().toString(36).substr(2, 9),
      name,
      loginTime: new Date().toISOString(),
      lastHeartbeat: new Date().toISOString(),
      duration: 0 // in seconds
    };
    logs.push(newLog);
    localStorage.setItem(KEYS.LOGIN_LOGS, JSON.stringify(logs));
    return newLog.id;
  },

  updateHeartbeat(logId) {
    const logs = this.getLoginLogs();
    const index = logs.findIndex(l => l.id === logId);
    if (index === -1) return;

    const now = new Date();
    const log = logs[index];
    const secondsElapsed = Math.floor((now.getTime() - new Date(log.lastHeartbeat).getTime()) / 1000);
    
    if (secondsElapsed > 0 && secondsElapsed < 30) {
      log.duration += secondsElapsed;
    }
    
    log.lastHeartbeat = now.toISOString();
    logs[index] = log;
    localStorage.setItem(KEYS.LOGIN_LOGS, JSON.stringify(logs));
  },

  // Global Notification Center (Tracked by dismisser Name)
  getNotifications() {
    const data = localStorage.getItem(KEYS.NOTIFICATIONS);
    return data ? JSON.parse(data) : [];
  },

  addNotification(message, type = 'info') {
    const notifs = this.getNotifications();
    const newNotif = {
      id: 'notif-' + Math.random().toString(36).substr(2, 9),
      message,
      type,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timestamp: new Date().toISOString(),
      dismissedBy: [] // Tracks who dismissed this notification (list of admin Names)
    };
    notifs.push(newNotif);
    localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(notifs));
    return newNotif;
  },

  dismissNotificationForUser(notifId, userName) {
    const notifs = this.getNotifications();
    const index = notifs.findIndex(n => n.id === notifId);
    if (index === -1) return;

    if (!notifs[index].dismissedBy.includes(userName.toLowerCase())) {
      notifs[index].dismissedBy.push(userName.toLowerCase());
    }
    localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(notifs));
  },

  // Customer Indian Phone Validation Helper
  validateIndianPhone(phone) {
    const cleanPhone = phone.replace(/[\s-+]/g, '');
    if (cleanPhone.length === 10) {
      return /^[6-9]\d{9}$/.test(cleanPhone);
    } else if (cleanPhone.length === 12 && cleanPhone.startsWith('91')) {
      return /^[6-9]\d{9}$/.test(cleanPhone.slice(2));
    }
    return false;
  }
};
