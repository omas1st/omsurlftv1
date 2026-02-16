import React, { useState, useEffect, useCallback } from 'react';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';
import './AdminPanel.css';

const ProjectManagement = () => {
  const [urls, setUrls] = useState([]);
  const [filteredUrls, setFilteredUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    type: 'all',
    status: 'all',
    minClicks: '',
    maxClicks: '',
    dateFrom: '',
    dateTo: ''
  });
  
  const [selectedUrl, setSelectedUrl] = useState(null);
  const [showRestrictModal, setShowRestrictModal] = useState(false);
  const [restrictData, setRestrictData] = useState({
    reason: '',
    notifyOwner: true
  });

  const fetchUrls = useCallback(async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getUrls();
      setUrls(response.data.urls);
      setFilteredUrls(response.data.urls);
    } catch (error) {
      toast.error('Failed to fetch URLs');
    } finally {
      setLoading(false);
    }
  }, []);

  const applyFilters = useCallback(() => {
    let filtered = [...urls];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(url =>
        url.alias.toLowerCase().includes(term) ||
        url.longUrl?.toLowerCase().includes(term) ||
        url.owner?.username?.toLowerCase().includes(term) ||
        url.owner?.email?.toLowerCase().includes(term)
      );
    }

    // Type filter
    if (filters.type !== 'all') {
      filtered = filtered.filter(url => url.type === filters.type);
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(url => {
        if (filters.status === 'active') return url.active && !url.restricted;
        if (filters.status === 'paused') return !url.active;
        if (filters.status === 'restricted') return url.restricted;
        return true;
      });
    }

    // Clicks filter
    if (filters.minClicks) {
      const min = parseInt(filters.minClicks);
      filtered = filtered.filter(url => url.clicks >= min);
    }
    
    if (filters.maxClicks) {
      const max = parseInt(filters.maxClicks);
      filtered = filtered.filter(url => url.clicks <= max);
    }

    // Date filter
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      filtered = filtered.filter(url => new Date(url.createdAt) >= fromDate);
    }
    
    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      filtered = filtered.filter(url => new Date(url.createdAt) <= toDate);
    }

    setFilteredUrls(filtered);
  }, [urls, searchTerm, filters]);

  useEffect(() => {
    fetchUrls();
  }, [fetchUrls]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const handleRestrictUrl = (url) => {
    setSelectedUrl(url);
    setRestrictData({
      reason: '',
      notifyOwner: true
    });
    setShowRestrictModal(true);
  };

  const confirmRestrictUrl = async () => {
    try {
      await adminAPI.restrictUrl(selectedUrl._id, restrictData);
      
      toast.success('URL restricted successfully');
      setShowRestrictModal(false);
      setSelectedUrl(null);
      fetchUrls();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to restrict URL');
    }
  };

  const getUrlTypeIcon = (type) => {
    switch (type) {
      case 'qr': return '📱';
      case 'text': return '📝';
      default: return '🔗';
    }
  };

  const getStatusBadge = (url) => {
    if (url.restricted) {
      return <span className="badge restricted">Restricted</span>;
    }
    if (!url.active) {
      return <span className="badge paused">Paused</span>;
    }
    return <span className="badge active">Active</span>;
  };

  const getOwnerInfo = (url) => {
    if (url.owner) {
      return `${url.owner.username} (${url.owner.email})`;
    }
    return 'Anonymous';
  };

  const resetFilters = () => {
    setSearchTerm('');
    setFilters({
      type: 'all',
      status: 'all',
      minClicks: '',
      maxClicks: '',
      dateFrom: '',
      dateTo: ''
    });
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="project-management">
      <div className="management-header">
        <h2>Project Management</h2>
        <p className="subtitle">
          Total URLs: {urls.length}
        </p>
      </div>

      {/* Filters */}
      <div className="management-filters">
        <div className="filter-group">
          <input
            type="text"
            placeholder="Search by alias, destination, or owner..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          
          <select
            value={filters.type}
            onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
            className="type-filter"
          >
            <option value="all">All Types</option>
            <option value="url">URLs</option>
            <option value="qr">QR Codes</option>
            <option value="text">Text Pages</option>
          </select>
          
          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className="status-filter"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="restricted">Restricted</option>
          </select>
          
          <input
            type="number"
            placeholder="Min Clicks"
            value={filters.minClicks}
            onChange={(e) => setFilters(prev => ({ ...prev, minClicks: e.target.value }))}
            className="number-filter"
            min="0"
          />
          
          <input
            type="number"
            placeholder="Max Clicks"
            value={filters.maxClicks}
            onChange={(e) => setFilters(prev => ({ ...prev, maxClicks: e.target.value }))}
            className="number-filter"
            min="0"
          />
          
          <button onClick={resetFilters} className="reset-filters-btn">
            Reset Filters
          </button>
        </div>
      </div>

      {/* URLs Table */}
      <div className="management-table">
        <table>
          <thead>
            <tr>
              <th>Type</th>
              <th>Short URL</th>
              <th>Destination</th>
              <th>Clicks</th>
              <th>Owner</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUrls.map((url) => (
              <tr key={url._id}>
                <td>
                  <span className="type-icon">
                    {getUrlTypeIcon(url.type)}
                  </span>
                </td>
                <td>
                  <a
                    href={`${window.location.origin}/${url.alias}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="short-url-link"
                  >
                    /{url.alias}
                  </a>
                </td>
                <td>
                  {url.type === 'text' ? (
                    <span className="text-preview">
                      {url.textContent?.substring(0, 30)}...
                    </span>
                  ) : (
                    <a
                      href={url.longUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="destination-link"
                    >
                      {url.longUrl?.substring(0, 50)}...
                    </a>
                  )}
                </td>
                <td>
                  <div className="clicks-cell">
                    <strong>{url.clicks || 0}</strong>
                    {url.clicksToday > 0 && (
                      <small className="today-clicks">
                        +{url.clicksToday} today
                      </small>
                    )}
                  </div>
                </td>
                <td>{getOwnerInfo(url)}</td>
                <td>{getStatusBadge(url)}</td>
                <td>{new Date(url.createdAt).toLocaleDateString()}</td>
                <td>
                  <div className="action-buttons">
                    <a
                      href={`/${url.alias}/analytics`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="action-btn analytics-btn"
                      title="View Analytics"
                    >
                      📊
                    </a>
                    
                    {!url.restricted ? (
                      <button
                        onClick={() => handleRestrictUrl(url)}
                        className="action-btn restrict-btn"
                        title="Restrict"
                      >
                        ⛔
                      </button>
                    ) : (
                      <button
                        onClick={() => handleRestrictUrl(url)}
                        className="action-btn unrestrict-btn"
                        title="Unrestrict"
                      >
                        ✅
                      </button>
                    )}
                    
                    <button
                      onClick={() => {
                        // View details
                        window.open(`/admin/urls/${url._id}`, '_blank');
                      }}
                      className="action-btn details-btn"
                      title="View Details"
                    >
                      🔍
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredUrls.length === 0 && (
          <div className="no-results">
            <p>No URLs found matching your criteria</p>
          </div>
        )}
      </div>

      {/* Restrict Modal */}
      {showRestrictModal && (
        <div className="modal-overlay">
          <div className="admin-modal">
            <h3>
              {selectedUrl?.restricted ? 
                'Unrestrict URL' : 
                'Restrict URL'}
            </h3>
            <p>
              URL: /{selectedUrl?.alias}
            </p>
            
            <div className="modal-form">
              <div className="form-group">
                <label>Restriction Reason *</label>
                <textarea
                  value={restrictData.reason}
                  onChange={(e) => setRestrictData(prev => ({
                    ...prev,
                    reason: e.target.value
                  }))}
                  placeholder="Enter reason for restriction/unrestriction"
                  rows="4"
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={restrictData.notifyOwner}
                    onChange={(e) => setRestrictData(prev => ({
                      ...prev,
                      notifyOwner: e.target.checked
                    }))}
                  />
                  <span>Notify owner</span>
                </label>
              </div>
            </div>
            
            <div className="modal-actions">
              <button
                onClick={confirmRestrictUrl}
                className={`confirm-btn ${selectedUrl?.restricted ? '' : 'danger-btn'}`}
                disabled={!restrictData.reason.trim()}
              >
                {selectedUrl?.restricted ? 
                  'Confirm Unrestrict' : 
                  'Confirm Restrict'}
              </button>
              <button
                onClick={() => setShowRestrictModal(false)}
                className="cancel-btn"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectManagement;