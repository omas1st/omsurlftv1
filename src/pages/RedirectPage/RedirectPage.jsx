// src/pages/RedirectPage/RedirectPage.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { urlAPI, analyticsAPI, textAPI } from '../../services/api';
import SplashScreenView from './SplashScreenView';
import TextPageView from './TextPageView';
import './RedirectPage.css';

const RedirectPage = () => {
  const { alias } = useParams();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [redirectData, setRedirectData] = useState(null);
  const [urlData, setUrlData] = useState(null);                // store the initial URL data

  // Password form states (combined for URL and text page)
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordNote, setPasswordNote] = useState('');        // note shown on password form
  const [isTextPagePassword, setIsTextPagePassword] = useState(false); // true if unlocking text page

  const [textPageData, setTextPageData] = useState(null);      // full text page data

  const [splashVisible, setSplashVisible] = useState(false);
  const [splashConfig, setSplashConfig] = useState(null);
  const [redirectUrl, setRedirectUrl] = useState(null);
  const [evaluatingRules, setEvaluatingRules] = useState(false);

  const isMounted = useRef(true);
  const requestInProgress = useRef(false);
  const retryCount = useRef(0);
  const maxRetries = 3;
  const hasTracked = useRef(false);

  // Fetch text page (with optional password)
  const fetchTextPage = useCallback(async (passwordAttempt = null) => {
    try {
      const response = await textAPI.getOne(alias, passwordAttempt);
      if (response.data?.success && response.data.data?.textPage) {
        setTextPageData(response.data.data.textPage);
        setShowPasswordForm(false);
        setIsTextPagePassword(false);
        setPassword('');
      } else {
        // Fallback to minimal data (should not happen)
        setTextPageData({
          textContent: urlData?.textContent,
          customization: urlData?.customization,
          alias,
          shortUrl: `${window.location.origin}/${alias}`,
        });
      }
    } catch (err) {
      if (err.response?.status === 401 && err.response.data?.requiresPassword) {
        // Password required
        setShowPasswordForm(true);
        setIsTextPagePassword(true);
        setPasswordNote(err.response.data.passwordNote || '');
      } else {
        console.error('Failed to fetch full text page:', err);
        // Fallback to minimal data
        setTextPageData({
          textContent: urlData?.textContent,
          customization: urlData?.customization,
          alias,
          shortUrl: `${window.location.origin}/${alias}`,
        });
      }
    }
  }, [alias, urlData]);

  const fetchRedirectData = useCallback(async () => {
    if (requestInProgress.current) return;

    try {
      requestInProgress.current = true;
      setLoading(true);
      setError(null);
      setSplashVisible(false);
      setTextPageData(null);
      setShowPasswordForm(false);
      setIsTextPagePassword(false);

      const response = await urlAPI.getUrl(alias);

      if (!response.data || response.data.success === false) {
        const message = response.data?.message || 'An unexpected error occurred';
        if (isMounted.current) setError(message);
        return;
      }

      const data = response.data.data?.url || response.data.data;
      setUrlData(data);

      if (!data) {
        if (isMounted.current) {
          setError('The requested short URL could not be found in our system.');
        }
        return;
      }

      // Track visit (only once)
      if (!hasTracked.current) {
        try {
          await analyticsAPI.click(alias);
          hasTracked.current = true;
        } catch (trackError) {
          console.warn('Tracking unavailable (non‑fatal):', trackError.message);
        }
      }

      if (isMounted.current) {
        // Status flags
        if (data.type === 'paused' || data.active === false) {
          setRedirectData({
            type: 'paused',
            customMessage: data.customMessage || 'This shortened URL has been temporarily suspended by the owner.'
          });
          setLoading(false);
          return;
        }

        if (data.type === 'restricted' || data.restricted) {
          setRedirectData({
            type: 'restricted',
            message: data.restrictionReason || 'This URL has been restricted and cannot be accessed.'
          });
          setLoading(false);
          return;
        }

        if (data.type === 'expired') {
          setRedirectData({
            type: 'expired',
            message: 'This shortened URL has expired and is no longer active.'
          });
          setLoading(false);
          return;
        }

        // Password protection (URL)
        const requiresPassword = !!(
          data.passwordProtected ||
          data.requiresPassword ||
          data.passwordNote ||
          data.protected
        );

        if (requiresPassword) {
          setShowPasswordForm(true);
          setIsTextPagePassword(false);
          setPasswordNote(data.passwordNote || data.note || null);
          setLoading(false);
          return;
        }

        // Text page – fetch full details
        if (data.type === 'text' || data.textContent) {
          await fetchTextPage(); // try without password
          setLoading(false);
          return;
        }

        // --- Regular URL logic (unchanged) ---
        let destination = data.longUrl || data.destination || data.shortUrl;
        if (!destination) {
          setError('The requested short URL could not be found in our system.');
          setLoading(false);
          return;
        }

        // Scheduled redirect
        if (data.scheduledRedirect?.enabled) {
          const now = new Date();
          const start = new Date(data.scheduledRedirect.startDate);
          if (now < start) {
            setRedirectData({
              type: 'scheduled',
              message: data.scheduledRedirect.message || 'This link will be available later.',
              startDate: data.scheduledRedirect.startDate
            });
            setLoading(false);
            return;
          }
          const end = data.scheduledRedirect.endDate ? new Date(data.scheduledRedirect.endDate) : null;
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
        if (data.expiration?.enabled && data.expiration.expireAt) {
          const now = new Date();
          const expireAt = new Date(data.expiration.expireAt);
          if (now > expireAt) {
            if (data.expiration.expiredRedirect) {
              window.location.href = data.expiration.expiredRedirect;
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
        if (data.multipleDestinationRules && data.multipleDestinationRules.length > 0) {
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
        if (data.splashScreen?.enabled) {
          setSplashConfig(data.splashScreen);
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
  }, [alias, fetchTextPage]);

  useEffect(() => {
    isMounted.current = true;
    retryCount.current = 0;
    hasTracked.current = false;
    fetchRedirectData();

    return () => {
      isMounted.current = false;
    };
  }, [fetchRedirectData]);

  // Password submission (handles both URL and text page passwords)
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');
    if (!password) {
      setPasswordError('Please enter the password');
      return;
    }

    if (isTextPagePassword) {
      // Text page password – fetch full page with password
      await fetchTextPage(password);
    } else {
      // URL password
      try {
        const response = await urlAPI.verifyPassword(alias, { password });

        if (response.data && response.data.valid) {
          // Check if this is a text page (maybe returned after password)
          if (response.data.type === 'text' || response.data.textContent) {
            // ✅ Now fetch the full text page data using the password
            await fetchTextPage(password);
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
    }
  };

  // ... (splash handlers, redirect handlers unchanged)

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
        <p>Loading</p>
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
        _id={textPageData._id}
        textContent={textPageData.textContent}
        customization={textPageData.customization}
        alias={textPageData.alias}
        shortUrl={textPageData.shortUrl}
        replies={textPageData.replies}
      />
    );
  }

  // Render password form (for URL or text page)
  if (showPasswordForm) {
    return (
      <div className="password-redirect">
        <div className="password-form-container">
          <h2>🔒 Password Protected {isTextPagePassword ? 'Text Page' : 'URL'}</h2>
          {passwordNote && (
            <div className="password-note">
              <p>{passwordNote}</p>
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
                placeholder="Enter password"
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
            <p>Forgot password? Contact the owner for access.</p>
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
    // ... (unchanged, same as before)
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
                <a href={`mailto:${process.env.REACT_APP_ADMIN_EMAIL || 'omslabs1st@gmail.com'}`}>
                  {process.env.REACT_APP_ADMIN_EMAIL || 'omslabs1st@gmail.com'}
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
              <div className="redirect-timer">
                <div className="timer-bar"></div>
                <span>Redirecting...</span>
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
          Short URL: <strong>omsurl.com/{alias}</strong>
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