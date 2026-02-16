import React, { useState, useEffect } from 'react';
import './AdvancedFeatures.css';

const SplashScreen = ({ splashScreen = {}, onChange }) => {
  const [enabled, setEnabled] = useState(splashScreen.enabled || false);
  const [title, setTitle] = useState(splashScreen.title || '');
  const [message, setMessage] = useState(splashScreen.message || '');
  const [image, setImage] = useState(splashScreen.image || '');
  const [buttonText, setButtonText] = useState(splashScreen.buttonText || 'Continue');
  const [redirectDelay, setRedirectDelay] = useState(splashScreen.redirectDelay || 5);
  const [allowSkip, setAllowSkip] = useState(splashScreen.allowSkip || false);
  const [backgroundColor, setBackgroundColor] = useState(splashScreen.backgroundColor || '#ffffff');
  const [textColor, setTextColor] = useState(splashScreen.textColor || '#000000');

  useEffect(() => {
    onChange({
      enabled,
      title,
      message,
      image,
      buttonText,
      redirectDelay,
      allowSkip,
      backgroundColor,
      textColor
    });
  }, [enabled, title, message, image, buttonText, redirectDelay, allowSkip, backgroundColor, textColor, onChange]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="feature-splash-screen">
      <label className="checkbox-label">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => setEnabled(e.target.checked)}
        />
        <span className="checkbox-custom"></span>
        <span className="checkbox-text">
          Show a splash screen before redirect
        </span>
      </label>

      {enabled && (
        <div className="splash-fields">
          <div className="form-row">
            <label className="feature-label">
              Title
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Welcome!"
                maxLength={60}
              />
            </label>
          </div>

          <div className="form-row">
            <label className="feature-label">
              Message
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="You are being redirected..."
                rows={3}
                maxLength={300}
              />
            </label>
          </div>

          <div className="form-row">
            <label className="feature-label">
              Background image (optional)
              <div className="image-upload">
                <input type="file" accept="image/*" onChange={handleImageUpload} />
                {image && (
                  <button
                    type="button"
                    className="remove-image"
                    onClick={() => setImage('')}
                  >
                    Remove
                  </button>
                )}
              </div>
            </label>
          </div>

          <div className="form-row">
            <label className="feature-label">
              Button text
              <input
                type="text"
                value={buttonText}
                onChange={(e) => setButtonText(e.target.value)}
                placeholder="Continue"
              />
            </label>
          </div>

          <div className="form-row">
            <label className="feature-label">
              Auto‑redirect after (seconds)
              <input
                type="number"
                min="0"
                max="30"
                value={redirectDelay}
                onChange={(e) => setRedirectDelay(parseInt(e.target.value, 10) || 0)}
              />
            </label>
          </div>

          <div className="form-row checkbox-row">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={allowSkip}
                onChange={(e) => setAllowSkip(e.target.checked)}
              />
              <span className="checkbox-text">
                Allow visitor to skip the delay
              </span>
            </label>
          </div>

          <div className="form-row color-row">
            <label className="feature-label">
              Background color
              <input
                type="color"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
              />
            </label>
            <label className="feature-label">
              Text color
              <input
                type="color"
                value={textColor}
                onChange={(e) => setTextColor(e.target.value)}
              />
            </label>
          </div>
        </div>
      )}
    </div>
  );
};

export default SplashScreen;