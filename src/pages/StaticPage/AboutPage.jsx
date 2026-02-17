// AboutPage.js
import React from 'react';
import './AboutPage.css'; // optional – you can use inline styles or a CSS module

const AboutPage = () => {
  return (
    <div className="about-page">
      <div className="container">
        {/* Header */}
        <header className="about-header">
          <h1>About OmsUrl</h1>
          <p className="lead">
            OmsUrl is a lightweight, privacy-first URL shortening service built by Omslabs.
            Our goal is to give individuals and teams a fast, reliable way to shorten links,
            share them, and measure performance with actionable analytics.
          </p>
        </header>

        {/* Mission */}
        <section className="mission">
          <div className="icon">🎯</div>
          <h2>Our Mission</h2>
          <p>
            We believe links should be simple, fast, and respectful of user privacy.
            OmsUrl focuses on delivering advanced link features dynamic rules,
            geo-targeting, QR codes, password protection, and detailed analytics
            while keeping the user experience friction‑free.
          </p>
        </section>

        {/* Built By */}
        <section className="built-by">
          <div className="icon">👥</div>
          <h2>Built By</h2>
          <p>
            OmsUrl is developed and maintained by Omslabs. If you'd like to provide feedback,
            report an issue, or request a feature, please use the contact form on the site
            or email us (see the Contact section in the footer).
          </p>
        </section>

        {/* Trust & Safety */}
        <section className="trust">
          <div className="icon">🛡️</div>
          <h2>Trust & Safety</h2>
          <p>
            We take abuse seriously. If you find a link that violates our terms,
            please report it via our support channels. We reserve the right to
            suspend links/accounts that are used for abusive or illegal activities.
          </p>
        </section>

        {/* Free Advanced Features – highlighted section */}
        <section className="free-features">
          <h2>⚡ Free, Open & Advanced</h2>
          <p>
            OmsUrl is completely free and open for everyone. You can generate short URLs
            <strong> without signing in</strong> and access advanced features at no cost:
          </p>
          <div className="features-grid">
            <div className="feature-item">🔗 No sign‑up required</div>
            <div className="feature-item">📊 Analytics via <code>/analytics</code></div>
            <div className="feature-item">📤 Bulk upload & management</div>
            <div className="feature-item">🔒 Password protection</div>
            <div className="feature-item">🖼️ Splash screen before redirect</div>
            <div className="feature-item">⏰ URL redirection scheduling</div>
            <div className="feature-item">⌛ URL expiration control</div>
            <div className="feature-item">🌍 Multiple destination URLs</div>
            <div className="feature-item">📱 QR code generator</div>
            <div className="feature-item">✉️ Text destination generator</div>
          </div>
          
        </section>

        {/* Key points (Lightning Fast, Privacy First, Advanced Analytics) */}
        <section className="key-points">
          <div className="point">
            <span className="point-icon">⚡</span>
            <h3>Lightning Fast</h3>
            <p>Instant URL shortening with sub‑second response times</p>
          </div>
          <div className="point">
            <span className="point-icon">🔒</span>
            <h3>Privacy First</h3>
            <p>We respect user privacy with anonymized analytics</p>
          </div>
          <div className="point">
            <span className="point-icon">📊</span>
            <h3>Advanced Analytics</h3>
            <p>Detailed insights into link performance and audience</p>
          </div>
        </section>

        {/* Call to Action */}
        <section className="feedback">
          <h2>Have Questions or Feedback?</h2>
          <p>
            We're always looking to improve. Reach out to us through the help button
            or email us directly. Your input helps us build a better service for everyone.
          </p>
        </section>
      </div>
    </div>
  );
};

export default AboutPage;