'use client';

import dynamic from 'next/dynamic';
import Navigation from '@/components/ui/Navigation';
import Footer from '@/components/ui/Footer';
import FeaturedWork from '@/components/gallery/FeaturedWork';
import Testimonials from '@/components/ui/Testimonials';
import Awards from '@/components/ui/Awards';

// Photos for carousel — real images loaded from /images/
const CAROUSEL_DATA = [
  {
    id: 'wedding',
    label: 'WEDDING',
    color: '#C9A84C',
    photos: [
      { id: 'w1', title: 'Bride in Gown', category: 'Wedding', url: '/images/wedding/wedding_01_bride_gown.webp' },
      { id: 'w2', title: 'First Look', category: 'Wedding', url: '/images/wedding/wedding_02_first_look.webp' },
      { id: 'w3', title: 'Wedding Rings', category: 'Wedding', url: '/images/wedding/wedding_03_wedding_rings.webp' },
      { id: 'w4', title: 'Candlelit Ceremony', category: 'Wedding', url: '/images/wedding/wedding_04_candlelit_ceremony.webp' },
      { id: 'w5', title: 'Sunset Portrait', category: 'Wedding', url: '/images/wedding/wedding_05_sunset_portrait.webp' },
      { id: 'w6', title: 'Bridal Details', category: 'Wedding', url: '/images/wedding/wedding_06_bridal_details.webp' },
      { id: 'w7', title: 'Candid Laughter', category: 'Wedding', url: '/images/wedding/wedding_07_candid_laughter.webp' },
      { id: 'w8', title: 'Grand Exit', category: 'Wedding', url: '/images/wedding/wedding_08_grand_exit.webp' },
    ],
  },
  {
    id: 'portrait',
    label: 'PORTRAIT',
    color: '#D4A5A5',
    photos: [
      { id: 'p1', title: 'Natural Light', category: 'Portrait', url: '' },
      { id: 'p2', title: 'Studio Classic', category: 'Portrait', url: '' },
      { id: 'p3', title: 'Urban Stories', category: 'Portrait', url: '' },
      { id: 'p4', title: 'Editorial', category: 'Portrait', url: '' },
      { id: 'p5', title: 'Environmental', category: 'Portrait', url: '' },
      { id: 'p6', title: 'Black & White', category: 'Portrait', url: '' },
      { id: 'p7', title: 'Creative', category: 'Portrait', url: '' },
      { id: 'p8', title: 'Headshot', category: 'Portrait', url: '' },
    ],
  },
  {
    id: 'commercial',
    label: 'COMMERCIAL',
    color: '#8A8A7A',
    photos: [
      { id: 'c1', title: 'Brand Story', category: 'Commercial', url: '' },
      { id: 'c2', title: 'Product Hero', category: 'Commercial', url: '' },
      { id: 'c3', title: 'Campaign', category: 'Commercial', url: '' },
      { id: 'c4', title: 'Behind the Scenes', category: 'Commercial', url: '' },
      { id: 'c5', title: 'Lifestyle', category: 'Commercial', url: '' },
      { id: 'c6', title: 'Corporate', category: 'Commercial', url: '' },
      { id: 'c7', title: 'Social Content', category: 'Commercial', url: '' },
      { id: 'c8', title: 'Event Coverage', category: 'Commercial', url: '' },
    ],
  },
];

// Dynamic import for Three.js component (client-side only)
const InfinityCarousel = dynamic(() => import('@/components/wheel/InfinityCarousel'), {
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
      Loading experience...
    </div>
  ),
});

export default function HomePage() {
  return (
    <main>
      <Navigation />

      {/* Hero: Infinity Carousel */}
      <section id="hero" style={{ position: 'relative' }}>
        <InfinityCarousel categories={CAROUSEL_DATA} />

        {/* Brand overlay */}
        <div style={{
          position: 'absolute',
          bottom: '120px',
          left: '50%',
          transform: 'translateX(-50%)',
          textAlign: 'center',
          zIndex: 20,
          pointerEvents: 'none',
        }}>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2rem, 6vw, 4.5rem)',
            color: 'var(--color-text-primary)',
            marginBottom: '0.5rem',
            textShadow: '0 4px 30px rgba(0, 0, 0, 0.8)',
            opacity: 0,
            animation: 'fadeInUp 1s var(--ease-out-expo) 0.5s forwards',
          }}>
            <span style={{ color: 'var(--color-primary)' }}>Many&apos;s</span> Photography
          </h1>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'clamp(0.75rem, 2vw, 1rem)',
            color: 'var(--color-text-secondary)',
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            textShadow: '0 2px 20px rgba(0, 0, 0, 0.8)',
            opacity: 0,
            animation: 'fadeInUp 1s var(--ease-out-expo) 0.8s forwards',
          }}>
            Capturing moments that become memories
          </p>
        </div>
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
            [Many&apos;s Portrait]
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

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </main>
  );
}
