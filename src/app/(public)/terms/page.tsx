import Navigation from '@/components/ui/Navigation';
import Footer from '@/components/ui/Footer';

export default function TermsPage() {
  return (
    <>
      <Navigation />
      <main style={{ minHeight: '100vh', paddingTop: '120px', paddingBottom: 'var(--space-2xl)' }}>
        <div className="container" style={{ maxWidth: '800px' }}>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            marginBottom: 'var(--space-xl)',
          }}>
            Terms of <span className="text-gradient">Service</span>
          </h1>

          <div style={{ color: 'var(--color-text-secondary)', lineHeight: 1.8 }}>
            <p style={{ marginBottom: 'var(--space-lg)' }}>
              <strong style={{ color: 'var(--color-text-primary)' }}>Last updated:</strong> April 14, 2026
            </p>

            <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-md)', marginTop: 'var(--space-xl)' }}>
              1. Agreement to Terms
            </h2>
            <p style={{ marginBottom: 'var(--space-md)' }}>
              By accessing or using Many&apos;s Photography services, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using our services.
            </p>

            <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-md)', marginTop: 'var(--space-xl)' }}>
              2. Intellectual Property Rights
            </h2>
            <p style={{ marginBottom: 'var(--space-md)' }}>
              All photographs, videos, and other content provided by Many&apos;s Photography are protected by copyright law. The following terms apply to all deliverables:
            </p>
            <ul style={{ marginLeft: 'var(--space-lg)', marginBottom: 'var(--space-md)', lineHeight: 1.8 }}>
              <li>Clients receive a <strong>personal use license</strong> for their purchased images.</li>
              <li>Web quality downloads are watermarked and intended for personal sharing on social media with attribution.</li>
              <li>Print quality files are provided after payment confirmation and include a license for personal printing.</li>
              <li><strong>Commercial use</strong> requires explicit written permission and may require additional licensing fees.</li>
              <li>Reproduction, redistribution, or sale of images to third parties is strictly prohibited.</li>
            </ul>

            <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-md)', marginTop: 'var(--space-xl)' }}>
              3. Client Responsibilities
            </h2>
            <p style={{ marginBottom: 'var(--space-md)' }}>
              Clients agree to:
            </p>
            <ul style={{ marginLeft: 'var(--space-lg)', marginBottom: 'var(--space-md)', lineHeight: 1.8 }}>
              <li>Provide accurate information during booking.</li>
              <li>Make timely payment as agreed upon.</li>
              <li>Not share access credentials (tokens) with third parties.</li>
              <li>Not attempt to remove, alter, or obscure watermarks.</li>
              <li>Not use images in any way that defames or harms Many&apos;s Photography brand.</li>
            </ul>

            <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-md)', marginTop: 'var(--space-xl)' }}>
              4. Payment & Delivery
            </h2>
            <p style={{ marginBottom: 'var(--space-md)' }}>
              Payment terms are as specified in your individual contract. Print quality files are delivered only after payment confirmation. Gallery access links expire as specified in the delivery notification (typically 30 days from first access).
            </p>

            <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-md)', marginTop: 'var(--space-xl)' }}>
              5. Cancellation & Refunds
            </h2>
            <p style={{ marginBottom: 'var(--space-md)' }}>
              Cancellations must be made in writing. Deposits are non-refundable for dates already secured. Refund policies are detailed in individual service contracts.
            </p>

            <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-md)', marginTop: 'var(--space-xl)' }}>
              6. Limitation of Liability
            </h2>
            <p style={{ marginBottom: 'var(--space-md)' }}>
              Many&apos;s Photography shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from the use or inability to use our services.
            </p>

            <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-md)', marginTop: 'var(--space-xl)' }}>
              7. Contact
            </h2>
            <p style={{ marginBottom: 'var(--space-md)' }}>
              Questions about these terms should be directed to: <a href="mailto:many@manyphotography.com" style={{ color: 'var(--color-primary)' }}>many@manyphotography.com</a>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
