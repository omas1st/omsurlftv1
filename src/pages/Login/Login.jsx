// src/pages/Login/Login.jsx
import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import './Login.css';

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    usernameOrEmail: '',
    password: ''
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.usernameOrEmail.trim()) {
      newErrors.usernameOrEmail = 'Username or email is required';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
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
    
    try {
      const result = await login({
        usernameOrEmail: formData.usernameOrEmail.toLowerCase(),
        password: formData.password
      });
      
      if (result.success) {
        toast.success('Login successful');
        
        // Check if user is admin
        if (result.user.isAdmin) {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      } else {
        toast.error(result.message || 'Invalid credentials');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h1>Welcome Back</h1>
          <p>Log in to your OmsUrl account</p>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="usernameOrEmail">Username or Email</label>
            <input
              type="text"
              id="usernameOrEmail"
              name="usernameOrEmail"
              value={formData.usernameOrEmail}
              onChange={handleChange}
              placeholder="Enter your username or email"
              className={errors.usernameOrEmail ? 'error' : ''}
              disabled={loading}
            />
            {errors.usernameOrEmail && <span className="error-text">{errors.usernameOrEmail}</span>}
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="password-input-container">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className={errors.password ? 'error' : ''}
                disabled={loading}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>
          
          <div className="form-options">
            <Link to="/forgot-password" className="forgot-password-link">
              Forgot password?
            </Link>
          </div>
          
          <button 
            type="submit" 
            className="login-btn"
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Log In'}
          </button>
        </form>
        
        <div className="login-footer">
          <p>
            Don't have an account?{' '}
            <Link to="/register" className="register-link">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;