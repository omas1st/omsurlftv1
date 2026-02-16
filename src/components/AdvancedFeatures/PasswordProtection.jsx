// src/components/AdvancedFeatures/PasswordProtection.jsx
import React, { useState, useEffect } from 'react';
import './PasswordProtection.css';
// Note: AdvancedFeatures.css is also imported in the parent, so styles are available.

const PasswordProtection = ({ password = '', passwordNote = '', onChange }) => {
  const [enabled, setEnabled] = useState(!!password);
  const [showPassword, setShowPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState(password);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [note, setNote] = useState(passwordNote);

  useEffect(() => {
    setCurrentPassword(password || '');
  }, [password]);

  useEffect(() => {
    setNote(passwordNote || '');
  }, [passwordNote]);

  const propagateChange = (pwd, noteValue) => {
    if (typeof onChange === 'function') {
      onChange({ password: pwd, passwordNote: noteValue });
    }
  };

  const handleEnableChange = (e) => {
    const isEnabled = e.target.checked;
    setEnabled(isEnabled);
    if (!isEnabled) {
      setCurrentPassword('');
      setConfirmPassword('');
      setNote('');
      propagateChange('', '');
    }
  };

  const handlePasswordChange = (e) => {
    const val = e.target.value;
    setCurrentPassword(val);
    propagateChange(val, note);
  };

  const handleNoteChange = (e) => {
    const val = e.target.value;
    setNote(val);
    propagateChange(currentPassword, val);
  };

  const handleConfirmChange = (e) => {
    setConfirmPassword(e.target.value);
  };

  const passwordsMatch = !enabled || !currentPassword || !confirmPassword || currentPassword === confirmPassword;

  return (
    <div className="password-protection feature-password">
      <label className="checkbox-label">
        <input
          type="checkbox"
          checked={enabled}
          onChange={handleEnableChange}
        />
        <span className="checkbox-custom"></span>
        <span className="checkbox-text">Enable password protection</span>
      </label>
      <p className="feature-description">
        Protect your link with a password. Optionally add a note for authorised users.
      </p>

      {enabled && (
        <div className="password-fields">
          <label className="feature-label">
            Password
            <div className="password-input">
              <input
                type={showPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={handlePasswordChange}
                placeholder="Enter a password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="toggle-password"
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </label>

          <label className="feature-label">
            Confirm Password
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={handleConfirmChange}
              placeholder="Confirm password"
            />
            {!passwordsMatch && (
              <span className="error-text">Passwords do not match</span>
            )}
          </label>

          <label className="feature-label">
            Owner note
            <textarea
              value={note}
              onChange={handleNoteChange}
              placeholder="A short message shown above the password form"
              rows="3"
            />
          </label>
        </div>
      )}
    </div>
  );
};

export default PasswordProtection;