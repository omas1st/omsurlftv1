// src/components/ManageURLs/ManageURLs.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { urlAPI, qrAPI, textAPI } from '../../services/api';
import toast from 'react-hot-toast';
import './ManageURLs.css';

const ManageURLs = () => {
  const [urls, setUrls] = useState([]);
  const [filteredUrls, setFilteredUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [pauseItem, setPauseItem] = useState(null);
  const [customMessage, setCustomMessage] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState(null);

  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState(null);
  const [editLogoFile, setEditLogoFile] = useState(null);
  const [editSaving, setEditSaving] = useState(false);
  const logoInputRef = useRef(null);

  // -------------------------------------------------------------------------
  // FETCH ALL USER URLs / QR CODES / TEXT PAGES
  // -------------------------------------------------------------------------
  const fetchURLs = useCallback(async () => {
    try {
      setLoading(true);
      
      console.log('🔍 Checking API methods:');
      console.log('  urlAPI.getUrls:', typeof urlAPI.getUrls);
      console.log('  qrAPI.getAll:', typeof qrAPI.getAll);
      console.log('  textAPI.getAll:', typeof textAPI.getAll);

      // Execute all three requests in parallel, with error resilience
      const [urlsRes, qrsRes, textsRes] = await Promise.allSettled([
        urlAPI.getUrls({}),
        qrAPI.getAll({}),
        textAPI.getAll({})
      ]);

      console.log('✅ API responses processed (allSettled)');
      if (urlsRes.status === 'fulfilled') console.log('📦 urlsRes.data:', urlsRes.value.data);
      if (qrsRes.status === 'fulfilled') console.log('📦 qrsRes.data:', qrsRes.value.data);
      if (textsRes.status === 'fulfilled') console.log('📦 textsRes.data:', textsRes.value.data);
      if (urlsRes.status === 'rejected') console.error('❌ urlAPI.getUrls failed:', urlsRes.reason);
      if (qrsRes.status === 'rejected') console.error('❌ qrAPI.getAll failed:', qrsRes.reason);
      if (textsRes.status === 'rejected') console.error('❌ textAPI.getAll failed:', textsRes.reason);

      // Extract the actual data arrays – each response has { success, data }
      // - URLs: data.data.urls
      // - QR:   data.data.qrCodes
      // - Text: data.data (direct array)
      const urlItems = urlsRes.status === 'fulfilled' ? urlsRes.value.data?.data?.urls || [] : [];
      const qrItems   = qrsRes.status === 'fulfilled' ? qrsRes.value.data?.data?.qrCodes || [] : [];
      const textItems = textsRes.status === 'fulfilled' ? textsRes.value.data?.data || [] : [];

      console.log(`📊 URL items: ${urlItems.length}, QR items: ${qrItems.length}, Text items: ${textItems.length}`);

      // Combine and sort by creation date
      const allUrls = [
        ...urlItems.map(url => ({ ...url, type: 'url' })),
        ...qrItems.map(qr => ({ ...qr, type: 'qr' })),
        ...textItems.map(text => ({ ...text, type: 'text' }))
      ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setUrls(allUrls);
      setFilteredUrls(allUrls);
    } catch (error) {
      // This catch will only fire for unexpected errors (e.g., synchronous bugs, network timeout that rejects the whole allSettled)
      console.error('❌ fetchURLs unexpected error:', error);
      if (error.response) {
        console.error('  Status:', error.response.status);
        console.error('  Data:', error.response.data);
      } else if (error.request) {
        console.error('  No response received – network or CORS issue');
      } else {
        console.error('  Error message:', error.message);
      }
      toast.error('Failed to fetch URLs');
    } finally {
      setLoading(false);
    }
  }, []);

  const filterURLs = useCallback(() => {
    let filtered = [...urls];

    if (filter !== 'all') {
      filtered = filtered.filter(url => url.type === filter);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(url => 
        url.alias?.toLowerCase().includes(term) ||
        url.longUrl?.toLowerCase().includes(term) ||
        url.destinationUrl?.toLowerCase().includes(term) ||
        url.textContent?.toLowerCase().includes(term)
      );
    }

    setFilteredUrls(filtered);
  }, [urls, filter, searchTerm]);

  useEffect(() => {
    fetchURLs();
  }, [fetchURLs]);

  useEffect(() => {
    filterURLs();
  }, [filterURLs]);

  // -------------------------------------------------------------------------
  // EDIT HANDLERS
  // -------------------------------------------------------------------------
  const handleEdit = (item) => {
    let initialData = {
      _id: item._id,
      type: item.type,
      alias: item.alias || '',
    };

    if (item.type === 'url') {
      initialData = {
        ...initialData,
        longUrl: item.longUrl || '',
        password: '',
        passwordNote: item.passwordNote || '',
        analyticsPrivate: item.analyticsPrivate || false,
        expirationDate: item.expirationDate ? item.expirationDate.split('T')[0] : '',
        tags: item.tags ? item.tags.join(', ') : '',
        active: item.active !== undefined ? item.active : true,
        scheduledRedirect: {
          enabled: item.scheduledRedirect?.enabled || false,
          startDate: item.scheduledRedirect?.startDate ? item.scheduledRedirect.startDate.split('T')[0] : '',
          endDate: item.scheduledRedirect?.endDate ? item.scheduledRedirect.endDate.split('T')[0] : '',
          message: item.scheduledRedirect?.message || '',
        },
        splashScreen: {
          enabled: item.splashScreen?.enabled || false,
          title: item.splashScreen?.title || '',
          message: item.splashScreen?.message || '',
          redirectDelay: item.splashScreen?.redirectDelay || 5,
          allowSkip: item.splashScreen?.allowSkip || false,
          backgroundColor: item.splashScreen?.backgroundColor || '#ffffff',
          textColor: item.splashScreen?.textColor || '#000000',
        },
        expiration: {
          enabled: item.expiration?.enabled || false,
          expireAt: item.expiration?.expireAt ? item.expiration.expireAt.split('T')[0] : '',
          expiredRedirect: item.expiration?.expiredRedirect || '',
        },
      };
    } else if (item.type === 'qr') {
      initialData = {
        ...initialData,
        destinationUrl: item.destinationUrl || '',
        customization: {
          qrColor: item.customization?.qrColor || '#000000',
          bgColor: item.customization?.bgColor || '#FFFFFF',
          includeText: item.customization?.includeText || false,
          text: item.customization?.text || '',
          textPosition: item.customization?.textPosition || 'bottom',
          textColor: item.customization?.textColor || '#000000',
          textFont: item.customization?.textFont || 'Arial',
          textSize: item.customization?.textSize || 16,
          margin: item.customization?.margin || 4,
          logo: item.customization?.logo || null,
        },
        password: '',
        passwordNote: item.passwordNote || '',
        analyticsPrivate: item.analyticsPrivate || false,
        expirationDate: item.expirationDate ? item.expirationDate.split('T')[0] : '',
        tags: item.tags ? item.tags.join(', ') : '',
        active: item.active !== undefined ? item.active : true,
      };
    } else if (item.type === 'text') {
      initialData = {
        ...initialData,
        textContent: item.textContent || '',
        customization: {
          pageColor: item.customization?.pageColor || '#FFFFFF',
          textColor: item.customization?.textColor || '#000000',
          textFont: item.customization?.textFont || 'Arial',
          textSize: item.customization?.textSize || 16,
          allowResponse: item.customization?.allowResponse || false,
          title: item.customization?.title || '',
          textAlignment: item.customization?.textAlignment || 'left',
          lineHeight: item.customization?.lineHeight || 1.5,
          padding: item.customization?.padding || 20,
          borderRadius: item.customization?.borderRadius || 0,
          boxShadow: item.customization?.boxShadow || false,
        },
        password: '',
        passwordNote: item.passwordNote || '',
        analyticsPrivate: item.analyticsPrivate || false,
        expirationDate: item.expirationDate ? item.expirationDate.split('T')[0] : '',
        tags: item.tags ? item.tags.join(', ') : '',
        active: item.active !== undefined ? item.active : true,
      };
    }

    setEditFormData(initialData);
    setEditLogoFile(null);
    setShowEditModal(true);
  };

  const handleEditInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleNestedEditChange = (parent, child, value) => {
    setEditFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [child]: value,
      },
    }));
  };

  const handleCustomizationChange = (field, value) => {
    setEditFormData(prev => ({
      ...prev,
      customization: {
        ...prev.customization,
        [field]: value,
      },
    }));
  };

  const handleLogoFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        handleCustomizationChange('logo', reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setEditLogoFile(null);
    handleCustomizationChange('logo', null);
    if (logoInputRef.current) logoInputRef.current.value = '';
  };

  const handleSaveEdit = async () => {
    if (!editFormData) return;
    setEditSaving(true);

    try {
      const { _id, type } = editFormData;

      if (type === 'url') {
        const payload = {
          alias: editFormData.alias,
          longUrl: editFormData.longUrl,
          password: editFormData.password || undefined,
          passwordNote: editFormData.passwordNote,
          analyticsPrivate: editFormData.analyticsPrivate,
          tags: editFormData.tags.split(',').map(t => t.trim()).filter(Boolean),
          scheduledRedirect: editFormData.scheduledRedirect.enabled ? {
            enabled: true,
            startDate: editFormData.scheduledRedirect.startDate || null,
            endDate: editFormData.scheduledRedirect.endDate || null,
            message: editFormData.scheduledRedirect.message,
          } : { enabled: false },
          splashScreen: editFormData.splashScreen.enabled ? {
            enabled: true,
            title: editFormData.splashScreen.title,
            message: editFormData.splashScreen.message,
            redirectDelay: editFormData.splashScreen.redirectDelay,
            allowSkip: editFormData.splashScreen.allowSkip,
            backgroundColor: editFormData.splashScreen.backgroundColor,
            textColor: editFormData.splashScreen.textColor,
          } : { enabled: false },
          expiration: editFormData.expiration.enabled ? {
            enabled: true,
            expireAt: editFormData.expiration.expireAt,
            expiredRedirect: editFormData.expiration.expiredRedirect,
          } : { enabled: false },
        };
        if (!editFormData.expiration.enabled && editFormData.expirationDate) {
          payload.expirationDate = editFormData.expirationDate;
        }
        await urlAPI.update(_id, payload);
      } else if (type === 'qr') {
        const formData = new FormData();
        formData.append('alias', editFormData.alias);
        formData.append('destinationUrl', editFormData.destinationUrl);
        formData.append('customization[qrColor]', editFormData.customization.qrColor);
        formData.append('customization[bgColor]', editFormData.customization.bgColor);
        formData.append('customization[includeText]', editFormData.customization.includeText);
        formData.append('customization[text]', editFormData.customization.text || '');
        formData.append('customization[textPosition]', editFormData.customization.textPosition);
        formData.append('customization[textColor]', editFormData.customization.textColor);
        formData.append('customization[textFont]', editFormData.customization.textFont);
        formData.append('customization[textSize]', editFormData.customization.textSize);
        formData.append('customization[margin]', editFormData.customization.margin);
        if (editLogoFile) {
          formData.append('logo', editLogoFile);
        }
        if (editFormData.password) {
          formData.append('password', editFormData.password);
        }
        formData.append('passwordNote', editFormData.passwordNote || '');
        formData.append('analyticsPrivate', editFormData.analyticsPrivate);
        if (editFormData.expirationDate) {
          formData.append('expirationDate', editFormData.expirationDate);
        }
        const tags = editFormData.tags.split(',').map(t => t.trim()).filter(Boolean);
        formData.append('tags', JSON.stringify(tags));

        await qrAPI.update(_id, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else if (type === 'text') {
        const payload = {
          alias: editFormData.alias,
          textContent: editFormData.textContent,
          customization: {
            pageColor: editFormData.customization.pageColor,
            textColor: editFormData.customization.textColor,
            textFont: editFormData.customization.textFont,
            textSize: editFormData.customization.textSize,
            allowResponse: editFormData.customization.allowResponse,
            title: editFormData.customization.title,
            textAlignment: editFormData.customization.textAlignment,
            lineHeight: editFormData.customization.lineHeight,
            padding: editFormData.customization.padding,
            borderRadius: editFormData.customization.borderRadius,
            boxShadow: editFormData.customization.boxShadow,
          },
          password: editFormData.password || undefined,
          passwordNote: editFormData.passwordNote,
          analyticsPrivate: editFormData.analyticsPrivate,
          expirationDate: editFormData.expirationDate || null,
          tags: editFormData.tags.split(',').map(t => t.trim()).filter(Boolean),
        };
        await textAPI.update(_id, payload);
      }

      toast.success('URL updated successfully');
      setShowEditModal(false);
      fetchURLs();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update URL');
    } finally {
      setEditSaving(false);
    }
  };

  // -------------------------------------------------------------------------
  // PAUSE / PLAY HANDLERS
  // -------------------------------------------------------------------------
  const handleTogglePause = (item) => {
    setPauseItem(item);
    setShowPauseModal(true);
  };

  const confirmPause = async () => {
    if (!pauseItem) return;
    try {
      const { _id, type } = pauseItem;
      if (type === 'url') {
        await urlAPI.toggleActive(_id, { active: false, customMessage });
      } else if (type === 'qr') {
        await qrAPI.toggleActive(_id, { active: false, customMessage });
      } else if (type === 'text') {
        await textAPI.toggleActive(_id, { active: false, customMessage });
      }

      toast.success('URL paused successfully');
      setShowPauseModal(false);
      setCustomMessage('');
      setPauseItem(null);
      fetchURLs();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to pause URL');
    }
  };

  const handleToggleActive = async (item, isActive) => {
    try {
      const { _id, type } = item;
      if (type === 'url') {
        await urlAPI.toggleActive(_id, { active: isActive });
      } else if (type === 'qr') {
        await qrAPI.toggleActive(_id, { active: isActive });
      } else if (type === 'text') {
        await textAPI.toggleActive(_id, { active: isActive });
      }

      toast.success(isActive ? 'URL activated successfully' : 'URL paused successfully');
      fetchURLs();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update URL status');
    }
  };

  // -------------------------------------------------------------------------
  // DELETE HANDLER
  // -------------------------------------------------------------------------
  const handleDelete = (id) => {
    setDeleteItemId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      const url = urls.find(u => u._id === deleteItemId);
      let endpoint;

      switch (url.type) {
        case 'qr':
          endpoint = qrAPI.deleteQR || urlAPI.deleteUrl;
          break;
        case 'text':
          endpoint = textAPI.deleteTextPage || urlAPI.deleteUrl;
          break;
        default:
          endpoint = urlAPI.deleteUrl;
      }

      await endpoint(deleteItemId);
      
      toast.success('URL deleted successfully');
      setShowDeleteModal(false);
      setDeleteItemId(null);
      fetchURLs();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete URL');
    }
  };

  // -------------------------------------------------------------------------
  // HELPER FUNCTIONS
  // -------------------------------------------------------------------------
  const getUrlTypeIcon = (type) => {
    switch (type) {
      case 'qr': return '📱';
      case 'text': return '📝';
      default: return '🔗';
    }
  };

  const getUrlStatus = (url) => {
    if (!url.active) return { text: 'Paused', class: 'paused' };
    if (url.restricted) return { text: 'Restricted', class: 'restricted' };
    if (url.expirationDate && new Date(url.expirationDate) < new Date()) {
      return { text: 'Expired', class: 'expired' };
    }
    return { text: 'Active', class: 'active' };
  };

  // -------------------------------------------------------------------------
  // RENDER
  // -------------------------------------------------------------------------
  if (loading) {
    return (
      <div className="manage-urls-loading">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="manage-urls">
      <div className="manage-header">
        <h1>Manage URLs</h1>
        <p className="subtitle">You have {urls.length} URLs</p>
      </div>

      {/* Filters and Search */}
      <div className="manage-controls">
        <div className="filters">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button 
            className={`filter-btn ${filter === 'url' ? 'active' : ''}`}
            onClick={() => setFilter('url')}
          >
            🔗 URLs
          </button>
          <button 
            className={`filter-btn ${filter === 'qr' ? 'active' : ''}`}
            onClick={() => setFilter('qr')}
          >
            📱 QR Codes
          </button>
          <button 
            className={`filter-btn ${filter === 'text' ? 'active' : ''}`}
            onClick={() => setFilter('text')}
          >
            📝 Text Pages
          </button>
        </div>

        <div className="search-box">
          <input
            type="text"
            placeholder="Search by alias, destination, or content"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="search-icon">🔍</span>
        </div>
      </div>

      {/* URLs Table */}
      <div className="urls-table-container">
        {filteredUrls.length === 0 ? (
          <div className="no-urls">
            <p>No URLs found</p>
            <p>Create your first URL, QR code, or text page</p>
          </div>
        ) : (
          <div className="urls-table">
            <div className="table-header">
              <div className="col-type">Type</div>
              <div className="col-alias">Alias</div>
              <div className="col-destination">Destination</div>
              <div className="col-visitors">Visitors</div>
              <div className="col-status">Status</div>
              <div className="col-date">Created</div>
              <div className="col-actions">Actions</div>
            </div>

            {filteredUrls.map((url) => {
              const status = getUrlStatus(url);
              return (
                <div key={url._id} className="table-row">
                  <div className="col-type">
                    <span className="type-icon">{getUrlTypeIcon(url.type)}</span>
                  </div>
                  
                  <div className="col-alias">
                    <a 
                      href={`${window.location.origin}/${url.alias}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="alias-link"
                    >
                      /{url.alias}
                    </a>
                  </div>
                  
                  <div className="col-destination">
                    {url.type === 'text' ? (
                      <span className="text-preview">
                        {url.textContent?.substring(0, 50)}...
                      </span>
                    ) : url.type === 'qr' ? (
                      <a 
                        href={url.destinationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="destination-link"
                      >
                        {url.destinationUrl?.substring(0, 50)}...
                      </a>
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
                  </div>
                  
                  <div className="col-visitors">
                    {url.type === 'qr' ? url.scans || 0 : url.visitors || 0}
                  </div>
                  
                  <div className="col-status">
                    <span className={`status-badge ${status.class}`}>
                      {status.text}
                    </span>
                  </div>
                  
                  <div className="col-date">
                    {new Date(url.createdAt).toLocaleDateString()}
                  </div>
                  
                  <div className="col-actions">
                    <a 
                      href={`/${url.alias}/analytics`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="action-btn analytics-btn"
                      title="Analytics"
                    >
                      📊
                    </a>
                    
                    <button 
                      onClick={() => handleEdit(url)}
                      className="action-btn edit-btn"
                      title="Edit"
                    >
                      ✏️
                    </button>
                    
                    <button 
                      onClick={() => url.active ? 
                        handleTogglePause(url) : 
                        handleToggleActive(url, true)}
                      className={`action-btn ${url.active ? 'pause-btn' : 'play-btn'}`}
                      title={url.active ? 'Pause' : 'Activate'}
                    >
                      {url.active ? '⏸️' : '▶️'}
                    </button>
                    
                    <button 
                      onClick={() => handleDelete(url._id)}
                      className="action-btn delete-btn"
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination – placeholder */}
      {filteredUrls.length > 0 && (
        <div className="pagination">
          <button className="page-btn prev-btn" disabled>
            ← Previous
          </button>
          <span className="page-info">
            Page 1 of 1
          </span>
          <button className="page-btn next-btn" disabled>
            Next →
          </button>
        </div>
      )}

      {/* EDIT MODAL */}
      {showEditModal && editFormData && (
        <div className="modal-overlay">
          <div className="modal edit-modal">
            <div className="modal-header">
              <h2>
                Edit 
                {editFormData.type === 'url' && ' 🔗 URL'}
                {editFormData.type === 'qr' && ' 📱 QR Code'}
                {editFormData.type === 'text' && ' 📝 Text Page'}
              </h2>
              <button className="close-btn" onClick={() => setShowEditModal(false)}>×</button>
            </div>

            <div className="modal-body">
              {/* Common fields */}
              <div className="form-group">
                <label>Alias</label>
                <input
                  type="text"
                  name="alias"
                  value={editFormData.alias}
                  onChange={handleEditInputChange}
                  pattern="[a-zA-Z0-9_-]+"
                  required
                />
              </div>

              {editFormData.type === 'url' && (
                <>
                  <div className="form-group">
                    <label>Destination URL</label>
                    <input
                      type="url"
                      name="longUrl"
                      value={editFormData.longUrl}
                      onChange={handleEditInputChange}
                      required
                    />
                  </div>

                  <div className="form-section">
                    <h4>Security</h4>
                    <div className="form-group">
                      <label>Password</label>
                      <input
                        type="password"
                        name="password"
                        value={editFormData.password}
                        onChange={handleEditInputChange}
                        placeholder="Leave blank to keep current"
                      />
                    </div>
                    <div className="form-group">
                      <label>Password Note</label>
                      <input
                        type="text"
                        name="passwordNote"
                        value={editFormData.passwordNote}
                        onChange={handleEditInputChange}
                      />
                    </div>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="analyticsPrivate"
                        checked={editFormData.analyticsPrivate}
                        onChange={handleEditInputChange}
                      />
                      Private Analytics
                    </label>
                  </div>

                  <div className="form-section">
                    <h4>Expiration</h4>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={editFormData.expiration?.enabled}
                        onChange={(e) => handleNestedEditChange('expiration', 'enabled', e.target.checked)}
                      />
                      Enable Expiration
                    </label>
                    {editFormData.expiration?.enabled && (
                      <>
                        <div className="form-group">
                          <label>Expire At</label>
                          <input
                            type="date"
                            value={editFormData.expiration.expireAt}
                            onChange={(e) => handleNestedEditChange('expiration', 'expireAt', e.target.value)}
                          />
                        </div>
                        <div className="form-group">
                          <label>Expired Redirect</label>
                          <input
                            type="url"
                            value={editFormData.expiration.expiredRedirect}
                            onChange={(e) => handleNestedEditChange('expiration', 'expiredRedirect', e.target.value)}
                            placeholder="https://example.com"
                          />
                        </div>
                      </>
                    )}
                    {!editFormData.expiration?.enabled && (
                      <div className="form-group">
                        <label>Expiration Date (legacy)</label>
                        <input
                          type="date"
                          name="expirationDate"
                          value={editFormData.expirationDate}
                          onChange={handleEditInputChange}
                        />
                      </div>
                    )}
                  </div>

                  <div className="form-section">
                    <h4>Scheduled Redirect</h4>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={editFormData.scheduledRedirect?.enabled}
                        onChange={(e) => handleNestedEditChange('scheduledRedirect', 'enabled', e.target.checked)}
                      />
                      Enable Scheduled Redirect
                    </label>
                    {editFormData.scheduledRedirect?.enabled && (
                      <>
                        <div className="form-group">
                          <label>Start Date</label>
                          <input
                            type="date"
                            value={editFormData.scheduledRedirect.startDate}
                            onChange={(e) => handleNestedEditChange('scheduledRedirect', 'startDate', e.target.value)}
                          />
                        </div>
                        <div className="form-group">
                          <label>End Date</label>
                          <input
                            type="date"
                            value={editFormData.scheduledRedirect.endDate}
                            onChange={(e) => handleNestedEditChange('scheduledRedirect', 'endDate', e.target.value)}
                          />
                        </div>
                        <div className="form-group">
                          <label>Message</label>
                          <input
                            type="text"
                            value={editFormData.scheduledRedirect.message}
                            onChange={(e) => handleNestedEditChange('scheduledRedirect', 'message', e.target.value)}
                          />
                        </div>
                      </>
                    )}
                  </div>

                  <div className="form-section">
                    <h4>Splash Screen</h4>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={editFormData.splashScreen?.enabled}
                        onChange={(e) => handleNestedEditChange('splashScreen', 'enabled', e.target.checked)}
                      />
                      Enable Splash Screen
                    </label>
                    {editFormData.splashScreen?.enabled && (
                      <>
                        <div className="form-group">
                          <label>Title</label>
                          <input
                            type="text"
                            value={editFormData.splashScreen.title}
                            onChange={(e) => handleNestedEditChange('splashScreen', 'title', e.target.value)}
                          />
                        </div>
                        <div className="form-group">
                          <label>Message</label>
                          <textarea
                            value={editFormData.splashScreen.message}
                            onChange={(e) => handleNestedEditChange('splashScreen', 'message', e.target.value)}
                            rows="2"
                          />
                        </div>
                        <div className="form-row">
                          <div className="form-group">
                            <label>Redirect Delay (seconds)</label>
                            <input
                              type="number"
                              min="0"
                              max="30"
                              value={editFormData.splashScreen.redirectDelay}
                              onChange={(e) => handleNestedEditChange('splashScreen', 'redirectDelay', parseInt(e.target.value))}
                            />
                          </div>
                          <label className="checkbox-label">
                            <input
                              type="checkbox"
                              checked={editFormData.splashScreen.allowSkip}
                              onChange={(e) => handleNestedEditChange('splashScreen', 'allowSkip', e.target.checked)}
                            />
                            Allow Skip
                          </label>
                        </div>
                        <div className="form-row">
                          <div className="color-picker">
                            <label>Background Color</label>
                            <input
                              type="color"
                              value={editFormData.splashScreen.backgroundColor}
                              onChange={(e) => handleNestedEditChange('splashScreen', 'backgroundColor', e.target.value)}
                            />
                          </div>
                          <div className="color-picker">
                            <label>Text Color</label>
                            <input
                              type="color"
                              value={editFormData.splashScreen.textColor}
                              onChange={(e) => handleNestedEditChange('splashScreen', 'textColor', e.target.value)}
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="form-group">
                    <label>Tags</label>
                    <input
                      type="text"
                      name="tags"
                      value={editFormData.tags}
                      onChange={handleEditInputChange}
                      placeholder="Separate tags with commas"
                    />
                  </div>
                </>
              )}

              {editFormData.type === 'qr' && (
                <>
                  <div className="form-group">
                    <label>Destination URL</label>
                    <input
                      type="url"
                      name="destinationUrl"
                      value={editFormData.destinationUrl}
                      onChange={handleEditInputChange}
                      required
                    />
                  </div>

                  <div className="form-section">
                    <h4>QR Code Customization</h4>
                    <div className="customization-grid">
                      <div className="color-picker">
                        <label>QR Code Color</label>
                        <input
                          type="color"
                          value={editFormData.customization.qrColor}
                          onChange={(e) => handleCustomizationChange('qrColor', e.target.value)}
                        />
                      </div>
                      <div className="color-picker">
                        <label>Background Color</label>
                        <input
                          type="color"
                          value={editFormData.customization.bgColor}
                          onChange={(e) => handleCustomizationChange('bgColor', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={editFormData.customization.includeText}
                          onChange={(e) => handleCustomizationChange('includeText', e.target.checked)}
                        />
                        Add Custom Text
                      </label>
                    </div>
                    {editFormData.customization.includeText && (
                      <>
                        <div className="form-group">
                          <label>Text</label>
                          <input
                            type="text"
                            value={editFormData.customization.text}
                            onChange={(e) => handleCustomizationChange('text', e.target.value)}
                            placeholder="Enter text to display"
                          />
                        </div>
                        <div className="form-group">
                          <label>Text Position</label>
                          <select
                            value={editFormData.customization.textPosition}
                            onChange={(e) => handleCustomizationChange('textPosition', e.target.value)}
                          >
                            <option value="top">Above QR Code</option>
                            <option value="bottom">Below QR Code</option>
                          </select>
                        </div>
                        <div className="form-row">
                          <div className="color-picker">
                            <label>Text Color</label>
                            <input
                              type="color"
                              value={editFormData.customization.textColor}
                              onChange={(e) => handleCustomizationChange('textColor', e.target.value)}
                            />
                          </div>
                          <div className="form-group">
                            <label>Text Font</label>
                            <select
                              value={editFormData.customization.textFont}
                              onChange={(e) => handleCustomizationChange('textFont', e.target.value)}
                            >
                              <option value="Arial">Arial</option>
                              <option value="Helvetica">Helvetica</option>
                              <option value="Times New Roman">Times New Roman</option>
                              <option value="Courier New">Courier New</option>
                            </select>
                          </div>
                          <div className="form-group">
                            <label>Text Size</label>
                            <input
                              type="number"
                              min="8"
                              max="72"
                              value={editFormData.customization.textSize}
                              onChange={(e) => handleCustomizationChange('textSize', parseInt(e.target.value))}
                            />
                          </div>
                        </div>
                      </>
                    )}

                    <div className="form-group">
                      <label>Margin</label>
                      <input
                        type="number"
                        min="0"
                        max="20"
                        value={editFormData.customization.margin}
                        onChange={(e) => handleCustomizationChange('margin', parseInt(e.target.value))}
                      />
                    </div>

                    <div className="logo-upload">
                      <label>Logo</label>
                      <div className="logo-preview">
                        {editFormData.customization.logo && (
                          <img src={editFormData.customization.logo} alt="Logo preview" className="logo-preview-img" />
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          ref={logoInputRef}
                          onChange={handleLogoFileChange}
                        />
                        {editFormData.customization.logo && (
                          <button type="button" onClick={handleRemoveLogo} className="remove-logo-btn">
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="form-section">
                    <h4>Security</h4>
                    <div className="form-group">
                      <label>Password</label>
                      <input
                        type="password"
                        name="password"
                        value={editFormData.password}
                        onChange={handleEditInputChange}
                        placeholder="Leave blank to keep current"
                      />
                    </div>
                    <div className="form-group">
                      <label>Password Note</label>
                      <input
                        type="text"
                        name="passwordNote"
                        value={editFormData.passwordNote}
                        onChange={handleEditInputChange}
                      />
                    </div>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="analyticsPrivate"
                        checked={editFormData.analyticsPrivate}
                        onChange={handleEditInputChange}
                      />
                      Private Analytics
                    </label>
                  </div>

                  <div className="form-section">
                    <h4>Expiration</h4>
                    <div className="form-group">
                      <label>Expiration Date</label>
                      <input
                        type="date"
                        name="expirationDate"
                        value={editFormData.expirationDate}
                        onChange={handleEditInputChange}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Tags</label>
                    <input
                      type="text"
                      name="tags"
                      value={editFormData.tags}
                      onChange={handleEditInputChange}
                      placeholder="Separate tags with commas"
                    />
                  </div>
                </>
              )}

              {editFormData.type === 'text' && (
                <>
                  <div className="form-group">
                    <label>Text Content</label>
                    <textarea
                      name="textContent"
                      value={editFormData.textContent}
                      onChange={handleEditInputChange}
                      rows="6"
                      maxLength={5000}
                      required
                    />
                  </div>

                  <div className="form-section">
                    <h4>Customization</h4>
                    <div className="customization-grid">
                      <div className="color-picker">
                        <label>Page Color</label>
                        <input
                          type="color"
                          value={editFormData.customization.pageColor}
                          onChange={(e) => handleCustomizationChange('pageColor', e.target.value)}
                        />
                      </div>
                      <div className="color-picker">
                        <label>Text Color</label>
                        <input
                          type="color"
                          value={editFormData.customization.textColor}
                          onChange={(e) => handleCustomizationChange('textColor', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Font</label>
                        <select
                          value={editFormData.customization.textFont}
                          onChange={(e) => handleCustomizationChange('textFont', e.target.value)}
                        >
                          <option value="Arial">Arial</option>
                          <option value="Helvetica">Helvetica</option>
                          <option value="Times New Roman">Times New Roman</option>
                          <option value="Courier New">Courier New</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Font Size</label>
                        <input
                          type="number"
                          min="12"
                          max="32"
                          value={editFormData.customization.textSize}
                          onChange={(e) => handleCustomizationChange('textSize', parseInt(e.target.value))}
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Title</label>
                      <input
                        type="text"
                        value={editFormData.customization.title}
                        onChange={(e) => handleCustomizationChange('title', e.target.value)}
                        maxLength={100}
                      />
                    </div>

                    <div className="response-toggle">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={editFormData.customization.allowResponse}
                          onChange={(e) => handleCustomizationChange('allowResponse', e.target.checked)}
                        />
                        Allow Response
                      </label>
                    </div>
                  </div>

                  <div className="form-section">
                    <h4>Security</h4>
                    <div className="form-group">
                      <label>Password</label>
                      <input
                        type="password"
                        name="password"
                        value={editFormData.password}
                        onChange={handleEditInputChange}
                        placeholder="Leave blank to keep current"
                      />
                    </div>
                    <div className="form-group">
                      <label>Password Note</label>
                      <input
                        type="text"
                        name="passwordNote"
                        value={editFormData.passwordNote}
                        onChange={handleEditInputChange}
                      />
                    </div>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="analyticsPrivate"
                        checked={editFormData.analyticsPrivate}
                        onChange={handleEditInputChange}
                      />
                      Private Analytics
                    </label>
                  </div>

                  <div className="form-section">
                    <h4>Expiration</h4>
                    <div className="form-group">
                      <label>Expiration Date</label>
                      <input
                        type="date"
                        name="expirationDate"
                        value={editFormData.expirationDate}
                        onChange={handleEditInputChange}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Tags</label>
                    <input
                      type="text"
                      name="tags"
                      value={editFormData.tags}
                      onChange={handleEditInputChange}
                      placeholder="Separate tags with commas"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setShowEditModal(false)} disabled={editSaving}>
                Cancel
              </button>
              <button className="save-btn" onClick={handleSaveEdit} disabled={editSaving}>
                {editSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pause Modal */}
      {showPauseModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Pause URL</h3>
            <p>Add a custom message to show when visitors access this URL (optional).</p>
            
            <div className="modal-form">
              <label>Custom Message</label>
              <textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Enter your message here..."
                rows="4"
              />
              <small>Optional – leave blank to use default message.</small>
            </div>
            
            <div className="modal-actions">
              <button onClick={confirmPause} className="confirm-btn">
                Pause URL
              </button>
              <button onClick={() => {
                setShowPauseModal(false);
                setCustomMessage('');
                setPauseItem(null);
              }} className="cancel-btn">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal delete-modal">
            <h3>Delete URL?</h3>
            <p>This action cannot be undone. The URL will be permanently deleted.</p>
            
            <div className="modal-actions">
              <button onClick={confirmDelete} className="confirm-btn delete-confirm-btn">
                Delete
              </button>
              <button onClick={() => {
                setShowDeleteModal(false);
                setDeleteItemId(null);
              }} className="cancel-btn">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageURLs;