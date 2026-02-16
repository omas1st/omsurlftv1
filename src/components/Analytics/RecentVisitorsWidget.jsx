// src/components/Analytics/RecentVisitorsWidget.jsx
import React, { useState, useEffect, useCallback } from 'react';
import ReactCountryFlag from 'react-country-flag';
import { analyticsAPI } from '../../services/api';
import './RecentVisitorsWidget.css';

const RecentVisitorsWidget = ({
  externalData,
  external = false,
  alias,
  timeRange,
  localTime,
  customDate,
  isOverall,
}) => {
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(!external);
  const [noData, setNoData] = useState(false);
  const [selectedVisitor, setSelectedVisitor] = useState(null);

  const getParams = useCallback(() => {
    const params = {
      timeframe: timeRange,
      timezone: localTime,
      limit: 10,
    };
    if (timeRange === 'custom' && customDate.from && customDate.to) {
      params.from = customDate.from;
      params.to = customDate.to;
    }
    return params;
  }, [timeRange, localTime, customDate]);

  const processData = useCallback((raw) => {
    if (!raw || raw.length === 0) {
      setNoData(true);
      setVisitors([]);
      return;
    }
    setVisitors(raw);
    setNoData(false);
  }, []);

  useEffect(() => {
    if (external && externalData) {
      processData(externalData);
      setLoading(false);
    }
  }, [external, externalData, processData]);

  const fetchData = useCallback(async () => {
    if (external) return;
    setLoading(true);
    setNoData(false);
    try {
      if (isOverall || alias === 'overall') {
        setNoData(true);
        setVisitors([]);
        setLoading(false);
        return;
      }

      const params = getParams();
      const response = await analyticsAPI.recentVisitors(alias, params);
      setVisitors(response.data?.data || []);
    } catch (error) {
      console.error('Error fetching recent visitors:', error);
      setNoData(true);
    } finally {
      setLoading(false);
    }
  }, [alias, isOverall, getParams, external]);

  useEffect(() => {
    if (!external) fetchData();
  }, [fetchData, external]);

  const getDeviceIcon = (device) => {
    if (device === 'mobile') return '📱';
    if (device === 'tablet') return '📟';
    return '💻';
  };

  const getOSBrowserIcon = (os, browser) => `${os} / ${browser}`;

  if (loading) return <div className="widget-loading"><div className="spinner" /></div>;
  if (noData || visitors.length === 0) {
    return (
      <div className="no-data-placeholder">
        <p>No recent visitors</p>
      </div>
    );
  }

  return (
    <div className="recent-visitors-widget">
      <table className="visitors-table">
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>Country</th>
            <th>City / Region</th>
            <th>Browser / OS</th>
            <th>Device</th>
          </tr>
        </thead>
        <tbody>
          {visitors.map((v, idx) => (
            <tr key={v._id || idx} onClick={() => setSelectedVisitor(v)} className="clickable-row">
              <td>{new Date(v.timestamp).toLocaleString()}</td>
              <td>
                {v.countryCode && (
                  <ReactCountryFlag
                    countryCode={v.countryCode}
                    svg
                    style={{ width: '20px', height: '15px', marginRight: '8px' }}
                  />
                )}
                {v.country || 'Unknown'}
              </td>
              <td>{v.city || v.region || 'Unknown'}</td>
              <td>{getOSBrowserIcon(v.os, v.browser)}</td>
              <td>{getDeviceIcon(v.device)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedVisitor && (
        <div className="visitor-detail-modal" onClick={() => setSelectedVisitor(null)}>
          <div className="modal-content">
            <h3>Visitor Details</h3>
            <pre>{JSON.stringify(selectedVisitor, null, 2)}</pre>
            <button onClick={() => setSelectedVisitor(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecentVisitorsWidget;