// src/pages/AnalyticsPage/AnalyticsPage.jsx
import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { AuthContext } from '../../context/AuthContext';
import { analyticsAPI, urlAPI } from '../../services/api';
import StatsChart from '../../components/Analytics/StatsChart';
import TopCountriesChart from '../../components/Analytics/TopCountriesChart';
import BrowserUsageChart from '../../components/Analytics/BrowserUsageChart';
import OperatingSystemChart from '../../components/Analytics/OperatingSystemChart';
import LanguageChart from '../../components/Analytics/LanguageChart';
import HourlyAnalyticsChart from '../../components/Analytics/HourlyAnalyticsChart';
import MultipleDestinationRoutingChart from '../../components/Analytics/MultipleDestinationRoutingChart';
import RecentVisitorsWidget from '../../components/Analytics/RecentVisitorsWidget';
import AnalyticsOverview from '../../components/Analytics/AnalyticsOverview';
import ExportModal from '../../components/Analytics/ExportModal';
import './AnalyticsPage.css';

const AnalyticsPage = () => {
  const { alias } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useContext(AuthContext);

  const [selectedUrl, setSelectedUrl] = useState(alias || 'overall');
  const [timeRange, setTimeRange] = useState('overall');
  const [localTime, setLocalTime] = useState('utc');
  const [customDate, setCustomDate] = useState({ from: '', to: '' });

  const [urlInfo, setUrlInfo] = useState(null);
  const [userUrls, setUserUrls] = useState([]);
  const [fullData, setFullData] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPrivate, setIsPrivate] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);

  const getDateParams = useCallback(() => {
    const params = { timeframe: timeRange, timezone: localTime };
    if (timeRange === 'custom' && customDate.from && customDate.to) {
      params.from = customDate.from;
      params.to = customDate.to;
    }
    return params;
  }, [timeRange, localTime, customDate]);

  const fetchUserUrls = useCallback(async () => {
    try {
      const response = await urlAPI.getUrls({ limit: 100 });
      const urls = response.data?.data?.urls || response.data?.urls || [];
      setUserUrls(urls);
    } catch (error) {
      console.error('Error fetching user URLs:', error);
    }
  }, []);

  const fetchAggregatedData = useCallback(async () => {
    setLoading(true);
    setError(null);
    setIsPrivate(false);

    try {
      const params = getDateParams();

      if (selectedUrl === 'overall') {
        if (!isAuthenticated) {
          setError('Please log in to view analytics');
          setLoading(false);
          return;
        }
        const response = await analyticsAPI.overall(params);
        setFullData(response.data?.data || response.data);
      } else {
        let response;
        try {
          response = await analyticsAPI.urlPublic(selectedUrl);
        } catch (err) {
          if (err.response?.status === 403) {
            if (isAuthenticated) {
              response = await analyticsAPI.url(selectedUrl, params);
            } else {
              setIsPrivate(true);
              setLoading(false);
              return;
            }
          } else {
            throw err;
          }
        }
        setFullData(response.data?.data || response.data);
        const urlResp = await urlAPI.getUrl(selectedUrl);
        setUrlInfo(urlResp.data?.data?.url || urlResp.data?.url);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      if (error.response?.status === 404) {
        setError('URL not found');
      } else if (error.response?.status === 403) {
        setIsPrivate(true);
      } else {
        setError(error.response?.data?.message || 'Failed to fetch analytics data');
      }
    } finally {
      setLoading(false);
    }
  }, [selectedUrl, getDateParams, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) fetchUserUrls();
  }, [isAuthenticated, fetchUserUrls]);

  useEffect(() => {
    fetchAggregatedData();
  }, [fetchAggregatedData]);

  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
    if (range !== 'custom') setCustomDate({ from: '', to: '' });
  };

  const handleUrlChange = (urlAlias) => {
    setSelectedUrl(urlAlias);
    if (urlAlias === 'overall') navigate('/analytics');
    else navigate(`/${urlAlias}/analytics`);
  };

  const getTimeRangeLabel = () => {
    if (timeRange === 'custom' && customDate.from && customDate.to)
      return `${customDate.from} – ${customDate.to}`;
    const map = {
      today: 'Today',
      yesterday: 'Yesterday',
      last7days: 'Last 7 Days',
      last30days: 'Last 30 Days',
      last60days: 'Last 60 Days',
      lastYear: 'Last Year',
      overall: 'Overall'
    };
    return map[timeRange] || timeRange;
  };

  if (loading) {
    return (
      <div className="analytics-loading">
        <div className="spinner" />
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analytics-error">
        <div className="error-icon">⚠️</div>
        <h3>Error</h3>
        <p>{error}</p>
        <button onClick={fetchAggregatedData} className="retry-btn">
          Retry
        </button>
      </div>
    );
  }

  if (isPrivate) {
    return (
      <div className="private-analytics">
        <div className="private-content">
          <div className="private-icon">🔒</div>
          <h2>Private Analytics</h2>
          <p>This URL's analytics are private</p>
          {!isAuthenticated ? (
            <button onClick={() => navigate('/login')} className="login-btn">
              Log in to view
            </button>
          ) : (
            <button onClick={() => handleUrlChange('overall')} className="overall-btn">
              View Overall Analytics
            </button>
          )}
        </div>
      </div>
    );
  }

  if (!fullData) {
    return <div className="no-data">No data available</div>;
  }

  const summary = fullData.summary || {};
  const timeSeries = fullData.timeSeries || [];
  const countries = fullData.countries || [];
  const browsers = fullData.browsers || [];
  const operatingSystems = fullData.operatingSystems || [];
  const languages = fullData.languages || [];
  const hourly = fullData.hourly || [];

  return (
    <div className="analytics-page">
      <Helmet>
        <title>
          {selectedUrl === 'overall'
            ? 'Overall Analytics'
            : `Analytics for /${selectedUrl}`} | OmsUrl
        </title>
      </Helmet>

      <section className="analytics-selectors-section">
        <div className="selectors-container">
          <div className="selector-group">
            <label className="selector-label">Select URL</label>
            <div className="selector-with-actions">
              <select
                value={selectedUrl}
                onChange={(e) => handleUrlChange(e.target.value)}
                className="url-selector"
              >
                <option value="overall">Overall Analytics</option>
                {userUrls.map((url) => (
                  <option key={url._id} value={url.alias}>
                    /{url.alias}
                  </option>
                ))}
              </select>
              {selectedUrl !== 'overall' && urlInfo && (
                <a
                  href={`/${urlInfo.alias}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="visit-url-btn"
                  title="Visit URL"
                >
                  ↗
                </a>
              )}
            </div>
          </div>

          <div className="selector-group">
            <label className="selector-label">Time Range</label>
            <div className="time-selector-container">
              <div className="time-range-buttons">
                {['today', 'yesterday', 'last7days', 'last30days', 'overall'].map((range) => (
                  <button
                    key={range}
                    className={`time-range-btn ${timeRange === range ? 'active' : ''}`}
                    onClick={() => handleTimeRangeChange(range)}
                  >
                    {range === 'today' ? 'Today' :
                     range === 'yesterday' ? 'Yesterday' :
                     range === 'last7days' ? 'Last 7 Days' :
                     range === 'last30days' ? 'Last 30 Days' :
                     range === 'overall' ? 'Overall' : range}
                  </button>
                ))}
                <button
                  className={`time-range-btn ${timeRange === 'custom' ? 'active' : ''}`}
                  onClick={() => handleTimeRangeChange('custom')}
                >
                  Custom
                </button>
              </div>
              {timeRange === 'custom' && (
                <div className="custom-date-selector">
                  <div className="date-input-group">
                    <label>From</label>
                    <input
                      type="date"
                      value={customDate.from}
                      onChange={(e) => setCustomDate((prev) => ({ ...prev, from: e.target.value }))}
                      max={customDate.to || new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div className="date-input-group">
                    <label>To</label>
                    <input
                      type="date"
                      value={customDate.to}
                      onChange={(e) => setCustomDate((prev) => ({ ...prev, to: e.target.value }))}
                      min={customDate.from}
                      max={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="selector-group export-group">
            <label className="selector-label">Local Time</label>
            <div className="timezone-buttons">
              {['utc', 'local', 'est', 'pst', 'gmt', 'cet'].map((zone) => (
                <button
                  key={zone}
                  className={`timezone-btn ${localTime === zone ? 'active' : ''}`}
                  onClick={() => setLocalTime(zone)}
                >
                  {zone.toUpperCase()}
                </button>
              ))}
            </div>
            <button
              className="export-main-btn"
              onClick={() => setExportModalOpen(true)}
              title="Export Report"
            >
              📄 Export
            </button>
          </div>
        </div>

        <div className="section-small-stats">
          <div className="stat-item">
            <span className="stat-label">Total Visitors</span>
            <span className="stat-value">{summary.totalVisitors ?? 0}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Total Clicks</span>
            <span className="stat-value">{summary.totalClicks ?? 0}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Engagement Rate</span>
            <span className="stat-value">
              {summary.engagementRate ? `${summary.engagementRate}%` : '0%'}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Unique Visitors</span>
            <span className="stat-value">{summary.uniqueVisitors ?? 0}</span>
          </div>
        </div>
      </section>

      <section className="stats-chart-section">
        <div className="section-header">
          <h2>Visitor Trends</h2>
          <span className="time-range-label">{getTimeRangeLabel()}</span>
        </div>
        <StatsChart data={timeSeries} external />
      </section>

      <section className="top-countries-section">
        <div className="section-header">
          <h2>Top Countries</h2>
        </div>
        <TopCountriesChart data={countries} external />
      </section>

      <section className="browser-usage-section">
        <div className="section-header">
          <h2>Browser Usage</h2>
        </div>
        <BrowserUsageChart data={browsers} external />
      </section>

      <section className="os-usage-section">
        <div className="section-header">
          <h2>Operating Systems</h2>
        </div>
        <OperatingSystemChart data={operatingSystems} external />
      </section>

      <section className="language-section">
        <div className="section-header">
          <h2>Languages</h2>
        </div>
        <LanguageChart data={languages} external />
      </section>

      <section className="hourly-analytics-section">
        <div className="section-header">
          <h2>Hourly Traffic</h2>
        </div>
        <HourlyAnalyticsChart data={hourly} external />
      </section>

      {selectedUrl !== 'overall' && urlInfo && urlInfo.multipleDestinationRules?.length > 0 && (
        <section className="sankey-section">
          <div className="section-header">
            <h2>Destination Routing</h2>
          </div>
          <MultipleDestinationRoutingChart
            alias={selectedUrl}
            data={urlInfo.multipleDestinationRules}
            external
          />
        </section>
      )}

      <section className="recent-visitors-section">
        <div className="section-header">
          <h2>Recent Visitors</h2>
        </div>
        <RecentVisitorsWidget
          alias={selectedUrl}
          externalData={fullData.recentVisitors}
          external
        />
      </section>

      <section className="analytics-overview-section">
        <div className="section-header">
          <h2>Overview Summary</h2>
        </div>
        <AnalyticsOverview data={summary} external />
      </section>

      <ExportModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        selectedUrl={selectedUrl}
        timeRangeLabel={getTimeRangeLabel()}
      />
    </div>
  );
};

export default AnalyticsPage;