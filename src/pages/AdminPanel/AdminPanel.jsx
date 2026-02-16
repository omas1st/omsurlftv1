import React, { useState, useEffect, useContext } from 'react';
import { Link, Routes, Route, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { adminAPI } from '../../services/api';
import UserManagement from './UserManagement';
import ProjectManagement from './ProjectManagement';
import './AdminPanel.css';

const AdminPanel = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalUrls: 0,
    totalClicks: 0,
    activeUsers: 0,
    restrictedUrls: 0
  });
  
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    if (location.pathname.includes('users')) {
      setActiveTab('users');
    } else if (location.pathname.includes('projects')) {
      setActiveTab('projects');
    } else {
      setActiveTab('dashboard');
    }
    
    fetchStats();
  }, [location]);

  const fetchStats = async () => {
    try {
      const response = await adminAPI.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching admin stats:', error);
    }
  };

  const formatNumber = (num) => {
    return num.toLocaleString();
  };

  if (!user || !user.isAdmin) {
    return (
      <div className="admin-access-denied">
        <h2>Access Denied</h2>
        <p>This area is for administrators only.</p>
        <Link to="/" className="back-home-btn">
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <h2>Admin Panel</h2>
          <p className="admin-greeting">
            Welcome, {user.username}
          </p>
        </div>
        
        <nav className="sidebar-nav">
          <Link 
            to="/admin" 
            className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <span className="nav-icon">📊</span>
            <span className="nav-text">Dashboard</span>
          </Link>
          
          <Link 
            to="/admin/users" 
            className={`nav-link ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <span className="nav-icon">👥</span>
            <span className="nav-text">User Management</span>
          </Link>
          
          <Link 
            to="/admin/projects" 
            className={`nav-link ${activeTab === 'projects' ? 'active' : ''}`}
            onClick={() => setActiveTab('projects')}
          >
            <span className="nav-icon">🔗</span>
            <span className="nav-text">Project Management</span>
          </Link>
          
          <Link 
            to="/admin/settings" 
            className="nav-link"
          >
            <span className="nav-icon">⚙️</span>
            <span className="nav-text">Settings</span>
          </Link>
          
          <Link 
            to="/admin/logs" 
            className="nav-link"
          >
            <span className="nav-icon">📋</span>
            <span className="nav-text">Activity Logs</span>
          </Link>
        </nav>
        
        <div className="sidebar-footer">
          <Link to="/dashboard" className="user-dashboard-link">
            User Dashboard
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <header className="admin-header">
          <h1>Admin Dashboard</h1>
          <div className="admin-actions">
            <button className="refresh-btn" onClick={fetchStats}>
              🔄 Refresh
            </button>
            <div className="admin-time">
              {new Date().toLocaleString()}
            </div>
          </div>
        </header>

        {/* Dashboard Stats */}
        {activeTab === 'dashboard' && (
          <div className="admin-dashboard">
            <div className="stats-overview">
              <h2>Overview</h2>
              <div className="stats-grid">
                <div className="admin-stat-card">
                  <div className="stat-header">
                    <div className="stat-icon">👥</div>
                    <h3>Total Users</h3>
                  </div>
                  <p className="stat-value">{formatNumber(stats.totalUsers)}</p>
                  <div className="stat-trend">
                    <span className="trend-up">↑ 12%</span>
                    <span>from last month</span>
                  </div>
                </div>
                
                <div className="admin-stat-card">
                  <div className="stat-header">
                    <div className="stat-icon">🔗</div>
                    <h3>Total URLs</h3>
                  </div>
                  <p className="stat-value">{formatNumber(stats.totalUrls)}</p>
                  <div className="stat-trend">
                    <span className="trend-up">↑ 8%</span>
                    <span>from last month</span>
                  </div>
                </div>
                
                <div className="admin-stat-card">
                  <div className="stat-header">
                    <div className="stat-icon">👁️</div>
                    <h3>Total Clicks</h3>
                  </div>
                  <p className="stat-value">{formatNumber(stats.totalClicks)}</p>
                  <div className="stat-trend">
                    <span className="trend-up">↑ 15%</span>
                    <span>from last month</span>
                  </div>
                </div>
                
                <div className="admin-stat-card">
                  <div className="stat-header">
                    <div className="stat-icon">✅</div>
                    <h3>Active Users</h3>
                  </div>
                  <p className="stat-value">{formatNumber(stats.activeUsers)}</p>
                  <div className="stat-trend">
                    <span className="trend-up">↑ 5%</span>
                    <span>from last month</span>
                  </div>
                </div>
                
                <div className="admin-stat-card">
                  <div className="stat-header">
                    <div className="stat-icon">⛔</div>
                    <h3>Restricted URLs</h3>
                  </div>
                  <p className="stat-value">{formatNumber(stats.restrictedUrls)}</p>
                  <div className="stat-trend">
                    <span className="trend-down">↓ 3%</span>
                    <span>from last month</span>
                  </div>
                </div>
                
                <div className="admin-stat-card">
                  <div className="stat-header">
                    <div className="stat-icon">📈</div>
                    <h3>Growth</h3>
                  </div>
                  <p className="stat-value">24%</p>
                  <div className="stat-trend">
                    <span className="trend-up">↑ 4%</span>
                    <span>from last month</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="recent-activity">
              <h2>Recent Activity</h2>
              <div className="activity-list">
                <div className="activity-item">
                  <div className="activity-icon">🔗</div>
                  <div className="activity-content">
                    <p><strong>john_doe</strong> created a new URL</p>
                    <small>2 minutes ago</small>
                  </div>
                </div>
                <div className="activity-item">
                  <div className="activity-icon">📱</div>
                  <div className="activity-content">
                    <p><strong>jane_smith</strong> generated a QR code</p>
                    <small>15 minutes ago</small>
                  </div>
                </div>
                <div className="activity-item">
                  <div className="activity-icon">👤</div>
                  <div className="activity-content">
                    <p><strong>new_user</strong> registered</p>
                    <small>1 hour ago</small>
                  </div>
                </div>
                <div className="activity-item">
                  <div className="activity-icon">⛔</div>
                  <div className="activity-content">
                    <p><strong>admin</strong> restricted user <em>spammer123</em></p>
                    <small>3 hours ago</small>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="admin-quick-actions">
              <h2>Quick Actions</h2>
              <div className="quick-actions-grid">
                <button className="quick-action-btn">
                  <div className="action-icon">📧</div>
                  <span>Broadcast Email</span>
                </button>
                <button className="quick-action-btn">
                  <div className="action-icon">📊</div>
                  <span>Generate Report</span>
                </button>
                <button className="quick-action-btn">
                  <div className="action-icon">🔄</div>
                  <span>Backup Data</span>
                </button>
                <button className="quick-action-btn">
                  <div className="action-icon">🔍</div>
                  <span>Audit Logs</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Routes for User and Project Management */}
        <Routes>
          <Route path="users" element={<UserManagement />} />
          <Route path="projects" element={<ProjectManagement />} />
        </Routes>
      </main>
    </div>
  );
};

export default AdminPanel;