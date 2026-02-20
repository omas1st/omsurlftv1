// src/pages/UserDashboard/UserDashboard.jsx
import React, { useState, useEffect, useContext, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { urlAPI, analyticsAPI } from '../../services/api';
import URLShortener from '../../components/URLShortener/URLShortener';
import QRCodeShortener from '../../components/QRCodeShortener/QRCodeShortener';
import TextDestination from '../../components/TextDestination/TextDestination';
import Tabs from '../../components/Tabs/Tabs';
import StatsChart from '../../components/Analytics/StatsChart';
import './UserDashboard.css';

const UserDashboard = () => {
  const { user } = useContext(AuthContext);

  const [activeTab, setActiveTab] = useState('url');
  const [stats, setStats] = useState({
    totalUrls: 0,
    totalVisitors: 0,
    todayVisitors: 0,
    engagement: 0
  });
  const [recentUrls, setRecentUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [showCoinInfo, setShowCoinInfo] = useState(false); // State for coin info popup

  // ✅ Mounted ref – defined at top level, never inside a callback
  const mountedRef = useRef(true);

  // Helper function to create mock chart data
  const createMockChartData = useCallback(() => {
    const days = 7;
    const mockData = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const visitors = Math.floor(Math.random() * 100) + 10;
      const clicks = Math.floor(visitors * (Math.random() * 0.5 + 0.3));
      mockData.push({
        date: date.toISOString().split('T')[0],
        visitors,
        clicks,
        uniqueVisitors: Math.floor(visitors * 0.8)
      });
    }
    return mockData;
  }, []);

  const formatNumber = useCallback((num) => {
    if (num === undefined || num === null) return '0';
    const number = typeof num === 'string' ? parseFloat(num) : num;
    if (isNaN(number)) return '0';
    if (number >= 1000000) return (number / 1000000).toFixed(1) + 'M';
    if (number >= 1000) return (number / 1000).toFixed(1) + 'K';
    return number.toString();
  }, []);

  // ─────────────────────────────────────────────────────────
  // Data fetching – defined as useCallback, stable reference
  // ─────────────────────────────────────────────────────────
  const fetchDashboardData = useCallback(async () => {
    // Skip if component already unmounted
    if (!mountedRef.current) return;

    try {
      setLoading(true);

      // ------------------- Fetch stats -------------------
      const statsResponse = await analyticsAPI.getOverall();
      if (!mountedRef.current) return;
      console.log('Analytics response:', statsResponse.data);

      // Extract summary from different possible response structures
      let summary = null;
      let timeSeries = null;

      if (statsResponse.data?.data?.summary) {
        // Structure: { success: true, data: { summary: {...}, timeSeries: [...] } }
        summary = statsResponse.data.data.summary;
        timeSeries = statsResponse.data.data.timeSeries;
      } else if (statsResponse.data?.summary) {
        // Structure: { success: true, summary: {...}, timeSeries: [...] }
        summary = statsResponse.data.summary;
        timeSeries = statsResponse.data.timeSeries;
      }

      if (summary) {
        // Helper to get engagement rate from possible field names
        const getEngagement = (s) => {
          return s.avgEngagementRate ?? s.avgEngagement ?? s.engagement ?? 0;
        };

        setStats({
          totalUrls: summary.totalUrls || 0,
          totalVisitors: summary.totalVisitors || 0,
          todayVisitors: summary.todayVisitors || 0,
          engagement: getEngagement(summary)
        });
        setAnalyticsData(timeSeries || createMockChartData());
      } else {
        // No summary at all – use mock data
        setAnalyticsData(createMockChartData());
      }

      // ------------------- Fetch recent URLs -------------------
      try {
        const urlsResponse = await urlAPI.getAll({ limit: 5 });
        if (!mountedRef.current) return;
        const urls = urlsResponse.data?.data?.urls || urlsResponse.data?.urls || [];
        setRecentUrls(urls.slice(0, 5));
      } catch (urlError) {
        if (mountedRef.current) {
          console.log('Error fetching recent URLs:', urlError);
        }
        setRecentUrls([]);
      }
    } catch (error) {
      if (mountedRef.current) {
        console.error('Error fetching dashboard data:', error);
      }
      setAnalyticsData(createMockChartData());
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [createMockChartData]); // only depends on mock creator (which is stable)

  // ─────────────────────────────────────────────────────────
  // Effect: mount, fetch, cleanup
  // ─────────────────────────────────────────────────────────
  useEffect(() => {
    mountedRef.current = true;
    fetchDashboardData();

    return () => {
      mountedRef.current = false;
    };
  }, [fetchDashboardData]);

  const tabs = [
    { id: 'url', label: 'URL Shortener', component: URLShortener },
    { id: 'qr', label: 'QR Code', component: QRCodeShortener },
    { id: 'text', label: 'Text Page', component: TextDestination }
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component;

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="user-dashboard">
      {/* Section 1: Header with welcome message, coin balance, and tier */}
      <section className="dashboard-header">
        <div className="welcome-section">
          <h1>
            Welcome, <span className="username">{user?.username}</span>!
          </h1>
          <p className="welcome-message">Manage your URLs, QR codes, and text pages</p>
        </div>

        <div className="user-info-cards">
          <div className="info-card coin-balance">
            <div className="card-icon">🪙</div>
            <div className="card-content">
              <h3>
                Coin Balance
                <span 
                  className="coin-info-icon"
                  onClick={() => setShowCoinInfo(true)}
                  role="button"
                  tabIndex={0}
                  aria-label="Coin information"
                >
                  ⓘ
                </span>
              </h3>
              <p className="balance">{user?.coins || 0} coins</p>
            </div>
          </div>

          <div className="info-card tier-info">
            <div className="card-icon">⭐</div>
            <div className="card-content">
              <h3>Current Tier</h3>
              <p className="tier">{user?.tier || 'Free'}</p>
              {user?.tier === 'free' && (
                <button 
                  className="upgrade-btn"
                  onClick={() => alert("Feature not available yet")}
                >
                  Upgrade
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Coin Info Modal */}
      {showCoinInfo && (
        <div className="coin-info-modal-overlay" onClick={() => setShowCoinInfo(false)}>
          <div className="coin-info-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setShowCoinInfo(false)}>×</button>
            <h4>About Coins</h4>
            <ul>
              <li>✨ You received 100 coins for registration.</li>
              <li>📤 Upload features cost coins to use.</li>
              <li>✅ Other features are completely free.</li>
              <li>⏰ If your coins run out, visit daily to earn more.</li>
            </ul>
          </div>
        </div>
      )}

      {/* Section 2: Stats */}
      <section className="dashboard-stats">
        <h2 className="section-title">Statistics</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">🔗</div>
            <div className="stat-info">
              <h3>Total URLs</h3>
              <p className="stat-value">{formatNumber(stats.totalUrls)}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-info">
              <h3>Total Visitors</h3>
              <p className="stat-value">{formatNumber(stats.totalVisitors)}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📈</div>
            <div className="stat-info">
              <h3>Today's Visitors</h3>
              <p className="stat-value">{formatNumber(stats.todayVisitors)}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">💬</div>
            <div className="stat-info">
              <h3>Engagement</h3>
              <p className="stat-value">{formatNumber(stats.engagement)}%</p>
            </div>
          </div>
        </div>

        {analyticsData && Array.isArray(analyticsData) && analyticsData.length > 0 && (
          <div className="stats-chart-container">
            <StatsChart
              data={analyticsData}
              title="Visitor Trends"
              external
            />
          </div>
        )}
      </section>

      {/* Section 3: URL Shortener Component */}
      <section className="dashboard-shortener">
        <h2 className="section-title">Create New</h2>
        <div className="shortener-container">
          <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
          <div className="tab-content">
            {ActiveComponent && <ActiveComponent />}
          </div>
        </div>
      </section>

      {/* Section 4: Quick Actions */}
      <section className="quick-actions">
        <h2 className="section-title">Quick Actions</h2>
        <div className="actions-grid">
          <Link to="/analytics" className="action-card">
            <div className="action-icon">📊</div>
            <h3>Analytics</h3>
            <p>View detailed analytics</p>
          </Link>

          <Link to="/manage" className="action-card">
            <div className="action-icon">⚙️</div>
            <h3>Manage URLs</h3>
            <p>Manage all your links</p>
          </Link>

          <Link 
            to="/settings" 
            className="action-card"
            onClick={(e) => {
              e.preventDefault();
              alert("Feature not available yet");
            }}
          >
            <div className="action-icon">⚡</div>
            <h3>Advanced</h3>
            <p>Configure advanced settings</p>
          </Link>

          <Link 
            to="/refer" 
            className="action-card"
            onClick={(e) => {
              e.preventDefault();
              alert("Feature not available yet");
            }}
          >
            <div className="action-icon">🎁</div>
            <h3>Refer & Earn</h3>
            <p>Earn coins by referring friends</p>
          </Link>
        </div>
      </section>

      {/* Section 5: Recent URLs */}
      <section className="recent-urls">
        <div className="section-header">
          <h2 className="section-title">Recent URLs</h2>
          <Link to="/manage" className="view-all">
            View All →
          </Link>
        </div>

        {recentUrls.length === 0 ? (
          <div className="no-urls">
            <p>No URLs created yet</p>
            <p>Start by creating your first short URL above</p>
          </div>
        ) : (
          <div className="urls-table">
            <div className="table-header">
              <div>Alias</div>
              <div>Destination</div>
              <div>Visitors</div>
              <div>Actions</div>
            </div>

            {recentUrls.slice(0, 5).map((url) => (
              <div key={url._id || url.alias} className="table-row">
                <div className="alias-cell">
                  <a
                    href={`${window.location.origin}/${url.alias}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    /{url.alias}
                  </a>
                </div>
                <div className="destination-cell">
                  <a
                    href={url.longUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="destination-link"
                  >
                    {url.longUrl ? url.longUrl.substring(0, 50) + '...' : 'N/A'}
                  </a>
                </div>
                <div className="visitors-cell">
                  {url.visitors || 0}
                </div>
                <div className="actions-cell">
                  <Link
                    to={`/${url.alias}/analytics`}
                    className="action-btn analytics-btn"
                  >
                    📊
                  </Link>
                  <Link
                    to={`/manage/edit/${url._id}`}
                    className="action-btn edit-btn"
                  >
                    ✏️
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default UserDashboard;