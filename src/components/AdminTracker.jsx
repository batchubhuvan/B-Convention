import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { db } from '../utils/db';

export default function AdminTracker() {
  const subAdmins = useAppStore((state) => state.subAdmins);
  const loginLogs = useAppStore((state) => state.loginLogs);
  const removeSubAdminByName = useAppStore((state) => state.removeSubAdminByName);
  const reloadData = useAppStore((state) => state.reloadData);

  const handleRemoveAdmin = (name) => {
    if (
      !window.confirm(
        `Are you sure you want to remove sub-admin "${name}"? They will lose all access immediately.`
      )
    )
      return;
    try {
      removeSubAdminByName(name);
      db.addNotification(`Sub-admin "${name}" access revoked.`, 'warning');
      reloadData();
    } catch (err) {
      alert(err.message);
    }
  };

  // Format Login Time
  const formatLoginTime = (isoString) => {
    const d = new Date(isoString);
    return (
      d.toLocaleDateString([], {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      }) +
      ' at ' +
      d.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    );
  };

  // Format Duration in seconds to "X min Y sec"
  const formatDuration = (totalSeconds) => {
    if (!totalSeconds || totalSeconds <= 0) return 'Just logged in';

    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    if (minutes > 0) {
      return `${minutes} min ${seconds} sec`;
    }
    return `${seconds} seconds`;
  };

  // Determine if a session is currently active (updated in last 12 seconds)
  const isSessionActive = (lastHeartbeatIso) => {
    const diffMs = Date.now() - new Date(lastHeartbeatIso).getTime();
    return diffMs < 12000;
  };

  return (
    <div className="admin-tracker-grid animate-fade-in">
      {/* COLUMN 1: Sub-Admin Slots Management */}
      <div className="subadmin-mgmt-card glass-panel text-left">
        <div className="card-header-icon">👥</div>
        <h3>Registered Sub-Admins</h3>
        <p className="subtitle">
          Up to 4 sub-admins can register themselves dynamically by logging in on the homepage. You can view or clear slots here.
        </p>
 
        <div className="subadmins-list-container" style={{ marginTop: '20px' }}>
          <div className="slots-status-bar" style={{ marginBottom: '15px' }}>
            <span>Capacity Status:</span>
            <strong>{subAdmins.length} of 4 slots filled</strong>
          </div>

          {subAdmins.length === 0 ? (
            <p className="empty-subadmins-list">
              No sub-admins registered yet. 4 slots are available for anyone to register.
            </p>
          ) : (
            <div className="subadmins-cards-list">
              {subAdmins.map((admin) => (
                <div key={admin.name} className="subadmin-item-card animate-fade-in">
                  <div className="item-meta">
                    <span className="name">{admin.name}</span>
                    <span className="phone">Authorized Sub-Admin</span>
                  </div>
                  <button
                    onClick={() => handleRemoveAdmin(admin.name)}
                    className="revoke-btn"
                    title="Remove access to free up a slot"
                  >
                    Clear Slot 🗑️
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* COLUMN 2: Login Activity Tracker Timeline */}
      <div className="activity-tracker-card glass-panel text-left">
        <div className="card-header-icon">📈</div>
        <h3>Live Activity duration Logs</h3>
        <p className="subtitle">
          Monitor the exact date, time, and active duration other sub-admins spend using the website. Counts update in real-time.
        </p>

        <div className="table-responsive-container logs-table-container">
          {loginLogs.length === 0 ? (
            <div className="no-records-banner">
              📁 No sub-admin activity logs recorded yet. Logs populate as sub-admins use the website.
            </div>
          ) : (
            <table className="payments-table logs-table">
              <thead>
                <tr>
                  <th>Sub-Admin Name</th>
                  <th>Login Date & Time</th>
                  <th>Active Duration</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {[...loginLogs].reverse().map((log) => {
                  const active = isSessionActive(log.lastHeartbeat);
                  return (
                    <tr key={log.id} className="table-row-hover">
                      <td className="font-bold">{log.name}</td>
                      <td className="font-small">{formatLoginTime(log.loginTime)}</td>
                      <td className="font-medium text-green">{formatDuration(log.duration)}</td>
                      <td>
                        {active ? (
                          <span className="status-indicator active-dot animate-pulse">
                            🟢 Online
                          </span>
                        ) : (
                          <span className="status-indicator offline-dot">
                            ⚫ Offline
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
