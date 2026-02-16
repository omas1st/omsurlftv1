// src/pages/ForgotPassword/ForgotPassword.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../../services/api';
import toast from 'react-hot-toast';
import './ForgotPassword.css';

const ForgotPassword = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: ''
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    if (errorMessage) {
      setErrorMessage('');
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setLoading(true);
    setErrorMessage('');
    
    try {
      const response = await authAPI.forgotPassword(formData);
      
      if (response.data.success) {
        setSuccess(true);
        toast.success('Password reset email sent');
      } else {
        setErrorMessage(response.data.message || 'An error occurred');
        toast.error(response.data.message || 'An error occurred');
      }
    } catch (error) {
      const message = error.response?.data?.message || 'An error occurred';
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="forgot-password-page">
        <div className="success-container">
          <div className="success-icon">✓</div>
          <h1>Check Your Email</h1>
          <p>We've sent a password reset link to your email address.</p>
          <Link to="/login" className="back-to-login-btn">
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="forgot-password-page">
      <div className="forgot-password-container">
        <div className="forgot-password-header">
          <h1>Forgot Password?</h1>
          <p>Enter your username and email to reset your password.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="forgot-password-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter your username"
              className={errors.username ? 'error' : ''}
              disabled={loading}
            />
            {errors.username && <span className="error-text">{errors.username}</span>}
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className={errors.email ? 'error' : ''}
              disabled={loading}
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>
          
          {errorMessage && (
            <div className="error-message">
              <p>{errorMessage}</p>
              <p className="contact-admin">
                If you continue to have issues, please contact{' '}
                <a href={`mailto:${process.env.REACT_APP_ADMIN_EMAIL || 'admin@example.com'}`}>
                  {process.env.REACT_APP_ADMIN_EMAIL || 'admin@example.com'}
                </a>
              </p>
            </div>
          )}
          
          <button 
            type="submit" 
            className="reset-btn"
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Reset Password'}
          </button>
        </form>
        
        <div className="forgot-password-footer">
          <Link to="/login" className="back-link">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;