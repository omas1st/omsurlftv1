import React from 'react';
import './Tabs.css';

const Tabs = ({ tabs, activeTab, onTabChange }) => {
  return (
    <div className="tabs-container">
      <div className="tabs-header">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => onTabChange(tab.id)}
            disabled={tab.disabled}
          >
            {tab.icon && <span className="tab-icon">{tab.icon}</span>}
            {tab.label}
            {tab.count !== undefined && (
              <span className="tab-count">{tab.count}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Tabs;