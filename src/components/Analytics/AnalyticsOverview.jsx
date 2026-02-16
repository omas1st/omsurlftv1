// src/components/Analytics/AnalyticsOverview.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { analyticsAPI } from '../../services/api';
import './AnalyticsOverview.css';

const AnalyticsOverview = ({
  data: externalData,
  external = false,
  alias,
  timeRange,
  localTime,
  customDate,
  isOverall,
}) => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(!external);
  const [noData, setNoData] = useState(false);

  useEffect(() => {
    if (external && externalData) {
      setSummary(externalData);
      setNoData(!externalData);
      setLoading(false);
    }
  }, [external, externalData]);

  const fetchData = useCallback(async () => {
    if (external) return;
    setLoading(true);
    setNoData(false);
    try {
      const params = {
        timeframe: timeRange,
        timezone: localTime,
      };
      if (timeRange === 'custom' && customDate.from && customDate.to) {
        params.from = customDate.from;
        params.to = customDate.to;
      }

      let response;
      if (isOverall || alias === 'overall') {
        response = await analyticsAPI.overall(params);
        setSummary(response.data?.data?.summary || null);
        if (!response.data?.data?.summary) setNoData(true);
      } else {
        response = await analyticsAPI.url(alias, params);
        setSummary(response.data?.data?.summary || null);
        if (!response.data?.data?.summary) setNoData(true);
      }
    } catch (error) {
      console.error('Error fetching overview summary:', error);
      setNoData(true);
    } finally {
      setLoading(false);
    }
  }, [alias, timeRange, localTime, customDate, isOverall, external]);

  useEffect(() => {
    if (!external) fetchData();
  }, [fetchData, external]);

  if (loading) return <div className="overview-loading"><div className="spinner" /></div>;
  if (noData || !summary) {
    return (
      <div className="no-data-placeholder">
        <p>No overview data available</p>
      </div>
    );
  }

  return (
    <div className="analytics-overview">
      <div className="overview-grid">
        <div className="overview-card">
          <span className="label">Total Visitors</span>
          <span className="value">{summary.totalVisitors ?? 0}</span>
        </div>
        <div className="overview-card">
          <span className="label">Total Clicks</span>
          <span className="value">{summary.totalClicks ?? 0}</span>
        </div>
        <div className="overview-card">
          <span className="label">Unique Visitors</span>
          <span className="value">{summary.uniqueVisitors ?? 0}</span>
        </div>
        <div className="overview-card">
          <span className="label">Engagement Rate</span>
          <span className="value">{summary.engagementRate ?? '0'}%</span>
        </div>
        <div className="overview-card">
          <span className="label">Average Duration</span>
          <span className="value">{summary.avgDuration ?? '0'}s</span>
        </div>
        <div className="overview-card">
          <span className="label">Bounce Rate</span>
          <span className="value">{summary.bounceRate ?? '0'}%</span>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsOverview;