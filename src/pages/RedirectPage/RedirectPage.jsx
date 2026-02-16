// src/pages/RedirectPage/RedirectPage.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { urlAPI, analyticsAPI } from '../../services/api';
import SplashScreenView from './SplashScreenView';
import TextPageView from './TextPageView';
import './RedirectPage.css';

const RedirectPage = () => {
  const { alias } = useParams();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [redirectData, setRedirectData] = useState(null);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [textPageData, setTextPageData] = useState(null);

  const [splashVisible, setSplashVisible] = useState(false);
  const [splashConfig, setSplashConfig] = useState(null);
  const [redirectUrl, setRedirectUrl] = useState(null);
  const [evaluatingRules, setEvaluatingRules] = useState(false);

  const isMounted = useRef(true);
  const requestInProgress = useRef(false);
  const retryCount = useRef(0);
  const maxRetries = 3;
  const hasTracked = useRef(false);

  const fetchRedirectData = useCallback(async () => {
    if (requestInProgress.current) return;

    try {
      requestInProgress.current = true;
      setLoading(true);
      setError(null);
      setSplashVisible(false);
      setTextPageData(null);

      const response = await urlAPI.getUrl(alias);

      if (!response.data || response.data.success === false) {
        const message = response.data?.message || 'An unexpected error occurred';
        if (isMounted.current) setError(message);
        return;
      }

      const urlData = response.data.data?.url || response.data.data;

      if (!urlData) {
        if (isMounted.current) {
          setError('The requested short URL could not be found in our system.');
        }
        return;
      }

      // Track visit (only once, ignore 404 errors)
      if (!hasTracked.current) {
        try {
          await analyticsAPI.click(alias);
          hasTracked.current = true;
        } catch (trackError) {
          console.warn('Tracking unavailable (non‑fatal):', trackError.message);
          // Don't break the flow
        }
      }

      if (isMounted.current) {
        // Status flags
        if (urlData.type === 'paused' || urlData.active === false) {
          setRedirectData({
            type: 'paused',
            customMessage: urlData.customMessage || 'This shortened URL has been temporarily suspended by the owner.'
          });
          setLoading(false);
          return;
        }

        if (urlData.type === 'restricted' || urlData.restricted) {
          setRedirectData({
            type: 'restricted',
            message: urlData.restrictionReason || 'This URL has been restricted and cannot be accessed.'
          });
          setLoading(false);
          return;
        }

        if (urlData.type === 'expired') {
          setRedirectData({
            type: 'expired',
            message: 'This shortened URL has expired and is no longer active.'
          });
          setLoading(false);
          return;
        }

        // Password protection
        const requiresPassword = !!(
          urlData.passwordProtected ||
          urlData.requiresPassword ||
          urlData.passwordNote ||
          urlData.protected
        );

        if (requiresPassword) {
          setShowPasswordForm(true);
          setRedirectData({
            type: 'password',
            note: urlData.passwordNote || urlData.note || null
          });
          setLoading(false);
          return;
        }

        // Text page (no password) – check for textContent as fallback indicator
        if (urlData.type === 'text' || urlData.textContent) {
          setTextPageData({
            textContent: urlData.textContent,
            customization: urlData.customization,
            alias: urlData.alias,
            shortUrl: urlData.shortUrl
          });
          setLoading(false);
          return;
        }

        // --- Regular URL logic ---
        let destination = urlData.longUrl || urlData.destination || urlData.shortUrl;
        if (!destination) {
          setError('The requested short URL could not be found in our system.');
          setLoading(false);
          return;
        }

        // Scheduled redirect
        if (urlData.scheduledRedirect?.enabled) {
          const now = new Date();
          const start = new Date(urlData.scheduledRedirect.startDate);
          if (now < start) {
            setRedirectData({
              type: 'scheduled',
              message: urlData.scheduledRedirect.message || 'This link will be available later.',
              startDate: urlData.scheduledRedirect.startDate
            });
            setLoading(false);
            return;
          }
          const end = urlData.scheduledRedirect.endDate ? new Date(urlData.scheduledRedirect.endDate) : null;
          if (end && now > end) {
            setRedirectData({
              type: 'expired',
              message: 'This link has expired.'
            });
            setLoading(false);
            return;
          }
        }

        // Expiration
        if (urlData.expiration?.enabled && urlData.expiration.expireAt) {
          const now = new Date();
          const expireAt = new Date(urlData.expiration.expireAt);
          if (now > expireAt) {
            if (urlData.expiration.expiredRedirect) {
              window.location.href = urlData.expiration.expiredRedirect;
              return;
            } else {
              setRedirectData({
                type: 'expired',
                message: 'This link has expired.'
              });
              setLoading(false);
              return;
            }
          }
        }

        // Multiple destination rules
        if (urlData.multipleDestinationRules && urlData.multipleDestinationRules.length > 0) {
          setEvaluatingRules(true);
          try {
            const evalResponse = await urlAPI.evaluateRules(alias);
            if (evalResponse.data.destination) {
              destination = evalResponse.data.destination;
            }
          } catch (err) {
            console.error('Rule evaluation error:', err);
          }
          setEvaluatingRules(false);
        }

        // Splash screen
        if (urlData.splashScreen?.enabled) {
          setSplashConfig(urlData.splashScreen);
          setSplashVisible(true);
          setRedirectUrl(destination);
          setLoading(false);
          return;
        }

        // Normal redirect
        setRedirectData({
          type: 'redirecting',
          destination
        });

        setTimeout(() => {
          if (isMounted.current) {
            window.location.href = destination;
          }
        }, 2000);
      }
    } catch (err) {
      console.error('Redirect fetch error:', err);

      if (!isMounted.current) return;

      if (err.response?.status === 429) {
        setError('Too many requests. Please wait a moment and refresh the page.');
        if (retryCount.current < maxRetries) {
          retryCount.current += 1;
          const retryDelay = Math.min(1000 * Math.pow(2, retryCount.current), 10000);
          setTimeout(() => {
            if (isMounted.current) fetchRedirectData();
          }, retryDelay);
        }
        return;
      }

      if (err.response?.status === 404) {
        setError('The requested short URL could not be found in our system.');
      } else if (!err.response) {
        setError('Network connection issue - Please check your connection');
      } else {
        setError(err.response?.data?.message || 'An unexpected error occurred');
      }
    } finally {
      if (isMounted.current) setLoading(false);
      requestInProgress.current = false;
    }
  }, [alias]);

  useEffect(() => {
    isMounted.current = true;
    retryCount.current = 0;
    hasTracked.current = false;
    fetchRedirectData();

    return () => {
      isMounted.current = false;
    };
  }, [fetchRedirectData]);

  // Password submission
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');
    if (!password) {
      setPasswordError('Please enter the password');
      return;
    }

    try {
      const response = await urlAPI.verifyPassword(alias, { password });

      if (response.data && response.data.valid) {
        // Check if this is a text page (either by type or presence of textContent)
        if (response.data.type === 'text' || response.data.textContent) {
          setTextPageData({
            textContent: response.data.textContent,
            customization: response.data.customization,
            alias: response.data.alias || alias,
            shortUrl: response.data.shortUrl
          });
          setShowPasswordForm(false);
          setLoading(false);
        } else {
          // Regular URL – redirect
          const dest = response.data.redirectTo || response.data.redirectUrl;
          if (dest) {
            window.location.href = dest;
            return;
          }
          // fallback
          window.location.href = `/api/urls/redirect/${alias}?password=${encodeURIComponent(password)}`;
        }
      } else {
        setPasswordError('Incorrect password - Please try again');
      }
    } catch (err) {
      console.error('Password verification error:', err);
      if (err.response?.status === 401) {
        setPasswordError('Incorrect password - Please try again');
      } else if (err.response?.status === 429) {
        setPasswordError('Too many attempts. Please wait a moment and try again.');
      } else {
        setPasswordError(err.response?.data?.message || 'An unexpected error occurred');
      }
    }
  };

  const handleSplashContinue = () => {
    if (redirectUrl) window.location.href = redirectUrl;
  };

  const handleSplashSkip = () => {
    if (redirectUrl) window.location.href = redirectUrl;
  };

  const handleDirectRedirect = () => {
    if (redirectData?.destination) window.location.href = redirectData.destination;
  };

  const handleBackToHome = () => {
    window.location.href = '/';
  };

  const handleRetry = () => {
    retryCount.current = 0;
    fetchRedirectData();
  };

  // Render loading state
  if (loading) {
    return (
      <div className="redirect-loading">
        <div className="spinner"></div>
        <p>Verifying URL and preparing redirect...</p>
        {evaluatingRules && <p className="rule-hint">Evaluating routing rules...</p>}
      </div>
    );
  }

  // Render error
  if (error) {
    return (
      <div className="redirect-error">
        <h2>🔗 URL Not Found</h2>
        <p>{error}</p>
        <div className="error-actions">
          <button onClick={handleRetry} className="retry-btn">
            Try Again
          </button>
          <button onClick={handleBackToHome} className="home-link">
            Return to Homepage
          </button>
        </div>
      </div>
    );
  }

  // Render text page (after password or directly)
  if (textPageData) {
    return (
      <TextPageView
        textContent={textPageData.textContent}
        customization={textPageData.customization}
        alias={textPageData.alias}
        shortUrl={textPageData.shortUrl}
      />
    );
  }

  // Render password form
  if (showPasswordForm) {
    return (
      <div className="password-redirect">
        <div className="password-form-container">
          <h2>🔒 Password Protected URL</h2>
          {redirectData?.note && (
            <div className="password-note">
              <p>{redirectData.note}</p>
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className="password-form">
            <div className="form-group">
              <label htmlFor="password">Enter access password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPasswordError('');
                }}
                placeholder="Enter password to access this URL"
                className={passwordError ? 'error' : ''}
                required
                autoFocus
              />
              {passwordError && <span className="error-text">{passwordError}</span>}
            </div>

            <button type="submit" className="submit-btn">
              Continue
            </button>
          </form>

          <div className="password-footer">
            <p>Forgot password? Contact the URL owner for access.</p>
          </div>
        </div>
      </div>
    );
  }

  // Render splash screen
  if (splashVisible && splashConfig) {
    return (
      <SplashScreenView
        config={splashConfig}
        destinationUrl={redirectUrl}
        onContinue={handleSplashContinue}
        onSkip={handleSplashSkip}
      />
    );
  }

  // Render status messages (paused, restricted, expired, scheduled, redirecting)
  const renderRedirectMessage = () => {
    switch (redirectData?.type) {
      case 'paused':
        return (
          <div className="redirect-message paused">
            <h2>⏸️ URL Temporarily Suspended</h2>
            <div className="message-content">
              <p>{redirectData.customMessage}</p>
            </div>
            <div className="redirect-actions">
              <button onClick={() => window.history.back()} className="back-btn">
                Go Back
              </button>
              <button onClick={handleBackToHome} className="home-link">
                Visit OmsUrl Home
              </button>
            </div>
          </div>
        );

      case 'restricted':
        return (
          <div className="redirect-message restricted">
            <h2>⛔ Access Restricted</h2>
            <div className="message-content">
              <p>{redirectData.message}</p>
              <p className="contact-info">
                For assistance, contact support:{' '}
                <a href={`mailto:${process.env.REACT_APP_ADMIN_EMAIL || 'support@omsurl.com'}`}>
                  {process.env.REACT_APP_ADMIN_EMAIL || 'support@omsurl.com'}
                </a>
              </p>
            </div>
          </div>
        );

      case 'expired':
        return (
          <div className="redirect-message expired">
            <h2>⌛ URL Expired</h2>
            <div className="message-content">
              <p>{redirectData.message}</p>
              <p>Please contact the URL owner for a new link.</p>
            </div>
          </div>
        );

      case 'scheduled':
        return (
          <div className="redirect-message scheduled">
            <h2>📅 Link Not Yet Active</h2>
            <div className="message-content">
              <p>{redirectData.message}</p>
              {redirectData.startDate && (
                <p className="available-date">
                  Available from: {new Date(redirectData.startDate).toLocaleString()}
                </p>
              )}
            </div>
            <div className="redirect-actions">
              <button onClick={handleBackToHome} className="home-link">
                Return to Homepage
              </button>
            </div>
          </div>
        );

      case 'redirecting':
        return (
          <div className="redirect-message redirecting">
            <h2>↪️ Redirecting...</h2>
            <div className="message-content">
              <p>You are being redirected to the destination URL:</p>
              <div className="destination-link">
                <a href={redirectData.destination} target="_blank" rel="noopener noreferrer">
                  {redirectData.destination}
                </a>
              </div>
              <div className="redirect-timer">
                <div className="timer-bar"></div>
                <span>Redirecting in 2s</span>
              </div>
            </div>
            <div className="redirect-actions">
              <button onClick={handleDirectRedirect} className="direct-link">
                Continue Now
              </button>
              <button onClick={() => window.history.back()} className="cancel-btn">
                Cancel
              </button>
            </div>
          </div>
        );

      default:
        return (
          <div className="redirect-error">
            <h2>🔗 URL Not Found</h2>
            <p>The requested short URL could not be found in our system.</p>
            <button onClick={handleBackToHome} className="home-link">
              Return to Homepage
            </button>
          </div>
        );
    }
  };

  return (
    <div className="redirect-page">
      {renderRedirectMessage()}

      <div className="redirect-info">
        <p className="alias-info">
          Short URL: <strong>/{alias}</strong>
        </p>
        <div className="create-your-own">
          <p>Create your own professional short URLs</p>
          <button onClick={handleBackToHome} className="create-link">
            Get Started Free
          </button>
        </div>
      </div>
    </div>
  );
};

export default RedirectPage;