// src/components/TextDestination/TextDestination.jsx
import React, { useState, useContext } from 'react';
import { textAPI } from '../../services/api';
import AdvancedFeatures from '../AdvancedFeatures/AdvancedFeatures';
import { AuthContext } from '../../context/AuthContext';
import GeneratedOutput from '../GeneratedOutput/GeneratedOutput';
import './TextDestination.css';

const TextDestination = () => {
  const { user } = useContext(AuthContext);
  const [text, setText] = useState('');
  const [customAlias, setCustomAlias] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showCustomization, setShowCustomization] = useState(false);
  const [generatedData, setGeneratedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [customization, setCustomization] = useState({
    pageColor: '#FFFFFF',
    textColor: '#000000',
    textFont: 'Arial',
    textSize: 16,
    allowResponse: false,
    title: ''
  });

  const [advancedFeatures, setAdvancedFeatures] = useState({
    password: '',
    passwordNote: '',
    analyticsPrivate: false,
    expirationDate: null,
    customDomain: '',
    tags: []
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        text,
        customAlias: customAlias || undefined,
        customization,
        allowResponse: customization.allowResponse
      };

      if (user && showAdvanced) {
        Object.assign(payload, advancedFeatures);
      }

      const response = await textAPI.create(payload);

      setGeneratedData({
        ...response.data.data.textPage,
        textContent: response.data.data.textPage.textContent || text,
        analyticsUrl: response.data.data.textPage.analyticsUrl || `${process.env.REACT_APP_FRONTEND_URL || window.location.origin}/${response.data.data.textPage.alias}/analytics`
      });

    } catch (err) {
      console.error('Text page creation error:', err);
      setError(err.response?.data?.message || 'Failed to create text page');
    } finally {
      setLoading(false);
    }
  };

  const wordCount = text.trim().split(/\s+/).filter(word => word.length > 0).length;

  if (generatedData) {
    return (
      <GeneratedOutput 
        data={generatedData}
        onNew={() => {
          setGeneratedData(null);
          setText('');
          setCustomAlias('');
          setCustomization({
            pageColor: '#FFFFFF',
            textColor: '#000000',
            textFont: 'Arial',
            textSize: 16,
            allowResponse: false,
            title: ''
          });
          setAdvancedFeatures({
            password: '',
            passwordNote: '',
            analyticsPrivate: false,
            expirationDate: null,
            customDomain: '',
            tags: []
          });
        }}
      />
    );
  }

  return (
    <div className="text-destination">
      <form onSubmit={handleSubmit} className="text-form">
        <div className="form-group">
          <label>
            Text Content 
            <span className="word-count">({wordCount}/1000 words)</span>
          </label>
          <textarea
            value={text}
            onChange={(e) => {
              const newText = e.target.value;
              const words = newText.trim().split(/\s+/).filter(word => word.length > 0);
              if (words.length <= 1000) {
                setText(newText);
              }
            }}
            placeholder="Enter your text here..."
            rows="8"
            maxLength={5000}
            required
          />
        </div>

        <div className="form-group">
          <label>Custom Short URL Alias (Optional)</label>
          <input
            type="text"
            value={customAlias}
            onChange={(e) => setCustomAlias(e.target.value)}
            placeholder="my-text-page"
          />
          <small className="alias-hint">
            {window.location.origin}/{customAlias || 'random-alias'}
          </small>
        </div>

        {/* Separate Response Settings Section */}
        <div className="response-settings">
          <div className="response-toggle-container">
            <label className="response-toggle-label">
              <span>Allow visitors to respond</span>
              <div className="toggle-wrapper">
                <input
                  type="checkbox"
                  checked={customization.allowResponse}
                  onChange={(e) => setCustomization(prev => ({ ...prev, allowResponse: e.target.checked }))}
                  id="allowResponse"
                />
                <label htmlFor="allowResponse" className="toggle-switch"></label>
              </div>
            </label>
            <small className="response-description">
              When enabled, visitors can reply to your text page. Replies appear immediately.
            </small>
          </div>
        </div>

        {/* Collapsible Customization Section */}
        <div className="customization-section">
          <button
            type="button"
            className="customize-btn"
            onClick={() => setShowCustomization(!showCustomization)}
          >
            Customize Appearance {showCustomization ? '▲' : '▼'}
          </button>
          
          {showCustomization && (
            <div className="customization-content">
              <div className="customization-grid">
                <div className="color-picker">
                  <label>Page Color</label>
                  <input
                    type="color"
                    value={customization.pageColor}
                    onChange={(e) => setCustomization(prev => ({
                      ...prev,
                      pageColor: e.target.value
                    }))}
                  />
                </div>
                
                <div className="color-picker">
                  <label>Text Color</label>
                  <input
                    type="color"
                    value={customization.textColor}
                    onChange={(e) => setCustomization(prev => ({
                      ...prev,
                      textColor: e.target.value
                    }))}
                  />
                </div>
              </div>

              <div className="text-style-options">
                <div className="form-group">
                  <label>Font</label>
                  <select
                    value={customization.textFont}
                    onChange={(e) => setCustomization(prev => ({
                      ...prev,
                      textFont: e.target.value
                    }))}
                  >
                    <option value="Arial">Arial</option>
                    <option value="Helvetica">Helvetica</option>
                    <option value="Times New Roman">Times New Roman</option>
                    <option value="Georgia">Georgia</option>
                    <option value="Courier New">Courier New</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Font Size</label>
                  <input
                    type="range"
                    min="12"
                    max="32"
                    value={customization.textSize}
                    onChange={(e) => setCustomization(prev => ({
                      ...prev,
                      textSize: parseInt(e.target.value)
                    }))}
                  />
                  <span>{customization.textSize}px</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="advanced-section">
          <button
            type="button"
            className="advanced-btn"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            Advanced Features {showAdvanced ? '▲' : '▼'}
          </button>
          
          {showAdvanced && (
            <AdvancedFeatures
              features={advancedFeatures}
              onChange={(features) => setAdvancedFeatures(features)}
              user={user}
            />
          )}
        </div>

        {error && <div className="error-message">{error}</div>}

        <button 
          type="submit" 
          className="generate-btn"
          disabled={loading || !text.trim()}
        >
          {loading ? 'Generating...' : 'Generate Text Page'}
        </button>

        {!user && (
          <div className="public-notice">
            <small>
              Note: As a public user, your text page will not be saved to your account. 
              Login to save and manage your text pages.
            </small>
          </div>
        )}
      </form>
    </div>
  );
};

export default TextDestination;