// src/pages/RedirectPage/TextPageView.jsx
import React from 'react';
import './TextPageView.css'; // optional

/**
 * Component to display a text page with custom styling.
 * @param {Object} props
 * @param {string} props.textContent - The main text content
 * @param {Object} props.customization - Styling options
 * @param {string} props.alias - The page alias
 * @param {string} props.shortUrl - The full short URL
 */
const TextPageView = ({ textContent, customization, alias, shortUrl }) => {
  // Default values in case customization is missing
  const {
    pageColor = '#FFFFFF',
    textColor = '#000000',
    textFont = 'Arial',
    textSize = 16,
    padding = 20,
    lineHeight = 1.5,
    textAlignment = 'left',
    borderRadius = 0,
    boxShadow = false,
    title = '',
  } = customization || {};

  const containerStyle = {
    backgroundColor: pageColor,
    color: textColor,
    fontFamily: textFont,
    fontSize: `${textSize}px`,
    padding: `${padding}px`,
    lineHeight: lineHeight,
    textAlign: textAlignment,
    maxWidth: '800px',
    margin: '0 auto',
    borderRadius: borderRadius ? `${borderRadius}px` : '0',
    boxShadow: boxShadow ? '0 2px 10px rgba(0,0,0,0.1)' : 'none',
  };

  // If textContent is missing or empty, show a fallback message
  const hasContent = textContent && typeof textContent === 'string' && textContent.trim() !== '';

  return (
    <div className="text-page-view" style={containerStyle}>
      {title && (
        <h1 className="text-page-title" style={{ marginTop: 0 }}>
          {title}
        </h1>
      )}
      <div className="text-page-content" style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
        {hasContent ? (
          textContent
        ) : (
          <em style={{ color: '#999' }}>
            This text page has no content.
          </em>
        )}
      </div>
      <hr className="text-page-divider" style={{ margin: '30px 0 20px' }} />
      <div className="text-page-footer">
        <small>
          Shared via{' '}
          <a href={shortUrl} target="_blank" rel="noopener noreferrer">
            {shortUrl}
          </a>
        </small>
      </div>
    </div>
  );
};

export default TextPageView;