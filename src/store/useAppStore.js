import { create } from 'zustand';
import { db } from '../utils/db';

export const useAppStore = create((set, get) => {
  // Initialize BroadcastChannel
  const sessionBus = new BroadcastChannel('convention_session_bus');

  // Handle cross-tab updates
  sessionBus.onmessage = (event) => {
    const { type, payload } = event.data;
    const state = get();

    if (type === 'MAIN_ADMIN_LOGIN' && state.currentUser?.isMainAdmin) {
      const currentSessionId = sessionStorage.getItem('convention_session_id');
      if (payload.sessionId !== currentSessionId) {
        state.performForceLogout();
      }
    }

    if (type === 'SUB_ADMIN_LOGIN' && state.currentUser) {
      state.showLiveToast(`${payload.name} has signed in using B Convention credentials!`);
      state.reloadData();
    }
  };

  return {
    mainAdmin: db.getMainAdmin(),
    subAdmins: db.getSubAdmins(),
    bookings: db.getBookings(),
    recycleBin: db.getRecycleBin(),
    branding: db.getBranding(),
    loginLogs: db.getLoginLogs(),
    notifications: [], // Visible notifications loaded in init
    currentUser: (() => {
      const saved = sessionStorage.getItem('convention_current_user');
      return saved ? JSON.parse(saved) : null;
    })(),
    activeLogId: sessionStorage.getItem('convention_active_log_id') || null,
    currentTab: 'calendar',
    selectedMonth: new Date().getMonth(),
    selectedYear: new Date().getFullYear(),
    liveToast: null,
    isKicked: localStorage.getItem('main_admin_kicked') === 'true',
    sessionBus,

    init: () => {
      db.init();
      get().reloadData();
      
      // Heartbeat timer for sub-admin sessions
      setInterval(() => {
        const { currentUser, activeLogId } = get();
        if (currentUser && !currentUser.isMainAdmin && activeLogId) {
          db.updateHeartbeat(activeLogId);
          set({ loginLogs: db.getLoginLogs() });
        }
      }, 5000);
    },

    reloadData: () => {
      const currentUser = get().currentUser;
      const allNotifs = db.getNotifications();
      // Filter out notifications dismissed by current user name
      const visibleNotifs = currentUser
        ? allNotifs.filter(n => !n.dismissedBy.includes(currentUser.name.toLowerCase()))
        : [];

      set({
        mainAdmin: db.getMainAdmin(),
        subAdmins: db.getSubAdmins(),
        bookings: db.getBookings(),
        recycleBin: db.getRecycleBin(),
        branding: db.getBranding(),
        loginLogs: db.getLoginLogs(),
        notifications: visibleNotifs
      });
    },

    showLiveToast: (message) => {
      const id = 'toast-' + Date.now();
      set({ liveToast: { id, message } });
      setTimeout(() => {
        const current = get().liveToast;
        if (current && current.id === id) {
          set({ liveToast: null });
        }
      }, 5000);
    },

    performForceLogout: () => {
      sessionStorage.clear();
      localStorage.setItem('main_admin_kicked', 'true');
      set({
        currentUser: null,
        activeLogId: null,
        currentTab: 'calendar',
        isKicked: true
      });
    },

    registerMainAdmin: (name) => {
      const admin = db.setMainAdmin(name);
      set({ mainAdmin: admin });
      get().reloadData();
    },

    login: (username, password, personalName) => {
      const verification = db.verifyAndRegisterAdmin(username, password, personalName);
      const isMain = verification.isMain;
      const sessionUser = {
        name: verification.name,
        isMainAdmin: isMain
      };

      const sessionId = 'sess-' + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem('convention_current_user', JSON.stringify(sessionUser));
      sessionStorage.setItem('convention_session_id', sessionId);
      
      set({ currentUser: sessionUser });

      if (isMain) {
        sessionBus.postMessage({
          type: 'MAIN_ADMIN_LOGIN',
          payload: { sessionId, name: verification.name }
        });
      } else {
        const logId = db.writeLoginLog(verification.name);
        sessionStorage.setItem('convention_active_log_id', logId);
        set({ activeLogId: logId });

        db.addNotification(`Sub-admin "${verification.name}" signed into B Convention`, 'info');

        sessionBus.postMessage({
          type: 'SUB_ADMIN_LOGIN',
          payload: { name: verification.name }
        });
      }

      get().reloadData();
    },

    logout: () => {
      sessionStorage.clear();
      set({
        currentUser: null,
        activeLogId: null,
        currentTab: 'calendar'
      });
    },

    dismissNotification: (id) => {
      const { currentUser } = get();
      if (!currentUser) return;
      db.dismissNotificationForUser(id, currentUser.name);
      get().reloadData();
    },

    addBooking: (bookingData) => {
      const newBooking = db.addBooking(bookingData);
      get().reloadData();
      return newBooking;
    },

    updateBooking: (id, updatedData) => {
      const updated = db.updateBooking(id, updatedData);
      get().reloadData();
      return updated;
    },

    deleteBooking: (id) => {
      const deleted = db.deleteBooking(id);
      get().reloadData();
      return deleted;
    },

    restoreBooking: (id) => {
      const restored = db.restoreBooking(id);
      get().reloadData();
      return restored;
    },

    deleteBookingPermanently: (id) => {
      const removed = db.deleteBookingPermanently(id);
      get().reloadData();
      return removed;
    },

    removeSubAdminByName: (name) => {
      const updated = db.removeSubAdminByName(name);
      set({ subAdmins: updated });
      get().reloadData();
    },

    saveBranding: (updatedBranding) => {
      const saved = db.saveBranding(updatedBranding);
      set({ branding: saved });
      get().reloadData();
    },

    setCurrentTab: (tab) => set({ currentTab: tab }),
    setSelectedMonth: (month) => set({ selectedMonth: month }),
    setSelectedYear: (year) => set({ selectedYear: year })
  };
});
