// src/components/Footer/Footer.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // added for navigation
import { contactAPI } from '../../services/api';
import './Footer.css';

const Footer = () => {
  const [showHelpPopup, setShowHelpPopup] = useState(false);
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    setError('');
    setSuccess('');
    setLoading(true);

    if (!message.trim()) {
      setError('Message is required');
      setLoading(false);
      return;
    }

    if (message.length > 5000) {
      setError('Message is too long (max 5000 characters)');
      setLoading(false);
      return;
    }

    if (email && !isValidEmail(email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await contactAPI.sendMessage(
        { email, message },
        { signal: controller.signal }
      );
      
      clearTimeout(timeoutId);

      if (response.data.success) {
        setSuccess('Message sent successfully!');
        setTimeout(() => {
          setShowHelpPopup(false);
          setMessage('');
          setEmail('');
          setSuccess('');
          setError('');
        }, 2000);
      } else {
        setError(response.data.message || 'Failed to send message');
      }
    } catch (err) {
      console.error('Error sending message:', err);
      
      if (err.name === 'AbortError' || err.code === 'ECONNABORTED') {
        setError('Request timeout. Please try again.');
      } else if (err.response) {
        setError(err.response.data?.message || err.message || 'Failed to send message');
      } else if (err.request) {
        setError('Network error. Please check your connection and try again.');
      } else {
        setError(err.message || 'Failed to send message');
      }
    } finally {
      setLoading(false);
    }
  };

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleClosePopup = () => {
    setShowHelpPopup(false);
    setMessage('');
    setEmail('');
    setError('');
    setSuccess('');
    setLoading(false);
  };

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains('help-popup-overlay') && !loading) {
      handleClosePopup();
    }
  };

  return (
    <footer className="footer">
      <div className="footer-content">
        {/* New navigation links */}
        <nav className="footer-nav">
          <Link to="/about">About</Link>
          <Link to="/privacy">Privacy</Link>
          <Link to="/terms">Terms</Link>
          <Link to="/products">Products</Link>
        </nav>

        <p>© 2025 OmsUrl</p>

        <button 
          className="help-btn"
          onClick={() => setShowHelpPopup(true)}
        >
          Help
        </button>
      </div>

      {showHelpPopup && (
        <div className="help-popup-overlay" onClick={handleOverlayClick}>
          <div className="help-popup">
            <div className="popup-header">
              <h3>Need Help?</h3>
              <button 
                className="close-btn"
                onClick={handleClosePopup}
                disabled={loading}
                aria-label="Close"
              >
                &times;
              </button>
            </div>
            
            {success && (
              <div className="alert alert-success">
                <span className="success-icon">✓</span> {success}
              </div>
            )}
            
            {error && (
              <div className="alert alert-error">
                <span className="error-icon">!</span> {error}
              </div>
            )}
            
            <form onSubmit={handleSendMessage} noValidate>
              <div className="form-group">
                <label>
                  Your Email 
                  <span className="optional"> (optional)</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  disabled={loading}
                  aria-label="Your email address"
                />
                <small className="form-help">
                  We'll reply to this email if provided
                </small>
              </div>
              <div className="form-group">
                <label>
                  Message *
                  <span className="char-count">
                    {message.length}/5000
                  </span>
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message here..."
                  rows="4"
                  disabled={loading}
                  required
                  maxLength={5000}
                  aria-label="Your message"
                />
                <small className="form-help">
                  Describe your issue or question in detail
                </small>
              </div>
              <div className="popup-actions">
                <button 
                  type="submit" 
                  className="send-btn"
                  disabled={loading || !message.trim()}
                  aria-busy={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner"></span>
                      Sending...
                    </>
                  ) : (
                    'Send Message'
                  )}
                </button>
                <button 
                  type="button" 
                  className="cancel-btn"
                  onClick={handleClosePopup}
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
              <div className="contact-info">
                <p className="info-text">
                  <strong>Note:</strong> We typically respond within 24 hours
                </p>
                <p className="info-text small">
                  If sending takes too long, your message will still be queued for delivery.
                </p>
              </div>
            </form>
          </div>
        </div>
      )}
    </footer>
  );
};

export default Footer;