import React, { useState } from 'react';

export default function SessionSimulator() {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpenNewTab = () => {
    window.open(window.location.href, '_blank');
  };

  return (
    <div className={`session-simulator-sidebar ${isOpen ? 'sidebar-open' : ''}`}>
      {/* Drawer Toggle Tab */}
      <button className="simulator-toggle-btn" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? '➡️ Close Tester' : '⚙️ Test Device Invalidation'}
      </button>

      <div className="simulator-body text-left">
        <h4 className="sim-title">⚙️ Device & Session Simulator</h4>
        <p className="sim-description text-slate-400">
          Use this sidebar to easily test the security rules and real-time login alerts on your computer.
        </p>
        
        <hr className="sim-divider" />

        <div className="sim-test-block">
          <h5 className="font-bold text-white text-sm mb-1.5">Test Case 1: Session Kick-Off</h5>
          <p className="sim-case-text text-slate-400 text-xs leading-relaxed">
            The **Main Admin** is restricted to a **single active device/session**. If the Main Admin logs in elsewhere, previous devices are kicked out.
          </p>
          
          <ol className="sim-steps text-slate-400 text-xs">
            <li>Log in here as the <strong>Main Admin</strong> (enter your name).</li>
            <li>Click the button below to open a new tab.</li>
            <li>In the new tab, log in as the <strong>Main Admin again</strong> (using the same username, password, and your Name).</li>
            <li>Come back to this tab: you will see you are immediately logged out!</li>
          </ol>

          <button onClick={handleOpenNewTab} className="sim-action-btn-primary text-center">
            Open New Tab / Device 🔗
          </button>
        </div>

        <hr className="sim-divider" />

        <div className="sim-test-block">
          <h5 className="font-bold text-white text-sm mb-1.5">Test Case 2: Sub-Admin Login Alerts</h5>
          <p className="sim-case-text text-slate-400 text-xs leading-relaxed">
            When a Sub-Admin signs in, all logged-in admins get a **real-time login notification bubble** and tracks their exact usage duration.
          </p>
          
          <ol className="sim-steps text-slate-400 text-xs">
            <li>Log in here as the <strong>Main Admin</strong>.</li>
            <li>Open a new tab using the button above.</li>
            <li>In the new tab, log in as a **Sub-Admin** (enter a different name, e.g. Suresh, Ramesh, using same credentials).</li>
            <li>Look at this tab: you will see a real-time notification popup and track their activity duration counts in Settings!</li>
          </ol>
        </div>

        <div className="sim-footer text-[10px] text-slate-500 font-semibold uppercase tracking-wider text-center">
          ⚡ Powered by HTML5 BroadcastChannel & LocalStorage.
        </div>
      </div>
    </div>
  );
}
