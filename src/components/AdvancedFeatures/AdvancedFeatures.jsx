// src/components/AdvancedFeatures/AdvancedFeatures.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import AnalyticsPrivate from './AnalyticsPrivate';
import PasswordProtection from './PasswordProtection';
import ScheduledRedirect from './ScheduledRedirect';
import SplashScreen from './SplashScreen';
import LinkExpiration from './LinkExpiration';
import MultipleDestinationRouting from './MultipleDestinationRouting';
import './AdvancedFeatures.css';

const AdvancedFeatures = ({ features, onChange, user }) => {
  const { t } = useTranslation();

  const handleAnalyticsPrivateChange = (isPrivate) => {
    onChange({
      ...features,
      analyticsPrivate: isPrivate
    });
  };

  const handlePasswordChange = (payload) => {
    onChange({
      ...features,
      password: payload.password,
      passwordNote: payload.passwordNote
    });
  };

  const handleScheduledRedirectChange = (scheduledRedirect) => {
    onChange({
      ...features,
      scheduledRedirect
    });
  };

  const handleSplashScreenChange = (splashScreen) => {
    onChange({
      ...features,
      splashScreen
    });
  };

  const handleLinkExpirationChange = (expiration) => {
    onChange({
      ...features,
      expiration
    });
  };

  const handleMultipleDestinationChange = (rules) => {
    onChange({
      ...features,
      multipleDestinationRules: rules
    });
  };

  if (!user) {
    return (
      <div className="advanced-features-login">
        <p>{t('advancedFeatures.loginRequired')}</p>
      </div>
    );
  }

  return (
    <div className="advanced-features">
      <div className="features-list">
        <div className="feature-section">
          <PasswordProtection
            password={features.password || ''}
            passwordNote={features.passwordNote || ''}
            onChange={handlePasswordChange}
          />
        </div>

        <div className="feature-section">
          <AnalyticsPrivate
            isPrivate={features.analyticsPrivate || false}
            onChange={handleAnalyticsPrivateChange}
          />
        </div>

        <div className="feature-section">
          <ScheduledRedirect
            scheduledRedirect={features.scheduledRedirect || {}}
            onChange={handleScheduledRedirectChange}
          />
        </div>

        <div className="feature-section">
          <SplashScreen
            splashScreen={features.splashScreen || {}}
            onChange={handleSplashScreenChange}
          />
        </div>

        <div className="feature-section">
          <LinkExpiration
            expiration={features.expiration || {}}
            onChange={handleLinkExpirationChange}
          />
        </div>

        <div className="feature-section">
          <MultipleDestinationRouting
            rules={features.multipleDestinationRules || []}
            onChange={handleMultipleDestinationChange}
          />
        </div>
      </div>
    </div>
  );
};

export default AdvancedFeatures;