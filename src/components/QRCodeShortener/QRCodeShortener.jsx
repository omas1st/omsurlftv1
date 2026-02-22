import React, { useState, useContext, useRef } from 'react';
import QRCode from 'react-qr-code';
import html2canvas from 'html2canvas';
import AdvancedFeatures from '../AdvancedFeatures/AdvancedFeatures';
import { AuthContext } from '../../context/AuthContext';
import GeneratedOutput from '../GeneratedOutput/GeneratedOutput';
import './QRCodeShortener.css';
import { urlAPI, qrAPI } from '../../services/api';

const QRCodeShortener = () => {
  const { user } = useContext(AuthContext);
  const [longUrl, setLongUrl] = useState('');
  const [customAlias, setCustomAlias] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showCustomization, setShowCustomization] = useState(false);
  const [generatedData, setGeneratedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [customization, setCustomization] = useState({
    qrColor: '#000000',
    bgColor: '#FFFFFF',
    text: '',
    textPosition: 'bottom',
    logo: null,
    logoSize: 40,
    includeText: false,
    textColor: '#000000',
    textFont: 'Arial',
    textSize: 16,
    margin: 4
  });
  
  const [advancedFeatures, setAdvancedFeatures] = useState({
    password: '',
    passwordNote: '',
    analyticsPrivate: false,
    expirationDate: null,
    customDomain: '',
    tags: []
  });

  const qrRef = useRef();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // If advanced features provided (password/note), include them in shorten request
      const shortenPayload = {
        longUrl: longUrl,
        customAlias: customAlias || undefined,
        type: 'qr'
      };

      if (user && showAdvanced) {
        Object.assign(shortenPayload, advancedFeatures);
      }

      const urlResponse = await urlAPI.shorten(shortenPayload);

      const destinationForQR = urlResponse.data.data.url.destinationUrl || longUrl;
      const aliasForQR = customAlias || urlResponse.data.data.url.alias;

      const qrPayload = {
        destinationUrl: destinationForQR,
        customAlias: aliasForQR,
        customization: {
          ...customization,
          qrColor: customization.qrColor || '#000000',
          bgColor: customization.bgColor || '#FFFFFF',
          includeText: customization.includeText || false,
          text: customization.text || '',
          textPosition: customization.textPosition || 'bottom',
          textColor: customization.textColor || '#000000',
          textFont: customization.textFont || 'Arial',
          textSize: customization.textSize || 16,
          logo: customization.logo,
          logoSize: customization.logoSize || 40,
          margin: customization.margin || 4
        }
      };

      // Include advanced features (password) in QR creation as well
      if (user && showAdvanced) {
        Object.assign(qrPayload, {
          password: advancedFeatures.password,
          passwordNote: advancedFeatures.passwordNote,
          analyticsPrivate: advancedFeatures.analyticsPrivate,
          expirationDate: advancedFeatures.expirationDate,
          tags: advancedFeatures.tags || []
        });
      }

      const qrResponse = await qrAPI.generate(qrPayload);

      setGeneratedData({
        ...urlResponse.data.data.url,
        qrData: qrResponse.data.data.qrCode.qrImageUrl,
        analyticsUrl: `${process.env.REACT_APP_FRONTEND_URL || window.location.origin}/${urlResponse.data.data.url.alias}/analytics`
      });

    } catch (err) {
      console.error('QR generation error:', err);
      // Handle coin‑related errors from backend
      if (err.response?.data?.message?.includes('coins')) {
        setError(err.response.data.message);
      } else {
        setError(err.response?.data?.message || 'QR code generation failed. Please check the URL and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomization(prev => ({ ...prev, logo: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const downloadQRCode = async () => {
    if (!qrRef.current) return;

    try {
      const canvas = await html2canvas(qrRef.current);
      const link = document.createElement('a');
      link.download = `qrcode-${customAlias || 'shorturl'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Error downloading QR code:', error);
    }
  };

  const shareQRCode = async () => {
    if (!qrRef.current) return;

    try {
      const canvas = await html2canvas(qrRef.current);
      canvas.toBlob((blob) => {
        const file = new File([blob], 'qrcode.png', { type: 'image/png' });
        
        if (navigator.share && navigator.canShare({ files: [file] })) {
          navigator.share({
            files: [file],
            title: 'QR Code',
            text: `Check out this QR Code: ${generatedData?.shortUrl || ''}`
          });
        } else {
          // Fallback to clipboard
          canvas.toBlob((blob) => {
            const item = new ClipboardItem({ 'image/png': blob });
            navigator.clipboard.write([item]);
            alert('QR code copied to clipboard');
          });
        }
      });
    } catch (error) {
      console.error('Error sharing QR code:', error);
    }
  };

  if (generatedData) {
    return (
      <GeneratedOutput 
        data={generatedData}
        onNew={() => {
          setGeneratedData(null);
          setLongUrl('');
          setCustomAlias('');
          setShowPreview(false);
          setShowCustomization(false);
        }}
        onDownload={downloadQRCode}
        onShare={shareQRCode}
        qrRef={qrRef}
      />
    );
  }

  const renderPreview = () => {
    const qrValue = longUrl || 'your-website.com';
    
    return (
      <div className="qr-preview" ref={qrRef}>
        {customization.textPosition === 'top' && customization.includeText && (
          <div className="qr-text top" style={{
            color: customization.textColor,
            fontFamily: customization.textFont,
            fontSize: `${customization.textSize}px`
          }}>
            {customization.text}
          </div>
        )}
        
        <div className="qr-code-container" style={{ position: 'relative' }}>
          <QRCode
            value={qrValue}
            size={256}
            fgColor={customization.qrColor}
            bgColor={customization.bgColor}
            level="H"
          />
          
          {customization.logo && (
            <div className="qr-logo" style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: customization.logoSize,
              height: customization.logoSize,
              backgroundImage: `url(${customization.logo})`,
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center'
            }} />
          )}
        </div>
        
        {customization.textPosition === 'bottom' && customization.includeText && (
          <div className="qr-text bottom" style={{
            color: customization.textColor,
            fontFamily: customization.textFont,
            fontSize: `${customization.textSize}px`
          }}>
            {customization.text}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="qr-shortener">
      <form onSubmit={handleSubmit} className="qr-form">
        <div className="form-group">
          <label>Destination URL</label>
          <input
            type="text"
            value={longUrl}
            onChange={(e) => setLongUrl(e.target.value)}
            placeholder="https://your-website.com/page"
            required
          />
        </div>

        <div className="form-group">
          <label>Custom Short URL Alias (Optional)</label>
          <input
            type="text"
            value={customAlias}
            onChange={(e) => setCustomAlias(e.target.value)}
            placeholder="my-brand-alias"
          />
          <small className="alias-hint">
            Your short URL: {window.location.origin}/{customAlias || 'auto-generated-alias'}
          </small>
        </div>

        {/* Customization toggle – only visible to logged‑in users */}
        {user ? (
          <button
            type="button"
            className="section-toggle-btn"
            onClick={() => setShowCustomization(!showCustomization)}
          >
            <span>QR Code Customization</span>
            <span>{showCustomization ? '▲' : '▼'}</span>
          </button>
        ) : (
          <div className="login-prompt">
            <p>✨ Want to customize your QR code? <a href="/login">Login</a> to use colors, logos, and text.</p>
          </div>
        )}

        {/* Customization section – only shown when showCustomization is true */}
        {showCustomization && user && (
          <div className="customization-section">
            <div className="coin-notice">
              ⚡ Customization costs <strong>40 coins</strong>. Your current balance: <strong>{user.coins ?? '—'}</strong>
            </div>
            <div className="customization-grid">
              <div className="color-picker">
                <label>QR Code Color</label>
                <input
                  type="color"
                  value={customization.qrColor}
                  onChange={(e) => setCustomization(prev => ({
                    ...prev,
                    qrColor: e.target.value
                  }))}
                />
              </div>
              
              <div className="color-picker">
                <label>Background Color</label>
                <input
                  type="color"
                  value={customization.bgColor}
                  onChange={(e) => setCustomization(prev => ({
                    ...prev,
                    bgColor: e.target.value
                  }))}
                />
              </div>
            </div>

            <div className="text-options">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={customization.includeText}
                  onChange={(e) => setCustomization(prev => ({
                    ...prev,
                    includeText: e.target.checked
                  }))}
                />
                Add Custom Text
              </label>
              
              {customization.includeText && (
                <>
                  <input
                    type="text"
                    placeholder="Enter text to display with QR code"
                    value={customization.text}
                    onChange={(e) => setCustomization(prev => ({
                      ...prev,
                      text: e.target.value
                    }))}
                  />
                  
                  <select
                    value={customization.textPosition}
                    onChange={(e) => setCustomization(prev => ({
                      ...prev,
                      textPosition: e.target.value
                    }))}
                  >
                    <option value="top">Above QR Code</option>
                    <option value="bottom">Below QR Code</option>
                  </select>
                  
                  <div className="text-style">
                    <input
                      type="color"
                      value={customization.textColor}
                      onChange={(e) => setCustomization(prev => ({
                        ...prev,
                        textColor: e.target.value
                      }))}
                    />
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
                      <option value="Courier New">Courier New</option>
                      <option value="Inter">Inter</option>
                      <option value="Segoe UI">Segoe UI</option>
                    </select>
                    <input
                      type="number"
                      min="8"
                      max="72"
                      value={customization.textSize}
                      onChange={(e) => setCustomization(prev => ({
                        ...prev,
                        textSize: parseInt(e.target.value, 10)
                      }))}
                    />
                  </div>
                </>
              )}
            </div>

            <div className="logo-upload">
              <label>Add Logo/Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
              />
              {customization.logo && (
                <button
                  type="button"
                  onClick={() => setCustomization(prev => ({ ...prev, logo: null }))}
                  className="remove-logo"
                >
                  Remove Logo
                </button>
              )}
            </div>
          </div>
        )}

        {/* Preview toggle button */}
        <button
          type="button"
          className="section-toggle-btn"
          onClick={() => setShowPreview(!showPreview)}
        >
          <span>QR Code Preview</span>
          <span>{showPreview ? '▲' : '▼'}</span>
        </button>

        {/* Preview section – only shown when showPreview is true */}
        {showPreview && (
          <div className="preview-section">
            {renderPreview()}
          </div>
        )}

        <div className="advanced-section">
          <button
            type="button"
            className="section-toggle-btn"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            <span>Advanced Configuration</span>
            <span>{showAdvanced ? '▲' : '▼'}</span>
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
          disabled={loading || !longUrl}
        >
          {loading ? 'Generating...' : 'Generate QR Code & Short URL'}
        </button>
      </form>
    </div>
  );
};

export default QRCodeShortener;