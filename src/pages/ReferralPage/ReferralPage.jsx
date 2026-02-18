// src/pages/ReferralPage/ReferralPage.jsx
import React, { useState, useEffect } from 'react';
import coinService from '../../services/coin';
import toast from 'react-hot-toast';
import './ReferralPage.css';

const ReferralPage = () => {
  const [referralCode, setReferralCode] = useState('');
  const [referralUrl, setReferralUrl] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReferralCode();
  }, []);

  const fetchReferralCode = async () => {
    setLoading(true);
    try {
      const res = await coinService.getReferralCode();
      if (res.success) {
        setReferralCode(res.code);
        setReferralUrl(res.url);
      } else {
        // If failed, try generating a new one
        toast.error(res.message || 'Failed to load referral code');
        // Optionally auto-generate? We'll let user click button
      }
    } catch (error) {
      toast.error('Failed to load referral data');
      console.error('Referral fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateNewCode = async () => {
    try {
      const res = await coinService.generateReferralCode();
      if (res.success) {
        setReferralCode(res.code);
        setReferralUrl(res.url);
        toast.success('New referral code generated!');
      } else {
        toast.error(res.message || 'Failed to generate new code');
      }
    } catch (error) {
      toast.error('Failed to generate new code');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="referral-page">
      <h1>Refer & Earn</h1>
      <p>Invite your friends and earn 20 coins for each successful registration!</p>

      <div className="referral-code-section">
        <h2>Your Referral Code</h2>
        <div className="code-box">
          <span className="code">{referralCode || 'No code yet'}</span>
          <button onClick={() => copyToClipboard(referralCode)} disabled={!referralCode}>
            Copy
          </button>
        </div>

        <h2>Referral Link</h2>
        <div className="link-box">
          <input
            type="text"
            value={referralUrl || (referralCode ? `${window.location.origin}/register?ref=${referralCode}` : '')}
            readOnly
          />
          <button
            onClick={() => copyToClipboard(referralUrl || `${window.location.origin}/register?ref=${referralCode}`)}
            disabled={!referralCode}
          >
            Copy
          </button>
        </div>

        <button className="generate-btn" onClick={generateNewCode}>
          Generate New Code
        </button>
      </div>

      <div className="share-options">
        <h3>Share on Social Media</h3>
        <div className="share-buttons">
          <a
            href={`https://twitter.com/intent/tweet?text=Join me on Short.ly! Use my referral link: ${referralUrl || (referralCode ? `${window.location.origin}/register?ref=${referralCode}` : '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="share-btn twitter"
          >
            Twitter
          </a>
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralUrl || (referralCode ? `${window.location.origin}/register?ref=${referralCode}` : ''))}`}
            target="_blank"
            rel="noopener noreferrer"
            className="share-btn facebook"
          >
            Facebook
          </a>
          <a
            href={`https://wa.me/?text=${encodeURIComponent(`Join Short.ly using my referral link: ${referralUrl || (referralCode ? `${window.location.origin}/register?ref=${referralCode}` : '')}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="share-btn whatsapp"
          >
            WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
};

export default ReferralPage;