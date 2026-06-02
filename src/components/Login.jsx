import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';

export default function Login() {
  const { mainAdmin, registerMainAdmin, login } = useAppStore();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [personalName, setPersonalName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim()) {
      setError('Please enter the global username.');
      return;
    }
    if (!password) {
      setError('Please enter the security password.');
      return;
    }
    if (!personalName.trim()) {
      setError('Please enter your personal name.');
      return;
    }

    try {
      if (!mainAdmin) {
        const cleanUser = username.trim().toLowerCase();
        if (cleanUser !== 'b convention') {
          throw new Error('Incorrect Username. Please enter "B Convention".');
        }
        if (password !== 'Brp@2856') {
          throw new Error('Incorrect Password. Please check capital letters and symbols.');
        }

        registerMainAdmin(personalName);
      }

      login(username, password, personalName);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="login-overlay">
      <div className="login-card-container">
        <div className="login-card animate-scale-up">
          <div className="login-card-header">
            <span className="logo-emoji">🏰</span>
            <h2>
              {!mainAdmin ? 'B Convention Setup' : 'B Convention Portal'}
            </h2>
            <p className="subtitle">
              {!mainAdmin 
                ? 'Welcome! This is the first-time setup. Log in using the default credentials and your Name to register as the permanent Main Admin (Owner).'
                : 'Sign in using the global B Convention credentials and your name to access the wedding hall scheduler.'}
            </p>
          </div>

          {error && (
            <div className="error-message-banner animate-fade-in">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="user-field">Global Username</label>
              <input
                id="user-field"
                type="text"
                placeholder="B Convention"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="theme-input font-bold"
                autoFocus
              />
            </div>

            <div className="form-group">
              <label htmlFor="pass-field">Security Password</label>
              <input
                id="pass-field"
                type="password"
                placeholder="Enter password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="theme-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="name-field">Your Personal Name</label>
              <input
                id="name-field"
                type="text"
                placeholder="e.g. Bhuvan, Ramesh"
                value={personalName}
                onChange={(e) => setPersonalName(e.target.value)}
                className="theme-input font-bold"
              />
              <small className="help-text">Enter your personal name to identify your session. First login sets the owner admin.</small>
            </div>

            <button type="submit" className="theme-btn-primary login-submit-btn">
              {!mainAdmin ? 'Create Main Admin & Sign In' : 'Sign In to Portal'}
            </button>
          </form>

          <div className="login-footer">
            🔒 Protected by B Convention security keys.
          </div>
        </div>
      </div>
    </div>
  );
}
