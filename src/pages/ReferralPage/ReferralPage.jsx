// src/pages/ReferralPage/ReferralPage.jsx
import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import coinService from '../../services/coin';
import toast from 'react-hot-toast';
import './ReferralPage.css';

const REFERRAL_BONUS = 20; // matches backend constant

const ReferralPage = () => {
  const { user } = useContext(AuthContext);
  const [referralCode, setReferralCode] = useState('');
  const [referralUrl, setReferralUrl] = useState('');
  const [stats, setStats] = useState({
    totalReferrals: 0,
    earnedCoins: 0,
    pendingReferrals: 0,
  });
  const [loading, setLoading] = useState(true);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    fetchReferralData();
  }, []);

  const fetchReferralData = async () => {
    setLoading(true);
    try {
      // Get referral code and URL
      const codeResult = await coinService.getReferralCode();
      if (codeResult.success) {
        setReferralCode(codeResult.code);
        setReferralUrl(codeResult.url);
        if (codeResult.stats) {
          setStats(codeResult.stats);
        }
      } else {
        toast.error('Failed to load referral information');
      }

      // Get referral stats separately
      const statsResult = await coinService.getReferralStats();
      if (statsResult.success) {
        setStats(statsResult.stats);
      }
    } catch (error) {
      console.error('Referral page error:', error);
      toast.error('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
    toast.success('Referral link copied!');
  };

  const handleGenerateNewCode = async () => {
    try {
      const result = await coinService.generateReferralCode();
      if (result.success) {
        setReferralCode(result.code);
        setReferralUrl(result.url);
        toast.success('New referral code generated!');
      } else {
        toast.error(result.message || 'Failed to generate new code');
      }
    } catch (error) {
      toast.error('An error occurred');
    }
  };

  if (loading) {
    return (
      <div className="referral-loading">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="referral-page">
      <h1 className="page-title">Refer & Earn</h1>
      <p className="page-subtitle">
        Invite your friends to join OmsUrl and earn {REFERRAL_BONUS} coins for each successful referral!
      </p>

      <div className="referral-stats">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>Total Referrals</h3>
            <p className="stat-value">{stats.totalReferrals || 0}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🪙</div>
          <div className="stat-content">
            <h3>Coins Earned</h3>
            <p className="stat-value">{stats.earnedCoins || 0}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <h3>Pending</h3>
            <p className="stat-value">{stats.pendingReferrals || 0}</p>
          </div>
        </div>
      </div>

      <div className="referral-code-section">
        <h2>Your Referral Code</h2>
        <div className="code-box">
          <span className="code">{referralCode || user?.referralCode}</span>
          <button className="copy-btn" onClick={handleCopyLink}>
            {copySuccess ? 'Copied!' : 'Copy Link'}
          </button>
        </div>
        <p className="code-note">
          Share this link with your friends: <br />
          <a href={referralUrl} target="_blank" rel="noopener noreferrer" className="referral-link">
            {referralUrl}
          </a>
        </p>
        <button className="generate-new-btn" onClick={handleGenerateNewCode}>
          Generate New Code
        </button>
      </div>

      <div className="referral-info">
        <h3>How it works</h3>
        <ul>
          <li>Share your unique referral link with friends.</li>
          <li>When they sign up using your link, you earn {REFERRAL_BONUS} coins.</li>
          <li>Coins can be used to unlock premium features like bulk upload and splash screens.</li>
        </ul>
      </div>
    </div>
  );
};

export default ReferralPage;