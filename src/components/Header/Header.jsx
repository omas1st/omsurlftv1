// src/components/Header/Header.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Header.css';

// Import the logo image
import logoImage from '../../assets/img1.png';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo-section">
          <Link to="/" className="logo">
            <div className="logo-image-container">
              <img src={logoImage} alt="OmsUrl Logo" className="logo-image" />
            </div>
            <div className="logo-text">
              <span className="platform-name">OmsUrl</span>
            </div>
          </Link>
        </div>

        <div className="header-actions">
          {user ? (
            <div className="user-actions">
              <Link to="/referral" className="refer-btn">
                <span className="btn-icon">👥</span>
                <span>Refer</span>
              </Link>
              <Link to="/dashboard" className="dashboard-btn">
                <span className="btn-icon">📊</span>
                <span>Dashboard</span>
              </Link>
              <div className="user-profile">
                <div className="user-avatar">
                  {user.email.charAt(0).toUpperCase()}
                </div>
                <div className="user-info">
                  <button onClick={handleLogout} className="logout-btn">
                    <span className="btn-icon">↪️</span>
                    Logout
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="auth-actions">
              <Link to="/login" className="login-btn">
                <span className="btn-icon">🔑</span>
                Login
              </Link>
              <Link to="/register" className="register-btn">
                <span className="btn-icon">🚀</span>
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;