import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { analyticsAPI, urlAPI } from '../../services/api';
import StatsChart from '../../components/Analytics/StatsChart';
import TopCountriesChart from '../../components/Analytics/TopCountriesChart';
import './Analytics.css';

const AnalyticsPage = () => {
  const { t } = useTranslation();
  const { alias } = useParams();
  const { user, isAuthenticated } = useContext(AuthContext);

  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [timeSeriesData, setTimeSeriesData] = useState(null);
  const [countriesData, setCountriesData] = useState(null);
  const [urlInfo, setUrlInfo] = useState(null);
  const [userUrls, setUserUrls] = useState([]);

  // Selectors state
  const [selectedUrl, setSelectedUrl] = useState(alias || 'overall');
  const [timeRange, setTimeRange] = useState('overall');
  const [localTime, setLocalTime] = useState('utc');
  const [customDate, setCustomDate] = useState({
    from: '',
    to: ''
  });

  const [viewMode, setViewMode] = useState('chart');

  // Error / privacy
  const [, setError] = useState(null);
  const [isPrivate, setIsPrivate] = useState(false);

  const fetchUserUrls = useCallback(async () => {
    if (!user) return;

    try {
      const response = await urlAPI.getUrls();
      setUserUrls(response.data.urls || []);
    } catch (err) {
      console.error('Error fetching user URLs:', err);
    }
  }, [user]);

  const updateStats = (data) => {
    // central place to update analyticsData state (kept simple)
    if (!data) return;
    setAnalyticsData(data);
  };

  const fetchAnalyticsData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setIsPrivate(false);

      // Build query parameters
      const params = {
        timeframe: timeRange,
        timezone: localTime
      };

      if (timeRange === 'custom') {
        if (customDate.from && customDate.to) {
          params.from = customDate.from;
          params.to = customDate.to;
        } else {
          // Default to last 30 days if custom dates not specified
          const toDate = new Date();
          const fromDate = new Date();
          fromDate.setDate(fromDate.getDate() - 30);

          params.from = fromDate.toISOString().split('T')[0];
          params.to = toDate.toISOString().split('T')[0];

          setCustomDate({
            from: params.from,
            to: params.to
          });
        }
      }

      // Fetch URL info if specific URL selected
      if (selectedUrl !== 'overall' && selectedUrl !== '') {
        try {
          // Use the public endpoint to get basic info (handles public/private)
          const urlResponse = await analyticsAPI.urlPublic(selectedUrl);
          if (urlResponse.data?.success !== false) {
            // Some public endpoints return shape { success, data }
            setUrlInfo(urlResponse.data.data ?? urlResponse.data);
            setIsPrivate(false);
          }
        } catch (err) {
          if (err.response?.status === 403) {
            setIsPrivate(true);
            setLoading(false);
            return;
          }
          if (err.response?.status === 404) {
            setError(t('analytics.urlNotFound'));
            return;
          }
          console.error('Error fetching URL info:', err);
        }
      }

      // Check if analytics is private and user is not logged in
      if (isPrivate && !isAuthenticated) {
        setLoading(false);
        return;
      }

      // Fetch analytics data
      let analyticsResponse;
      if (selectedUrl === 'overall' || selectedUrl === '') {
        if (isAuthenticated) {
          analyticsResponse = await analyticsAPI.overall(params);
        } else {
          setError(t('analytics.loginRequired'));
          setLoading(false);
          return;
        }
      } else {
        // For authenticated users, use full analytics
        if (isAuthenticated) {
          try {
            analyticsResponse = await analyticsAPI.url(selectedUrl, params);
          } catch (err) {
            if (err.response?.status === 403) {
              setIsPrivate(true);
              setLoading(false);
              return;
            }
            throw err;
          }
        } else {
          // For non-authenticated users, use public analytics
          try {
            analyticsResponse = await analyticsAPI.urlPublic(selectedUrl);
          } catch (err) {
            if (err.response?.status === 403) {
              setIsPrivate(true);
              setLoading(false);
              return;
            }
            throw err;
          }
        }
      }

      if (analyticsResponse?.data) {
        // Some endpoints return { success, data } and some return raw data
        const payload = analyticsResponse.data.data ?? analyticsResponse.data;
        updateStats(payload);

        // If we have timeSeries data in the response, use it
        if (payload.timeSeries) {
          setTimeSeriesData(payload.timeSeries);
        } else {
          setTimeSeriesData(null);
        }
      }

      // For authenticated users, fetch detailed analytics
      if (isAuthenticated && selectedUrl !== 'overall' && selectedUrl !== '') {
        try {
          const timeSeriesResponse = await analyticsAPI.timeseries(selectedUrl, params);
          setTimeSeriesData(timeSeriesResponse.data ?? timeSeriesResponse.data?.data);

          const countriesResponse = await analyticsAPI.countries(selectedUrl, params);
          setCountriesData(countriesResponse.data ?? countriesResponse.data?.data);
        } catch (err) {
          console.error('Error fetching detailed analytics:', err);
          // Fallback to basic data already set above
        }
      } else {
        // For non-authenticated users, use the basic data from public endpoint
        const basicCountries = analyticsResponse?.data?.data?.countries ?? analyticsResponse?.data?.countries ?? analyticsResponse?.data;
        if (basicCountries?.countries) {
          setCountriesData(basicCountries.countries);
        } else if (analyticsResponse?.data?.countries) {
          setCountriesData(analyticsResponse.data.countries);
        } else if (analyticsResponse?.data?.data?.countries) {
          setCountriesData(analyticsResponse.data.data.countries);
        } else if (analyticsResponse?.data?.length) {
          // sometimes endpoint returns array
          setCountriesData(analyticsResponse.data);
        }
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);

      if (err.response?.status === 403) {
        setIsPrivate(true);
      } else if (err.response?.status === 404) {
        setError(t('analytics.urlNotFound'));
      } else {
        setError(err.response?.data?.message || t('analytics.fetchError'));
      }
    } finally {
      setLoading(false);
    }
  }, [selectedUrl, timeRange, localTime, customDate, isAuthenticated, isPrivate, t]);

  useEffect(() => {
    fetchAnalyticsData();
    if (user) {
      fetchUserUrls();
    }
  }, [fetchAnalyticsData, fetchUserUrls, user]);

  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
    if (range !== 'custom') {
      setCustomDate({ from: '', to: '' });
    }
  };

  const getTimeRangeLabel = () => {
    switch (timeRange) {
      case 'today': return t('analytics.today');
      case 'yesterday': return t('analytics.yesterday');
      case 'last7days': return t('analytics.last7Days');
      case 'last30days': return t('analytics.last30Days');
      case 'last60days': return t('analytics.last60Days');
      case 'lastYear': return t('analytics.lastYear');
      case 'custom':
        if (customDate.from && customDate.to) {
          return `${customDate.from} to ${customDate.to}`;
        }
        return t('analytics.customDate');
      default: return t('analytics.overall');
    }
  };

  const formatChartData = () => {
    const series = timeSeriesData ?? analyticsData?.timeSeries;
    if (!series) return null;

    const labels = series.map(point => {
      const date = new Date(point.date);
      switch (timeRange) {
        case 'today':
        case 'yesterday':
          return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        case 'last7days':
        case 'last30days':
        case 'last60days':
          return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
        default:
          return date.toLocaleDateString();
      }
    });

    return {
      labels,
      datasets: [
        {
          label: t('analytics.visitors'),
          data: series.map(point => point.visitors ?? 0),
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          fill: true,
        },
        {
          label: t('analytics.clicks'),
          data: series.map(point => point.clicks ?? 0),
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          fill: true,
        }
      ]
    };
  };

  const isPrivateAnalytics = () => {
    return isPrivate ||
           analyticsData?.error === 'private' ||
           (urlInfo?.analyticsPrivate && !user);
  };

  if (loading) {
    return (
      <div className="analytics-loading">
        <div className="spinner"></div>
        <p>{t('common.loading')}</p>
      </div>
    );
  }

  if (isPrivateAnalytics()) {
    return (
      <div className="private-analytics">
        <div className="private-message">
          <h2>🔒 {t('analytics.privateTitle')}</h2>
          <p>{t('analytics.privateMessage')}</p>
          {!user ? (
            <button className="login-btn">
              {t('analytics.loginToView')}
            </button>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-page">
      {/* Section 1: Selectors */}
      <section className="analytics-selectors">
        <div className="selector-group">
          <label>{t('analytics.urlSelector')}</label>
          <select
            value={selectedUrl}
            onChange={(e) => setSelectedUrl(e.target.value)}
            className="url-selector"
          >
            <option value="overall">{t('analytics.overall')}</option>
            {userUrls.map(url => (
              <option key={url._id} value={url.alias}>
                /{url.alias}
              </option>
            ))}
          </select>
        </div>

        <div className="selector-group">
          <label>{t('analytics.timeSelector')}</label>
          <div className="time-selector">
            <select
              value={timeRange}
              onChange={(e) => handleTimeRangeChange(e.target.value)}
              className="time-range-selector"
            >
              <option value="overall">{t('analytics.overall')}</option>
              <option value="today">{t('analytics.today')}</option>
              <option value="yesterday">{t('analytics.yesterday')}</option>
              <option value="last7days">{t('analytics.last7Days')}</option>
              <option value="last30days">{t('analytics.last30Days')}</option>
              <option value="last60days">{t('analytics.last60Days')}</option>
              <option value="lastYear">{t('analytics.lastYear')}</option>
              <option value="custom">{t('analytics.customDate')}</option>
            </select>

            {timeRange === 'custom' && (
              <div className="custom-date-inputs">
                <input
                  type="date"
                  value={customDate.from}
                  onChange={(e) => setCustomDate(prev => ({
                    ...prev,
                    from: e.target.value
                  }))}
                  placeholder={t('analytics.fromDate')}
                />
                <span>to</span>
                <input
                  type="date"
                  value={customDate.to}
                  onChange={(e) => setCustomDate(prev => ({
                    ...prev,
                    to: e.target.value
                  }))}
                  placeholder={t('analytics.toDate')}
                />
              </div>
            )}
          </div>
        </div>

        <div className="selector-group">
          <label>{t('analytics.localTime')}</label>
          <select
            value={localTime}
            onChange={(e) => setLocalTime(e.target.value)}
            className="timezone-selector"
          >
            <option value="utc">UTC</option>
            <option value="local">{t('analytics.local')}</option>
            <option value="est">EST</option>
            <option value="pst">PST</option>
            <option value="gmt">GMT</option>
            <option value="cet">CET</option>
          </select>
        </div>
      </section>

      {/* URL Info and Small Stats */}
      {selectedUrl !== 'overall' && urlInfo && (
        <div className="url-info-card">
          <div className="url-info">
            <h3>/<a href={`/${urlInfo.alias}`} target="_blank" rel="noopener noreferrer">{urlInfo.alias}</a></h3>
            <p className="destination">
              {t('analytics.destination')}:{' '}
              <a href={urlInfo.longUrl} target="_blank" rel="noopener noreferrer">
                {urlInfo.longUrl}
              </a>
            </p>
            {urlInfo.createdAt && (
              <p className="created-date">
                {t('analytics.created')}: {new Date(urlInfo.createdAt).toLocaleDateString()}
              </p>
            )}
          </div>

          <div className="small-stats">
            <div className="small-stat">
              <div className="stat-value">{analyticsData?.totalVisitors || 0}</div>
              <div className="stat-label">{t('analytics.totalVisitors')}</div>
            </div>
            <div className="small-stat">
              <div className="stat-value">{analyticsData?.totalClicks || 0}</div>
              <div className="stat-label">{t('analytics.totalClicks')}</div>
            </div>
            <div className="small-stat">
              <div className="stat-value">{analyticsData?.engagementRate ?? '0%'}</div>
              <div className="stat-label">{t('analytics.engagement')}</div>
            </div>
            <div className="small-stat">
              <div className="stat-value">{analyticsData?.uniqueVisitors || 0}</div>
              <div className="stat-label">{t('analytics.uniqueVisitors')}</div>
            </div>
          </div>
        </div>
      )}

      {/* Section 2: Stats Chart */}
      <section className="analytics-chart-section">
        <div className="section-header">
          <h2>{t('analytics.visitorTrends')}</h2>
          <span className="time-range-label">{getTimeRangeLabel()}</span>
        </div>

        <div className="chart-container">
          <StatsChart
            data={formatChartData()}
            title=""
            type="line"
          />
        </div>

        {selectedUrl === 'overall' && (
          <div className="overall-stats">
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-content">
                <h3>{t('analytics.totalVisitors')}</h3>
                <p className="stat-number">{analyticsData?.totalVisitors || 0}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🔗</div>
              <div className="stat-content">
                <h3>{t('analytics.totalUrls')}</h3>
                <p className="stat-number">{analyticsData?.totalUrls || 0}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📈</div>
              <div className="stat-content">
                <h3>{t('analytics.engagementRate')}</h3>
                <p className="stat-number">{analyticsData?.engagementRate || '0%'}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📊</div>
              <div className="stat-content">
                <h3>{t('analytics.avgClickRate')}</h3>
                <p className="stat-number">{analyticsData?.avgClickRate || '0%'}</p>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Section 3: Top Countries Chart */}
      <section className="analytics-countries-section">
        <div className="section-header">
          <h2>{t('analytics.topCountries')}</h2>
          <div className="view-mode-toggle">
            <button
              className={`view-mode-btn ${viewMode === 'chart' ? 'active' : ''}`}
              onClick={() => setViewMode('chart')}
            >
              {t('analytics.chart')}
            </button>
            <button
              className={`view-mode-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
            >
              {t('analytics.table')}
            </button>
            <button
              className={`view-mode-btn ${viewMode === 'map' ? 'active' : ''}`}
              onClick={() => setViewMode('map')}
            >
              {t('analytics.map')}
            </button>
          </div>
        </div>

        <div className="countries-container">
          <TopCountriesChart
            data={countriesData}
            viewMode={viewMode}
          />
        </div>

        {countriesData?.length > 0 && (
          <div className="countries-summary">
            <div className="summary-card">
              <h4>{t('analytics.topCountry')}</h4>
              <p className="country-name">{countriesData[0]?.country}</p>
              <p className="country-visitors">
                {countriesData[0]?.visitors} {t('analytics.visitors')}
              </p>
            </div>
            <div className="summary-card">
              <h4>{t('analytics.totalCountries')}</h4>
              <p className="country-count">{countriesData.length}</p>
            </div>
          </div>
        )}
      </section>

      {/* Premium Analytics Sections (Login Required) */}
      {!user && (
        <div className="premium-analytics-upsell">
          <h3>🔒 {t('analytics.premiumFeatures')}</h3>
          <p>{t('analytics.loginRequiredMessage')}</p>
          <div className="premium-features">
            <div className="premium-feature">
              <div className="feature-icon">📱</div>
              <span>{t('analytics.deviceAnalytics')}</span>
            </div>
            <div className="premium-feature">
              <div className="feature-icon">🌍</div>
              <span>{t('analytics.realTimeAnalytics')}</span>
            </div>
            <div className="premium-feature">
              <div className="feature-icon">🔔</div>
              <span>{t('analytics.alerts')}</span>
            </div>
            <div className="premium-feature">
              <div className="feature-icon">📊</div>
              <span>{t('analytics.advancedCharts')}</span>
            </div>
          </div>
          <button className="login-btn">
            {t('analytics.loginToView')}
          </button>
        </div>
      )}
    </div>
  );
};

export default AnalyticsPage;
