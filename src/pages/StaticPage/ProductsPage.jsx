// ProductsPage.js
import React from 'react';
import './ProductsPage.css';

const ProductsPage = () => {
  const products = [
    {
      icon: '🔗',
      title: 'Advanced Short URL Generator',
      description:
        'Create powerful short links with custom slugs, expiration dates, password protection, and geo-targeting. Perfect for campaigns and personal use.',
      link: '/',
    },
    {
      icon: '📱',
      title: 'QR Code Generation',
      description:
        'Generate high-quality QR codes for any shortened URL. Download as PNG, SVG, or EPS. Ideal for print and digital media.',
      link: '/',
    },
    {
      icon: '📊',
      title: 'Advanced Analytics',
      description:
        'Get real-time insights into your link performance. Track clicks, referrers, devices, and locations with easy-to-read dashboards. Just add /analytics to any URL.',
      link: '/analytics',
    },
    {
      icon: '✉️',
      title: 'Text Destination',
      description:
        'Turn any short link into a text-sharing tool. Create rich text snippets, code blocks, or plain text pages. Share notes, instructions, or messages instantly.',
      link: '/',
    },
    {
      icon: '🏷️',
      title: 'Brand URL',
      description:
        'Use your own custom domain for short links. Enhance brand recognition and trust with personalized URLs. Easy setup with our DNS guides.',
      link: '/brand-url',
    },
    {
      icon: '🌿',
      title: 'Link in Bio',
      description:
        'Build a stunning mini landing page to house all your important links. Perfect for Instagram, TikTok, and other social platforms. Fully customizable and free.',
      link: '/link-in-bio',
    },
  ];

  return (
    <div className="products-page">
      <div className="container">
        <header className="products-header">
          <h1>OmsUrl Products</h1>
          <p className="subhead">
            A complete suite of powerful, privacy-first linking tools — all <strong>100% free</strong>, with no sign-up required for basic features.
          </p>
        </header>

        <div className="products-grid">
          {products.map((product, index) => (
            <div className="product-card" key={index}>
              <div className="card-icon">{product.icon}</div>
              <h3>{product.title}</h3>
              <p>{product.description}</p>
              <a href={product.link} className="card-link">
                Learn more <span aria-hidden="true">→</span>
              </a>
            </div>
          ))}
        </div>

        <section className="products-cta">
          <h2>Ready to simplify your links?</h2>
          <p>
            Start using any of our products instantly no account needed. Create your first short link now and explore all the advanced features.
          </p>
          <a href="/" className="cta-button">Create a short link</a>
        </section>

      </div>
    </div>
  );
};

export default ProductsPage;