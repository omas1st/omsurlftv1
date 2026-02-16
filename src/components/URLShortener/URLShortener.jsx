// src/components/URLShortener/URLShortener.jsx
import React, { useState, useContext } from 'react';
import { urlAPI } from '../../services/api';
import BulkUpload from './BulkUpload';
import AdvancedFeatures from '../AdvancedFeatures/AdvancedFeatures';
import { AuthContext } from '../../context/AuthContext';
import GeneratedOutput from '../GeneratedOutput/GeneratedOutput';
import './URLShortener.css';

const URLShortener = () => {
  const { user } = useContext(AuthContext);
  const [longUrl, setLongUrl] = useState('');
  const [customAlias, setCustomAlias] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Advanced features state – extended with new capabilities
  const [advancedFeatures, setAdvancedFeatures] = useState({
    password: '',
    passwordNote: '',
    analyticsPrivate: false,
    customDomain: '',
    tags: [],
    // new features
    scheduledRedirect: {
      enabled: false,
      startDate: '',
      endDate: '',
      message: ''
    },
    splashScreen: {
      enabled: false,
      title: '',
      message: '',
      image: '',
      buttonText: 'Continue',
      redirectDelay: 5,
      allowSkip: false,
      backgroundColor: '#ffffff',
      textColor: '#000000'
    },
    expiration: {
      enabled: false,
      expireAt: '',
      expiredRedirect: ''
    },
    multipleDestinationRules: []
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Prepare request data
      const requestData = {
        longUrl,
        customAlias: customAlias || undefined,
      };

      // Only add advanced features if user is logged in and showAdvanced is true
      if (user && showAdvanced) {
        // Handle expiration (convert to backend format)
        if (advancedFeatures.expiration.enabled && advancedFeatures.expiration.expireAt) {
          requestData.expirationDate = advancedFeatures.expiration.expireAt;
          requestData.expiredRedirect = advancedFeatures.expiration.expiredRedirect || null;
        }

        // Handle scheduled redirect
        if (advancedFeatures.scheduledRedirect.enabled) {
          requestData.scheduledRedirect = advancedFeatures.scheduledRedirect;
        }

        // Handle splash screen
        if (advancedFeatures.splashScreen.enabled) {
          requestData.splashScreen = advancedFeatures.splashScreen;
        }

        // Handle multiple destination rules
        if (advancedFeatures.multipleDestinationRules.length > 0) {
          requestData.multipleDestinationRules = advancedFeatures.multipleDestinationRules;
        }

        // Add remaining advanced fields
        Object.assign(requestData, {
          password: advancedFeatures.password,
          passwordNote: advancedFeatures.passwordNote,
          analyticsPrivate: advancedFeatures.analyticsPrivate,
          customDomain: advancedFeatures.customDomain,
          tags: advancedFeatures.tags
        });
      }

      console.log('Sending request:', requestData);

      const response = await urlAPI.shorten(requestData);
      
      console.log('Response received:', response.data);
      
      if (response.data.success) {
        setGeneratedUrl({
          type: 'url',
          shortUrl: response.data.data.url.shortUrl,
          analyticsUrl: response.data.data.url.analyticsUrl,
          ...response.data.data.url
        });
      } else {
        setError(response.data.message || 'URL shortening failed. Please try again.');
      }
    } catch (err) {
      console.error('Error in handleSubmit:', err);
      setError(err.response?.data?.message || err.message || 'URL shortening failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // FIXED: handleBulkComplete now correctly processes the data object from BulkUpload
  const handleBulkComplete = (data) => {
    // data contains: { success, failed, results, errors, total }
    setGeneratedUrl({
      type: 'bulk',
      results: data.results,   // array of successful URLs
      success: data.success,    // number of successes
      failed: data.failed       // number of failures
    });
  };

  const handleAdvancedToggle = () => {
    if (!user) {
      // You can optionally show a login prompt/modal here
      alert('Please login to access advanced features');
      return;
    }
    setShowAdvanced(!showAdvanced);
  };

  if (generatedUrl) {
    return (
      <GeneratedOutput 
        data={generatedUrl}
        onNew={() => {
          setGeneratedUrl(null);
          setLongUrl('');
          setCustomAlias('');
          // Reset advanced features to initial state including new fields
          setAdvancedFeatures({
            password: '',
            passwordNote: '',
            analyticsPrivate: false,
            customDomain: '',
            tags: [],
            scheduledRedirect: {
              enabled: false,
              startDate: '',
              endDate: '',
              message: ''
            },
            splashScreen: {
              enabled: false,
              title: '',
              message: '',
              image: '',
              buttonText: 'Continue',
              redirectDelay: 5,
              allowSkip: false,
              backgroundColor: '#ffffff',
              textColor: '#000000'
            },
            expiration: {
              enabled: false,
              expireAt: '',
              expiredRedirect: ''
            },
            multipleDestinationRules: []
          });
        }}
      />
    );
  }

  return (
    <div className="url-shortener">
      <div className="mode-selector">
        <div className="mode-toggle">
          <button
            className={`mode-btn ${!showBulkUpload ? 'active' : ''}`}
            onClick={() => setShowBulkUpload(false)}
          >
            <span className="mode-icon">🔗</span>
            <span>Single URL</span>
          </button>
          <button
            className={`mode-btn ${showBulkUpload ? 'active' : ''}`}
            onClick={() => setShowBulkUpload(true)}
          >
            <span className="mode-icon">📊</span>
            <span>Bulk URLs</span>
          </button>
        </div>
      </div>

      {showBulkUpload ? (
        <BulkUpload onComplete={handleBulkComplete} />
      ) : (
        <form onSubmit={handleSubmit} className="shortener-form">
          <div className="form-header">
            <h3 className="form-title">
              <span className="title-icon">✂️</span>
              Shorten Your URL
            </h3>
          </div>

          <div className="form-group">
            <label className="form-label">
              <span className="label-icon">🌐</span>
              Destination URL
              <span className="required-indicator">*</span>
            </label>
            <div className="input-wrapper">
              <input
                type="text"
                value={longUrl}
                onChange={(e) => setLongUrl(e.target.value)}
                placeholder="https://your-website.com/very-long-page-url"
                className="url-input"
                required
              />
              <div className="input-icon">🔗</div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              <span className="label-icon">🎯</span>
              Custom Alias
              <span className="optional-indicator"> (Optional)</span>
            </label>
            <div className="input-wrapper">
              <input
                type="text"
                value={customAlias}
                onChange={(e) => setCustomAlias(e.target.value)}
                placeholder="my-brand-name"
                className="alias-input"
              />
              <div className="input-icon">✏️</div>
            </div>
            <div className="preview-url">
              <span className="preview-label">Preview:</span>
              <span className="preview-value">
                {window.location.origin}/{customAlias || 'generated-alias'}
              </span>
            </div>
          </div>

          {/* Always show Advanced Features toggle */}
          <div className="advanced-section">
            <button
              type="button"
              className={`section-toggle-btn ${!user ? 'login-required' : ''}`}
              onClick={handleAdvancedToggle}
            >
              <span className="toggle-icon">⚙️</span>
              <span>Advanced Settings</span>
              {!user && <span className="login-indicator"> (Login Required)</span>}
              <span className="toggle-arrow">{showAdvanced ? '▲' : '▼'}</span>
            </button>
            
            {showAdvanced && (
              <div className="advanced-content">
                {user ? (
                  <AdvancedFeatures
                    features={advancedFeatures}
                    onChange={setAdvancedFeatures}
                    user={user}
                  />
                ) : (
                  <div className="login-prompt">
                    <p className="login-prompt-message">
                      🔒 Please login to access advanced features like:
                    </p>
                    <ul className="login-prompt-features">
                      <li>Password protection</li>
                      <li>Custom domains</li>
                      <li>Link expiration dates</li>
                      <li>Detailed analytics</li>
                      <li>Tagging and organization</li>
                    </ul>
                    <button 
                      type="button" 
                      className="login-prompt-btn"
                      onClick={() => {
                        // Redirect to login or open login modal
                        window.location.href = '/login';
                      }}
                    >
                      Login / Sign Up
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <div className="form-actions">
            <button 
              type="submit" 
              className="generate-btn"
              disabled={loading || !longUrl}
            >
              {loading ? (
                <>
                  <span className="loading-spinner"></span>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span className="btn-icon">🚀</span>
                  <span>Generate Short URL</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default URLShortener;