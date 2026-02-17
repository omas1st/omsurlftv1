// TermsOfService.jsx (full updated version)
import React from 'react';
import './TermsOfService.css';

const TermsOfService = () => {
  return (
    <div className="terms-of-service">
      <div className="container">
        <header className="terms-header">
          <h1>Terms of Service</h1>
          <p className="effective-date">Last Updated: January 12, 2026</p>
        </header>

        <section className="intro">
          <p>
            Welcome to OmsUrl, a service provided by Omslabs. These Terms of Service ("Terms") govern your access to and use of the OmsUrl website, URL shortening service, and related tools (collectively, the "Service"). By using the Service, you agree to be bound by these Terms. If you do not agree, please do not use the Service.
          </p>
        </section>

        <section className="acceptance">
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing or using OmsUrl, you confirm that you have read, understood, and agree to be bound by these Terms, as well as our Privacy Policy, which is incorporated herein by reference. If you are using the Service on behalf of an organization, you represent that you have authority to bind that organization to these Terms.
          </p>
        </section>

        <section className="eligibility">
          <h2>2. Eligibility</h2>
          <p>
            You must be at least 13 years old (or the age of majority in your jurisdiction) to use the Service. By using the Service, you represent that you meet this requirement. If you are under 13, you may not use the Service except with the direct supervision of a parent or guardian who agrees to these Terms.
          </p>
        </section>

        <section className="account">
          <h2>3. User Accounts</h2>
          <p>
            While you can use many features of OmsUrl without an account, creating an account provides access to additional functionality (e.g., link management, detailed analytics). You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
          </p>
        </section>

        <section className="use-of-service">
          <h2>4. Use of Service</h2>
          <p>
            You are solely responsible for the content you shorten, share, or otherwise make available through the Service ("Your Content"). You retain all ownership rights to Your Content, but you grant Omslabs a non-exclusive, worldwide, royalty-free license to host, store, transmit, display, and analyze Your Content as necessary to provide and improve the Service.
          </p>
          <p>You agree to use the Service only for lawful purposes and in accordance with these Terms.</p>
        </section>

        <section className="prohibited">
          <h2>5. Prohibited Uses</h2>
          <p>You may not use the Service to:</p>
          <ul>
            <li>
              <strong>Illegal Activities:</strong> Engage in any activity that violates applicable laws or regulations, including but not limited to copyright infringement, fraud, or money laundering.
            </li>
            <li>
              <strong>Malware or Harmful Content:</strong> Distribute malware, viruses, ransomware, or any other harmful code.
            </li>
            <li>
              <strong>Phishing or Deception:</strong> Create misleading links intended to deceive users into revealing sensitive information (phishing) or to impersonate any person or entity.
            </li>
            <li>
              <strong>Spam:</strong> Use the Service to send unsolicited bulk messages, promote spam, or engage in any form of automated, excessive, or abusive linking practices.
            </li>
            <li>
              <strong>Harassment or Abuse:</strong> Promote hate speech, violence, discrimination, or harassment against individuals or groups.
            </li>
            <li>
              <strong>Interference:</strong> Attempt to disrupt, disable, or impair the Service or interfere with other users' enjoyment of the Service.
            </li>
            <li>
              <strong>Circumvention:</strong> Bypass any measures we may use to prevent or restrict access to the Service, including features that prevent or limit use or copying.
            </li>
          </ul>
        </section>

        <section className="analytics-api">
          <h2>6. Analytics & API Use</h2>
          <p>
            OmsUrl provides analytics for links created through the Service. These analytics are intended for legitimate purposes only. Automated scraping, bulk extraction, or any other unauthorized access to analytics data is strictly prohibited. If you use our API, you agree to comply with our API usage guidelines and rate limits, which may be updated from time to time.
          </p>
        </section>

        <section className="content-moderation">
          <h2>7. Content Moderation & Abuse Reporting</h2>
          <p>
            We care about the safety of our community. If you believe a link violates these Terms or our policies, please report it to <a href="mailto:omslabs1st@gmail.com">omslabs1st@gmail.com</a>. We review reports and may remove or disable access to any content that we determine, in our sole discretion, violates these Terms or is otherwise objectionable.
          </p>
        </section>

        <section className="suspension">
          <h2>8. Account Suspension & Termination</h2>
          <p>
            We reserve the right to suspend, disable, or terminate any user's access to the Service, with or without notice, if we believe the user has violated these Terms or engaged in abusive activity. Grounds for suspension or termination include, but are not limited to:
          </p>
          <ul>
            <li>Creating links to illegal or harmful content.</li>
            <li>Engaging in spam or phishing.</li>
            <li>Attempting to compromise the security or integrity of the Service.</li>
            <li>Repeated infringement of intellectual property rights.</li>
          </ul>
          <p>
            If your account is terminated, you lose access to any links, analytics, or data associated with your account. We are not obligated to retain or provide you with copies of such data after termination.
          </p>
        </section>

        <section className="intellectual-property">
          <h2>9. Intellectual Property Rights</h2>
          <p>
            <strong>Omslabs' Rights:</strong> The Service, including its code, design, logos, and original content, is owned by Omslabs and protected by copyright, trademark, and other intellectual property laws. You may not copy, modify, distribute, sell, or lease any part of the Service without our prior written consent.
          </p>
          <p>
            <strong>Your Rights:</strong> You retain ownership of Your Content. By submitting Your Content, you grant Omslabs the license described in Section 4 to enable us to operate the Service. This license continues even if you stop using the Service, solely to the extent necessary to fulfill our obligations (e.g., serving existing shortened links).
          </p>
          <p>
            <strong>DMCA Compliance:</strong> We respect copyright laws. If you believe content on OmsUrl infringes your copyright, please provide us with a DMCA notice at <a href="mailto:omslabs1st@gmail.com">omslabs1st@gmail.com</a> including:
          </p>
          <ul>
            <li>Identification of the copyrighted work claimed to have been infringed.</li>
            <li>Identification of the material that is claimed to be infringing, with enough detail for us to locate it.</li>
            <li>Your contact information (address, phone, email).</li>
            <li>A statement that you have a good faith belief that the use is not authorized.</li>
            <li>A statement, under penalty of perjury, that the information in the notification is accurate and that you are authorized to act on behalf of the owner.</li>
            <li>Your physical or electronic signature.</li>
          </ul>
        </section>

        {/* Updated Free Service Section */}
        <section className="free-service">
          <h2>10. Free Service & Future Premium Features</h2>
          <p>
            OmsUrl is currently provided completely free of charge. No payment is required to access or use any part of the Service. Omslabs does not process payments, subscriptions, or financial transactions of any kind through the Service at this time.
          </p>
          <p>
            In the future, Omslabs may introduce a premium version of the Service that offers additional features beyond those available in the free version. If such a premium version is launched, <strong>all features that are currently available for free will remain free of charge</strong>. Any premium features will be clearly identified, and you will have the option to upgrade if you wish. Omslabs will provide notice before implementing any paid tiers.
          </p>
          <p>
            You acknowledge that the Service is offered on a gratis basis for now and that Omslabs has no obligation to provide paid features or support.
          </p>
        </section>

        <section className="liability">
          <h2>11. Disclaimer of Warranties</h2>
          <p>
            THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. TO THE FULLEST EXTENT PERMITTED BY LAW, OMSLABS DISCLAIMS ALL WARRANTIES, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, SECURE, OR FREE FROM VIRUSES OR OTHER HARMFUL COMPONENTS.
          </p>
        </section>

        <section className="limitation">
          <h2>12. Limitation of Liability</h2>
          <p>
            TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL OMSLABS, ITS AFFILIATES, OFFICERS, EMPLOYEES, AGENTS, OR LICENSORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS, REVENUES, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM (i) YOUR USE OR INABILITY TO USE THE SERVICE; (ii) ANY CONDUCT OR CONTENT OF ANY THIRD PARTY ON THE SERVICE; (iii) UNAUTHORIZED ACCESS, USE, OR ALTERATION OF YOUR CONTENT; OR (iv) ANY OTHER MATTER RELATED TO THE SERVICE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES. YOUR SOLE REMEDY IS TO DISCONTINUE USING THE SERVICE.
          </p>
        </section>

        <section className="indemnification">
          <h2>13. Indemnification</h2>
          <p>
            You agree to defend, indemnify, and hold harmless Omslabs and its employees, contractors, and affiliates from any claims, damages, losses, liabilities, costs, and expenses (including reasonable attorneys' fees) arising out of or related to: (i) your use of the Service; (ii) Your Content; (iii) your violation of these Terms; or (iv) your violation of any third-party rights, including intellectual property or privacy rights.
          </p>
        </section>

      
        <section className="changes">
          <h2>14. Changes to Terms</h2>
          <p>
            We may revise these Terms from time to time. If we make material changes, we will notify you by posting the updated Terms on this page and updating the "Last Updated" date. Your continued use of the Service after the effective date of the revised Terms constitutes your acceptance of the changes. If you do not agree to the new Terms, you must stop using the Service.
          </p>
        </section>

        <section className="severability">
          <h2>15. Severability</h2>
          <p>
            If any provision of these Terms is found to be unenforceable or invalid, that provision shall be limited or eliminated to the minimum extent necessary so that the remaining Terms remain in full force and effect.
          </p>
        </section>

        <section className="entire-agreement">
          <h2>16. Entire Agreement</h2>
          <p>
            These Terms, together with the Privacy Policy and any other legal notices published by Omslabs, constitute the entire agreement between you and Omslabs regarding the Service and supersede any prior agreements.
          </p>
        </section>

        <section className="contact">
          <h2>17. Contact Information</h2>
          <p>
            If you have questions about these Terms, please contact us at:
          </p>
          <div className="contact-details">
            <p>
              <strong>Email:</strong> <a href="mailto:omslabs1st@gmail.com">omslabs1st@gmail.com</a>
            </p>
            <p>
              <strong>Omslabs</strong>
            </p>
          </div>
        </section>

       
      </div>
    </div>
  );
};

export default TermsOfService;