// PrivacyPolicy.js
import React from 'react';
import './PrivacyPolicy.css';

const PrivacyPolicy = () => {
  return (
    <div className="privacy-policy">
      <div className="container">
        <header className="policy-header">
          <h1>Privacy Policy</h1>
          <p className="effective-date">Effective Date: February 17, 2026</p>
        </header>

        <section className="intro">
          <p>
            At <strong>OmsUrl</strong> (operated by Omslabs), we are committed to protecting your privacy.
            This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our URL shortening service.
            Please read this policy carefully. If you do not agree with the terms, do not access or use the service.
          </p>
        </section>

        <section className="info-collect">
          <h2>1. Information We Collect</h2>
          <p>We collect information to provide and improve our services. The types of information include:</p>
          <ul>
            <li>
              <strong>Shortened Link Data:</strong> When you create a short link, we collect the original URL,
              the generated short identifier (<code>shortId</code>), the creation timestamp, and aggregate click counts.
            </li>
            <li>
              <strong>Click & Analytics Data:</strong> For each click on a short link, we automatically collect
              anonymized metadata, including:
              <ul>
                <li>IP address (used only to derive approximate country/region, not stored as raw IP)</li>
                <li>User agent string (browser and device type)</li>
                <li>Referrer URL (the page where the click originated)</li>
                <li>Timestamp of the click</li>
                <li>Aggregated statistics (e.g., total clicks, unique clicks over time)</li>
              </ul>
              We do <em>not</em> create personal profiles or track individual users across different links.
            </li>
            <li>
              <strong>Account Data:</strong> If you create an account, we collect your email address,
              a securely hashed password, and any optional profile details you choose to provide.
            </li>
            <li>
              <strong>Cookies and Similar Technologies:</strong> We use cookies and local storage to maintain session state,
              remember preferences, and (if enabled) support affiliate tracking. You can control cookies through your browser settings.
            </li>
          </ul>
        </section>

        <section className="info-use">
          <h2>2. How We Use Your Information</h2>
          <p>We use the collected information for the following purposes:</p>
          <ul>
            <li>To operate, maintain, and improve the OmsUrl service (including redirects, analytics dashboards, and account features).</li>
            <li>To generate aggregated, anonymized analytics reports for link owners (e.g., click geography, referrer patterns).</li>
            <li>To detect, prevent, and address technical issues, fraud, or abuse of the platform.</li>
            <li>To communicate with you (e.g., service updates, security alerts, or support responses).</li>
            <li>To comply with legal obligations and enforce our Terms of Service.</li>
          </ul>
        </section>

        <section className="sharing">
          <h2>3. Data Sharing & Third Parties</h2>
          <p>
            We respect your privacy — we <strong>do not sell</strong> your personal data to third parties.
            We may share information only in the following limited circumstances:
          </p>
          <ul>
            <li>
              <strong>Aggregated Analytics:</strong> We may share non‑identifiable, aggregated statistics
              (e.g., “total clicks per day”) with partners or the public to demonstrate service usage.
            </li>
            <li>
              <strong>Service Providers:</strong> We engage trusted third‑party vendors (e.g., hosting, database,
              email delivery) who process data on our behalf under strict confidentiality agreements.
            </li>
            <li>
              <strong>Legal Requirements:</strong> We may disclose information if required by law, such as in response
              to a valid court order or governmental request, and always within the bounds of applicable privacy laws.
            </li>
          </ul>
        </section>

        <section className="retention">
          <h2>4. Data Retention</h2>
          <p>
            We retain your information only as long as necessary to provide the service and fulfill the purposes
            described in this policy. Specifically:
          </p>
          <ul>
            <li>
              <strong>Links and analytics:</strong> Retained until you delete the link via your dashboard,
              or in accordance with our standard retention period for inactive links.
            </li>
            <li>
              <strong>Account information:</strong> Retained until you delete your account. Deleted personal data
              is removed from active databases; however, residual copies may remain in encrypted backups for a
              limited period (typically up to 30 days) before being securely overwritten.
            </li>
          </ul>
        </section>

        <section className="rights">
          <h2>5. Your Rights and Choices</h2>
          <p>Depending on your jurisdiction, you may have the following rights regarding your personal data:</p>
          <ul>
            <li><strong>Access and Portability:</strong> Request a copy of the data we hold about you.</li>
            <li><strong>Correction:</strong> Update inaccurate or incomplete information via your account settings or by contacting us.</li>
            <li><strong>Deletion:</strong> Delete your links or your entire account directly from the dashboard. For other deletion requests, contact us.</li>
            <li><strong>Opt‑out of Analytics:</strong> You may disable certain tracking by adjusting your browser’s privacy settings or using browser extensions. Note that some basic data collection (e.g., click counts) is essential for the service to function.</li>
            <li><strong>Cookie Controls:</strong> Most browsers allow you to refuse or delete cookies. However, this may affect your experience with our site.</li>
          </ul>
          <p>
            To exercise any of these rights, please contact us using the information in the <a href="#contact">Contact section</a> below.
            We will respond within the timeframe required by applicable law.
          </p>
        </section>

        <section className="security">
          <h2>6. Data Security</h2>
          <p>
            We implement appropriate technical and organizational measures to protect your personal data against
            accidental or unlawful destruction, loss, alteration, unauthorized disclosure, or access.
            These measures include encryption (e.g., HTTPS in transit, hashed passwords at rest),
            regular security audits, and access controls. However, no method of transmission over the Internet
            or electronic storage is 100% secure, and we cannot guarantee absolute security.
          </p>
        </section>

        <section className="children">
          <h2>7. Children’s Privacy</h2>
          <p>
            Our service is not directed to individuals under the age of 13 (or the equivalent age of consent in your jurisdiction).
            We do not knowingly collect personal information from children. If you become aware that a child has provided us with
            personal data, please contact us, and we will take steps to delete such information.
          </p>
        </section>

        <section className="changes">
          <h2>8. Changes to This Privacy Policy</h2>
          <p>
            We may update this Privacy Policy from time to time to reflect changes in our practices or for other operational,
            legal, or regulatory reasons. We will notify you of any material changes by posting the new policy on this page
            with an updated “Effective Date.” We encourage you to review this policy periodically.
          </p>
        </section>

        <section className="contact" id="contact">
          <h2>9. Contact Us</h2>
          <p>
            If you have questions, concerns, or requests regarding this Privacy Policy or our data practices,
            please contact our Data Protection Officer (DPO) at:
          </p>
          <p className="contact-email">
            <a href="mailto:omslabs1st@gmail.com">omslabs1st@gmail.com</a>
          </p>
          
        </section>

        
      </div>
    </div>
  );
};

export default PrivacyPolicy;