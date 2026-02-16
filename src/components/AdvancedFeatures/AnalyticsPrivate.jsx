// src/components/AdvancedFeatures/AnalyticsPrivate.jsx
import React from 'react';
import './AdvancedFeatures.css';

const AnalyticsPrivate = ({ isPrivate, onChange }) => {
  return (
    <div className="analytics-private">
      <label className="checkbox-label">
        <input
          type="checkbox"
          checked={isPrivate}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span className="checkbox-custom"></span>
        <span className="checkbox-text">
          Make private
        </span>
      </label>
      <p className="feature-description">
        Make analytics data private to you only
      </p>
    </div>
  );
};

export default AnalyticsPrivate;