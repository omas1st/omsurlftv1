// src/pages/RedirectPage/TextPageView.jsx
import React, { useState, useRef, useEffect } from 'react';
import { textAPI } from '../../services/api';
import socketService from '../../services/socket'; // ✅ import socket service
import './TextPageView.css';

const TextPageView = ({
  _id,
  textContent,
  customization,
  alias,
  shortUrl,
  replies: initialReplies = []
}) => {
  // State for reply form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [showExtraFields, setShowExtraFields] = useState(false); // toggle name/email

  // Local replies state (init from props)
  const [replies, setReplies] = useState(initialReplies);

  // Ref for messages container to auto-scroll
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new replies arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [replies]);

  // ✅ Socket subscription for real-time replies
  useEffect(() => {
    if (!_id) return;

    // Connect socket if not already connected
    socketService.connect();

    // Subscribe to this text page's replies
    const handleNewReply = (newReply) => {
      setReplies(prev => [...prev, newReply]);
    };

    socketService.subscribeToTextReplies(_id, handleNewReply);

    // Cleanup on unmount
    return () => {
      socketService.unsubscribeFromTextReplies(_id, handleNewReply);
    };
  }, [_id]);

  // Default values in case customization is missing
  const {
    pageColor = '#FFFFFF',
    textColor = '#000000',
    textFont = 'Arial',
    textSize = 14,
    padding = 12,
    lineHeight = 1.4,
    borderRadius = 8,
    boxShadow = false,
    title = '',
    allowResponse = false,
  } = customization || {};

  // Dynamic styles applied via CSS variables
  const chatContainerStyle = {
    '--page-bg': pageColor,
    '--text-color': textColor,
    '--font-family': textFont,
    '--font-size': `${textSize}px`,
    '--content-padding': `${padding}px`,
    '--line-height': lineHeight,
    '--border-radius': `${borderRadius}px`,
    '--box-shadow': boxShadow ? '0 2px 10px rgba(0,0,0,0.1)' : 'none',
  };

  const hasContent = textContent && typeof textContent === 'string' && textContent.trim() !== '';

  // Handle reply submission
  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      setSubmitError('Message cannot be empty');
      return;
    }

    setSubmitting(true);
    setSubmitError('');
    setSubmitSuccess('');

    try {
      const response = await textAPI.addReply(_id, {
        name: name.trim() || 'Anonymous',
        email: email.trim() || undefined,
        message: message.trim()
      });

      if (response.data?.success) {
        const newReply = response.data.data;
        // ✅ No need to manually update state here – socket will broadcast it back
        // But we can add it optimistically if we want instant feedback for the sender.
        // For consistency, we rely on the server broadcast.
        setReplies(prev => [...prev, newReply]); // optional optimistic update
        // Clear form
        setName('');
        setEmail('');
        setMessage('');
        setShowExtraFields(false);
        setSubmitSuccess('Reply submitted successfully');
        setTimeout(() => setSubmitSuccess(''), 3000);
      } else {
        setSubmitError(response.data?.message || 'Failed to submit reply');
      }
    } catch (err) {
      console.error('Reply submission error:', err);
      setSubmitError(err.response?.data?.message || 'Failed to submit reply');
    } finally {
      setSubmitting(false);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Only show reply form if we have an _id and responses are allowed
  const canReply = allowResponse && _id;

  const toggleExtraFields = () => setShowExtraFields(prev => !prev);

  return (
    <div className="chat-container" style={chatContainerStyle}>
      {/* Header */}
      <div className="chat-header">
        {title && <h1 className="chat-title">{title}</h1>}
        <div className="chat-share">
          <small>
            Shared via{' '}
            <a href={shortUrl} target="_blank" rel="noopener noreferrer">
              {shortUrl}
            </a>
          </small>
        </div>
      </div>

      {/* Main content area (scrollable messages) */}
      <div className="chat-messages">
        {hasContent && (
          <div className="chat-original-message">
            <div className="message-bubble message-bubble--system">
              <div className="message-text">{textContent}</div>
            </div>
          </div>
        )}

        {replies.length > 0 && (
          <div className="chat-replies">
            {replies.map(reply => (
              <div key={reply._id} className="message-wrapper">
                <div className="message-bubble message-bubble--reply">
                  <div className="message-header">
                    <span className="message-name">{reply.name}</span>
                    <span className="message-time">{formatDate(reply.createdAt)}</span>
                  </div>
                  <div className="message-text">{reply.message}</div>
                </div>
              </div>
            ))}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area fixed at bottom */}
      {canReply && (
        <div className="chat-input-area">
          <form onSubmit={handleReplySubmit} className="chat-form">
            <div className="input-row">
              <button
                type="button"
                className="attach-button"
                onClick={toggleExtraFields}
                aria-label="Add name and email"
              >
                <span>+</span>
              </button>
              <input
                type="text"
                className="message-input"
                placeholder="Type a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              />
              <button
                type="submit"
                className="send-button"
                disabled={submitting || !message.trim()}
              >
                {submitting ? '...' : 'Send'}
              </button>
            </div>

            {/* Expandable extra fields */}
            {showExtraFields && (
              <div className="extra-fields">
                <input
                  type="text"
                  placeholder="Your name (optional)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="extra-input"
                />
                <input
                  type="email"
                  placeholder="Email (optional)"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="extra-input"
                />
              </div>
            )}

            {submitError && <div className="error-message">{submitError}</div>}
            {submitSuccess && <div className="success-message">{submitSuccess}</div>}
          </form>
        </div>
      )}
    </div>
  );
};

export default TextPageView;