import React, { useState, useEffect } from 'react';
import './LinkExpiration.css';

const LinkExpiration = ({ expiration = {}, onChange }) => {
  const [enabled, setEnabled] = useState(expiration.enabled || false);
  const [expireAt, setExpireAt] = useState(expiration.expireAt || '');
  const [expiredRedirect, setExpiredRedirect] = useState(expiration.expiredRedirect || '');

  useEffect(() => {
    onChange({
      enabled,
      expireAt,
      expiredRedirect
    });
  }, [enabled, expireAt, expiredRedirect, onChange]);

  return (
    <div className="feature-link-expiration">
      <label className="checkbox-label">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => setEnabled(e.target.checked)}
        />
        <span className="checkbox-custom"></span>
        <span className="checkbox-text">
          Set link expiration
        </span>
      </label>

      {enabled && (
        <div className="expiration-fields">
          <div className="form-row">
            <label className="feature-label">
              Expiration date & time
              <input
                type="datetime-local"
                value={expireAt}
                onChange={(e) => setExpireAt(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
                required
              />
            </label>
          </div>

          <div className="form-row">
            <label className="feature-label">
              Redirect after expiration (optional)
              <input
                type="url"
                value={expiredRedirect}
                onChange={(e) => setExpiredRedirect(e.target.value)}
                placeholder="https://example.com/expired"
              />
              <small className="field-hint">
                Leave empty to show a default expiration message
              </small>
            </label>
          </div>
        </div>
      )}
    </div>
  );
};

export default LinkExpiration;