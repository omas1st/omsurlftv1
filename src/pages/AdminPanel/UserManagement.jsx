import React, { useState, useEffect, useCallback } from 'react';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';
import './UserManagement.css';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    minUrls: '',
    maxUrls: '',
    status: 'all'
  });
  
  const [selectedUser, setSelectedUser] = useState(null);
  const [showRestrictModal, setShowRestrictModal] = useState(false);
  const [restrictData, setRestrictData] = useState({
    reason: '',
    notifyUser: true,
    emailTemplate: 'default'
  });
  
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState({
    tier: '',
    coins: 0,
    isRestricted: false
  });

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await adminAPI.users(); // fixed method name
      setUsers(response.data.data.users);      // fixed response structure
      setFilteredUsers(response.data.data.users);
    } catch (error) {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, []);

  const applyFilters = useCallback(() => {
    let filtered = [...users];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(user =>
        user.username.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term)
      );
    }

    // Date filter
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      filtered = filtered.filter(user => new Date(user.createdAt) >= fromDate);
    }
    
    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      filtered = filtered.filter(user => new Date(user.createdAt) <= toDate);
    }

    // URL count filter
    if (filters.minUrls) {
      const min = parseInt(filters.minUrls);
      filtered = filtered.filter(user => user.urlsCreated >= min);
    }
    
    if (filters.maxUrls) {
      const max = parseInt(filters.maxUrls);
      filtered = filtered.filter(user => user.urlsCreated <= max);
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(user => 
        filters.status === 'restricted' ? user.isRestricted : !user.isRestricted
      );
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, filters]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const handleRestrictUser = (user) => {
    setSelectedUser(user);
    setRestrictData({
      reason: '',
      notifyUser: true,
      emailTemplate: 'default'
    });
    setShowRestrictModal(true);
  };

  const confirmRestrictUser = async () => {
    try {
      await adminAPI.restrictUser(selectedUser._id, restrictData);
      
      toast.success('User restricted successfully');
      setShowRestrictModal(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to restrict user');
    }
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setEditData({
      tier: user.tier || 'free',
      coins: user.coins || 0,
      isRestricted: user.isRestricted || false
    });
    setShowEditModal(true);
  };

  const saveEditUser = async () => {
    try {
      await adminAPI.updateUser(selectedUser._id, editData);
      
      toast.success('User updated successfully');
      setShowEditModal(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update user');
    }
  };

  const handleViewUrls = async (user) => {
    // Navigate to user's URLs page
    window.open(`/admin/users/${user._id}/urls`, '_blank');
  };

  const getStatusBadge = (user) => {
    if (user.isRestricted) {
      return <span className="badge restricted">Restricted</span>;
    }
    if (user.tier === 'premium') {
      return <span className="badge premium">Premium</span>;
    }
    return <span className="badge active">Active</span>;
  };

  const resetFilters = () => {
    setSearchTerm('');
    setFilters({
      dateFrom: '',
      dateTo: '',
      minUrls: '',
      maxUrls: '',
      status: 'all'
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
    <div className="user-management">
      <div className="management-header">
        <h2>User Management</h2>
        <p className="subtitle">
          Total Users: {users.length}
        </p>
      </div>

      {/* Filters */}
      <div className="management-filters">
        <div className="filter-group">
          <input
            type="text"
            placeholder="Search by username or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          
          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className="status-filter"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="restricted">Restricted</option>
          </select>
          
          <input
            type="date"
            placeholder="From date"
            value={filters.dateFrom}
            onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
            className="date-filter"
          />
          
          <input
            type="date"
            placeholder="To date"
            value={filters.dateTo}
            onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
            className="date-filter"
          />
          
          <input
            type="number"
            placeholder="Min URLs"
            value={filters.minUrls}
            onChange={(e) => setFilters(prev => ({ ...prev, minUrls: e.target.value }))}
            className="number-filter"
            min="0"
          />
          
          <input
            type="number"
            placeholder="Max URLs"
            value={filters.maxUrls}
            onChange={(e) => setFilters(prev => ({ ...prev, maxUrls: e.target.value }))}
            className="number-filter"
            min="0"
          />
          
          <button onClick={resetFilters} className="reset-filters-btn">
            Reset Filters
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="management-table">
        <table>
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>URLs Created</th>
              <th>Total Visitors</th>
              <th>Tier</th>
              <th>Coins</th>
              <th>Status</th>
              <th>Registered</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user._id}>
                <td>
                  <div className="user-cell">
                    <div className="user-avatar">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="user-info">
                      <strong>{user.username}</strong>
                      <small>ID: {user._id.substring(0, 8)}</small>
                    </div>
                  </div>
                </td>
                <td>{user.email}</td>
                <td>{user.urlsCreated || 0}</td>
                <td>{user.totalVisitors || 0}</td>
                <td>
                  <span className={`tier-badge ${user.tier}`}>
                    {user.tier || 'free'}
                  </span>
                </td>
                <td>{user.coins || 0}</td>
                <td>{getStatusBadge(user)}</td>
                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                <td>
                  <div className="action-buttons">
                    <button
                      onClick={() => handleViewUrls(user)}
                      className="action-btn view-btn"
                      title="View URLs"
                    >
                      🔍
                    </button>
                    
                    <button
                      onClick={() => handleEditUser(user)}
                      className="action-btn edit-btn"
                      title="Edit"
                    >
                      ✏️
                    </button>
                    
                    {!user.isRestricted ? (
                      <button
                        onClick={() => handleRestrictUser(user)}
                        className="action-btn restrict-btn"
                        title="Restrict"
                      >
                        ⛔
                      </button>
                    ) : (
                      <button
                        onClick={() => handleEditUser(user)}
                        className="action-btn unrestrict-btn"
                        title="Unrestrict"
                      >
                        ✅
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredUsers.length === 0 && (
          <div className="no-results">
            <p>No users found matching your criteria</p>
          </div>
        )}
      </div>

      {/* Restrict Modal */}
      {showRestrictModal && (
        <div className="modal-overlay">
          <div className="admin-modal">
            <h3>Restrict User: {selectedUser?.username}</h3>
            
            <div className="modal-form">
              <div className="form-group">
                <label>Restriction Reason *</label>
                <textarea
                  value={restrictData.reason}
                  onChange={(e) => setRestrictData(prev => ({
                    ...prev,
                    reason: e.target.value
                  }))}
                  placeholder="Enter reason for restriction"
                  rows="4"
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={restrictData.notifyUser}
                    onChange={(e) => setRestrictData(prev => ({
                      ...prev,
                      notifyUser: e.target.checked
                    }))}
                  />
                  <span>Notify user</span>
                </label>
              </div>
              
              {restrictData.notifyUser && (
                <div className="form-group">
                  <label>Email Template</label>
                  <select
                    value={restrictData.emailTemplate}
                    onChange={(e) => setRestrictData(prev => ({
                      ...prev,
                      emailTemplate: e.target.value
                    }))}
                  >
                    <option value="default">Default Template</option>
                    <option value="custom">Custom Template</option>
                  </select>
                </div>
              )}
            </div>
            
            <div className="modal-actions">
              <button
                onClick={confirmRestrictUser}
                className="confirm-btn danger-btn"
                disabled={!restrictData.reason.trim()}
              >
                Confirm Restrict
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

      {/* Edit Modal */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="admin-modal">
            <h3>Edit User: {selectedUser?.username}</h3>
            
            <div className="modal-form">
              <div className="form-group">
                <label>Tier</label>
                <select
                  value={editData.tier}
                  onChange={(e) => setEditData(prev => ({
                    ...prev,
                    tier: e.target.value
                  }))}
                >
                  <option value="free">Free</option>
                  <option value="premium">Premium</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Coins</label>
                <input
                  type="number"
                  value={editData.coins}
                  onChange={(e) => setEditData(prev => ({
                    ...prev,
                    coins: parseInt(e.target.value) || 0
                  }))}
                  min="0"
                />
              </div>
              
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={editData.isRestricted}
                    onChange={(e) => setEditData(prev => ({
                      ...prev,
                      isRestricted: e.target.checked
                    }))}
                  />
                  <span>Restrict User</span>
                </label>
              </div>
            </div>
            
            <div className="modal-actions">
              <button
                onClick={saveEditUser}
                className="confirm-btn"
              >
                Save
              </button>
              <button
                onClick={() => setShowEditModal(false)}
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

export default UserManagement;