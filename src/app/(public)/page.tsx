import dynamic from 'next/dynamic';
import Navigation from '@/components/ui/Navigation';
import Footer from '@/components/ui/Footer';
import FeaturedWork from '@/components/gallery/FeaturedWork';
import Testimonials from '@/components/ui/Testimonials';
import Awards from '@/components/ui/Awards';

// Dynamic import for Three.js component (client-side only)
const SpinningWheel = dynamic(() => import('@/components/wheel/SpinningWheel'), {
  ssr: false,
  loading: () => (
    <div style={{
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0a0a0a',
      color: '#C9A84C',
      fontFamily: 'var(--font-display)',
      fontSize: '1.5rem',
    }}>
      Loading...
    </div>
  ),
});

export default function HomePage() {
  return (
    <main>
      <Navigation />

      {/* Hero: Spinning Wheel */}
      <section id="hero">
        <SpinningWheel />
      </section>

      {/* Featured Work */}
      <section id="featured" style={{ padding: 'var(--space-2xl) 0' }}>
        <div className="container">
          <h2 style={{
            fontFamily: 'var(--font-display)',
            textAlign: 'center',
            marginBottom: 'var(--space-xl)',
            opacity: 0,
            animation: 'fadeInUp 0.8s var(--ease-out-expo) 0.2s forwards',
          }}>
            Featured <span className="text-gradient">Work</span>
          </h2>
          <FeaturedWork />
        </div>
      </section>

      {/* About Preview */}
      <section id="about" style={{
        padding: 'var(--space-2xl) 0',
        background: 'var(--color-surface)',
      }}>
        <div className="container" style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 'var(--space-xl)',
          alignItems: 'center',
        }}>
          <div style={{ opacity: 0, animation: 'fadeInUp 0.8s var(--ease-out-expo) 0.3s forwards' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: 'var(--space-lg)' }}>
              The Art of <span className="text-gradient">Moments</span>
            </h3>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-lg)' }}>
              With over a decade of experience capturing life&apos;s most precious moments,
              Many brings a cinematic vision to every frame. From intimate portraits to
              grand celebrations, each photograph tells a story.
            </p>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-lg)' }}>
              Based in Los Angeles, available worldwide. Every session is a collaboration
              — together, we create timeless art.
            </p>
            <a href="/about" className="btn btn-outline">Learn More</a>
          </div>
          <div style={{
            aspectRatio: '4/5',
            background: 'linear-gradient(135deg, var(--color-surface-elevated) 0%, var(--color-surface) 100%)',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-text-muted)',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.875rem',
          }}>
            [Many's Portrait]
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" style={{ padding: 'var(--space-2xl) 0' }}>
        <div className="container">
          <h2 style={{
            fontFamily: 'var(--font-display)',
            textAlign: 'center',
            marginBottom: 'var(--space-xl)',
          }}>
            Client <span className="text-gradient">Stories</span>
          </h2>
          <Testimonials />
        </div>
      </section>

      {/* Awards */}
      <section id="awards" style={{
        padding: 'var(--space-xl) 0',
        background: 'var(--color-surface)',
      }}>
        <div className="container">
          <Awards />
        </div>
      </section>

      {/* CTA */}
      <section style={{
        padding: 'var(--space-2xl) 0',
        textAlign: 'center',
      }}>
        <div className="container">
          <h2 style={{
            fontFamily: 'var(--font-display)',
            marginBottom: 'var(--space-lg)',
          }}>
            Let&apos;s Create <span className="text-gradient">Together</span>
          </h2>
          <p style={{
            color: 'var(--color-text-secondary)',
            maxWidth: '50ch',
            margin: '0 auto var(--space-xl)',
          }}>
            Ready to capture your story? Let&apos;s discuss your vision.
          </p>
          <a href="/contact" className="btn btn-primary">Book a Session</a>
        </div>
      </section>

      <Footer />
    </main>
  );
}
