import React, { useState, useEffect } from 'react';
import './ScheduleRedirection.css';

const ScheduledRedirect = ({ scheduledRedirect = {}, onChange }) => {
  const [enabled, setEnabled] = useState(scheduledRedirect.enabled || false);
  const [startDate, setStartDate] = useState(scheduledRedirect.startDate || '');
  const [endDate, setEndDate] = useState(scheduledRedirect.endDate || '');
  const [message, setMessage] = useState(scheduledRedirect.message || '');

  useEffect(() => {
    onChange({
      enabled,
      startDate,
      endDate,
      message
    });
  }, [enabled, startDate, endDate, message, onChange]);

  return (
    <div className="feature-scheduled-redirect">
      <label className="checkbox-label">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => setEnabled(e.target.checked)}
        />
        <span className="checkbox-custom"></span>
        <span className="checkbox-text">
          Schedule when this link becomes active
        </span>
      </label>

      {enabled && (
        <div className="scheduled-fields">
          <div className="form-row">
            <label className="feature-label">
              Start date & time
              <input
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
              />
            </label>
          </div>

          <div className="form-row">
            <label className="feature-label">
              End date & time (optional)
              <input
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate ? startDate : new Date().toISOString().slice(0, 16)}
              />
            </label>
          </div>

          <div className="form-row">
            <label className="feature-label">
              Message to show before activation
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="This link will be available on ..."
                rows={2}
                maxLength={200}
              />
            </label>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduledRedirect;