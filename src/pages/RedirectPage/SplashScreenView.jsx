// src/pages/RedirectPage/SplashScreenView.jsx
import React, { useState, useEffect } from 'react';
import './RedirectPage.css';

const SplashScreenView = ({ config, destinationUrl, onContinue, onSkip }) => {
  const [counter, setCounter] = useState(config.redirectDelay || 5);
  const [allowSkip] = useState(config.allowSkip || false);

  useEffect(() => {
    if (counter <= 0) {
      onContinue();
      return;
    }
    const timer = setInterval(() => {
      setCounter(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [counter, onContinue]);

  const styles = {
    backgroundColor: config.backgroundColor || '#ffffff',
    color: config.textColor || '#000000',
    backgroundImage: config.image ? `url(${config.image})` : 'none',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  };

  return (
    <div className="splash-screen" style={styles}>
      <div className="splash-content">
        {config.title && <h1 className="splash-title">{config.title}</h1>}
        {config.message && <p className="splash-message">{config.message}</p>}
        <div className="splash-actions">
          <button onClick={onContinue} className="splash-continue-btn">
            {config.buttonText || 'Continue'}
          </button>
          {allowSkip && counter > 0 && (
            <button onClick={onSkip} className="splash-skip-btn">
              Skip ({counter}s)
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SplashScreenView;