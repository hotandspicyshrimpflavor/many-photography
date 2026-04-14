import Navigation from '@/components/ui/Navigation';
import Footer from '@/components/ui/Footer';

export default function PrivacyPage() {
  return (
    <>
      <Navigation />
      <main style={{ minHeight: '100vh', paddingTop: '120px', paddingBottom: 'var(--space-2xl)' }}>
        <div className="container" style={{ maxWidth: '800px' }}>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            marginBottom: 'var(--space-xl)',
          }}>
            Privacy <span className="text-gradient">Policy</span>
          </h1>

          <div style={{ color: 'var(--color-text-secondary)', lineHeight: 1.8 }}>
            <p style={{ marginBottom: 'var(--space-lg)' }}>
              <strong style={{ color: 'var(--color-text-primary)' }}>Last updated:</strong> April 14, 2026
            </p>

            <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-md)', marginTop: 'var(--space-xl)' }}>
              1. Information We Collect
            </h2>
            <p style={{ marginBottom: 'var(--space-md)' }}>
              We collect information you provide directly to us, including:
            </p>
            <ul style={{ marginLeft: 'var(--space-lg)', marginBottom: 'var(--space-md)', lineHeight: 1.8 }}>
              <li>Contact information (name, email address, phone number)</li>
              <li>Booking information (event details, dates, locations)</li>
              <li>Payment information (processed securely via third-party payment providers)</li>
              <li>Client gallery access logs (IP addresses, access times)</li>
            </ul>

            <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-md)', marginTop: 'var(--space-xl)' }}>
              2. How We Use Your Information
            </h2>
            <p style={{ marginBottom: 'var(--space-md)' }}>
              We use the information we collect to:
            </p>
            <ul style={{ marginLeft: 'var(--space-lg)', marginBottom: 'var(--space-md)', lineHeight: 1.8 }}>
              <li>Provide and deliver photography services</li>
              <li>Create and manage your client portal</li>
              <li>Send transactional emails (gallery links, delivery notifications)</li>
              <li>Respond to your inquiries and support requests</li>
              <li>Comply with legal obligations</li>
            </ul>

            <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-md)', marginTop: 'var(--space-xl)' }}>
              3. Information Sharing
            </h2>
            <p style={{ marginBottom: 'var(--space-md)' }}>
              We do not sell, trade, or rent your personal information to third parties. We may share information only in the following circumstances:
            </p>
            <ul style={{ marginLeft: 'var(--space-lg)', marginBottom: 'var(--space-md)', lineHeight: 1.8 }}>
              <li>With service providers who assist in our operations (email delivery, payment processing)</li>
              <li>When required by law, court order, or governmental authority</li>
              <li>To protect our rights, privacy, safety, or property</li>
            </ul>

            <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-md)', marginTop: 'var(--space-xl)' }}>
              4. Data Retention
            </h2>
            <p style={{ marginBottom: 'var(--space-md)' }}>
              We retain your personal information for as long as necessary to provide services and for legitimate business purposes. Download logs are retained for a minimum of 2 years for legal and security purposes.
            </p>

            <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-md)', marginTop: 'var(--space-xl)' }}>
              5. Data Security
            </h2>
            <p style={{ marginBottom: 'var(--space-md)' }}>
              We implement appropriate technical and organizational measures to protect your personal information, including encryption, secure servers, and access controls. However, no method of transmission over the Internet is 100% secure.
            </p>

            <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-md)', marginTop: 'var(--space-xl)' }}>
              6. Your Rights
            </h2>
            <p style={{ marginBottom: 'var(--space-md)' }}>
              You have the right to:
            </p>
            <ul style={{ marginLeft: 'var(--space-lg)', marginBottom: 'var(--space-md)', lineHeight: 1.8 }}>
              <li>Access the personal information we hold about you</li>
              <li>Request correction of inaccurate information</li>
              <li>Request deletion of your personal information (subject to legal requirements)</li>
              <li>Opt out of marketing communications at any time</li>
            </ul>

            <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-md)', marginTop: 'var(--space-xl)' }}>
              7. Cookies
            </h2>
            <p style={{ marginBottom: 'var(--space-md)' }}>
              We use cookies and similar technologies to operate our website and services. Essential cookies are required for the site to function. Analytics cookies help us understand how visitors use our site.
            </p>

            <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-md)', marginTop: 'var(--space-xl)' }}>
              8. Children&apos;s Privacy
            </h2>
            <p style={{ marginBottom: 'var(--space-md)' }}>
              Our services are not directed to individuals under 18. We do not knowingly collect personal information from children.
            </p>

            <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-md)', marginTop: 'var(--space-xl)' }}>
              9. Changes to This Policy
            </h2>
            <p style={{ marginBottom: 'var(--space-md)' }}>
              We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the &quot;Last updated&quot; date.
            </p>

            <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-md)', marginTop: 'var(--space-xl)' }}>
              10. Contact
            </h2>
            <p style={{ marginBottom: 'var(--space-md)' }}>
              If you have any questions about this privacy policy, please contact us at: <a href="mailto:many@manyphotography.com" style={{ color: 'var(--color-primary)' }}>many@manyphotography.com</a>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
