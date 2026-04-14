'use client';

import Navigation from '@/components/ui/Navigation';
import Footer from '@/components/ui/Footer';

export default function AboutPage() {
  return (
    <>
      <Navigation />
      <main style={{ minHeight: '100vh', paddingTop: '80px' }}>
        {/* Hero */}
        <section style={{
          padding: 'var(--space-2xl) 0',
          textAlign: 'center',
          background: 'linear-gradient(180deg, var(--color-bg) 0%, var(--color-surface) 100%)',
        }}>
          <div className="container">
            <h1 style={{
              fontFamily: 'var(--font-display)',
              marginBottom: 'var(--space-lg)',
              opacity: 0,
              animation: 'fadeInUp 0.8s var(--ease-out-expo) forwards',
            }}>
              The Art of <span className="text-gradient">Moments</span>
            </h1>
            <p style={{
              fontSize: '1.25rem',
              color: 'var(--color-text-secondary)',
              maxWidth: '60ch',
              margin: '0 auto',
              opacity: 0,
              animation: 'fadeInUp 0.8s var(--ease-out-expo) 0.2s forwards',
            }}>
              Capturing the extraordinary in the ordinary — one frame at a time.
            </p>
          </div>
        </section>

        {/* Story */}
        <section style={{ padding: 'var(--space-2xl) 0' }}>
          <div className="container" style={{ maxWidth: '900px' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1.5fr',
              gap: 'var(--space-2xl)',
              alignItems: 'center',
            }}>
              {/* Photo placeholder */}
              <div style={{
                aspectRatio: '3/4',
                background: 'linear-gradient(135deg, var(--color-surface) 0%, var(--color-surface-elevated) 100%)',
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

              <div>
                <h2 style={{
                  fontFamily: 'var(--font-display)',
                  marginBottom: 'var(--space-lg)',
                }}>
                  My Story
                </h2>
                <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-md)', lineHeight: 1.8 }}>
                  I picked up my first camera at sixteen — a hand-me-down from my grandfather. It was battered, outdated, and perfect. That summer, I photographed everything: the way afternoon light fell through my mother&apos;s kitchen window, the candid laughter of cousins at a backyard barbecue, the raw emotion at my grandmother&apos;s eightieth birthday.
                </p>
                <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-md)', lineHeight: 1.8 }}>
                  What started as obsession became purpose. Today, fifteen years and hundreds of sessions later, I still chase that same feeling — the moment when everything aligns, when light and emotion and human connection collide into a single, perfect frame.
                </p>
                <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.8 }}>
                  My work has been featured in <em>Vogue</em>, <em>Harper&apos;s Bazaar</em>, and <em>Elle</em>. I&apos;ve shot from Tuscany to Tokyo, from intimate elopements to grand celebrations. But my favorite work? It&apos;s always the next story I haven&apos;t told yet.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Philosophy */}
        <section style={{
          padding: 'var(--space-2xl) 0',
          background: 'var(--color-surface)',
        }}>
          <div className="container">
            <h2 style={{
              fontFamily: 'var(--font-display)',
              textAlign: 'center',
              marginBottom: 'var(--space-xl)',
            }}>
              My <span className="text-gradient">Philosophy</span>
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 'var(--space-xl)',
            }}>
              {[
                {
                  title: 'Light First',
                  description: `I don't chase perfect locations or expensive gear. I chase light. Everything else is details.`,
                  icon: '☀️',
                },
                {
                  title: 'Moments Over Poses',
                  description: `The best photos happen when people forget there's a camera. I create space for that to occur naturally.`,
                  icon: '✨',
                },
                {
                  title: 'Cinematic Truth',
                  description: 'Every photograph should feel like a still from a film. Beauty with narrative weight.',
                  icon: '🎬',
                },
                {
                  title: 'Collaboration',
                  description: "Your vision drives this. I'm not just documenting — I'm interpreting. Together, we create something neither of us could alone.",
                  icon: '🤝',
                },
              ].map((item) => (
                <div key={item.title} style={{
                  padding: 'var(--space-xl)',
                  background: 'var(--color-bg)',
                  borderRadius: '8px',
                  textAlign: 'center',
                }}>
                  <div style={{ fontSize: '3rem', marginBottom: 'var(--space-md)' }}>{item.icon}</div>
                  <h3 style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.5rem',
                    marginBottom: 'var(--space-md)',
                  }}>
                    {item.title}
                  </h3>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9375rem' }}>
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Recognition */}
        <section style={{ padding: 'var(--space-2xl) 0', textAlign: 'center' }}>
          <div className="container">
            <h2 style={{
              fontFamily: 'var(--font-display)',
              marginBottom: 'var(--space-xl)',
            }}>
              Recognition
            </h2>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: 'var(--space-xl)',
              marginBottom: 'var(--space-xl)',
            }}>
              {['Vogue', "Harper's Bazaar", 'Elle', 'GQ', 'Vanity Fair'].map((pub) => (
                <div key={pub} style={{
                  padding: 'var(--space-md) var(--space-xl)',
                  background: 'var(--color-surface)',
                  borderRadius: '4px',
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.25rem',
                  color: 'var(--color-text-secondary)',
                }}>
                  {pub}
                </div>
              ))}
            </div>
            <p style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
              Featured in national and international publications since 2019
            </p>
          </div>
        </section>

        {/* CTA */}
        <section style={{
          padding: 'var(--space-2xl) 0',
          textAlign: 'center',
          background: 'var(--color-surface)',
        }}>
          <div className="container">
            <h2 style={{
              fontFamily: 'var(--font-display)',
              marginBottom: 'var(--space-lg)',
            }}>
              Ready to Create?
            </h2>
            <p style={{
              color: 'var(--color-text-secondary)',
              maxWidth: '50ch',
              margin: '0 auto var(--space-xl)',
            }}>
              Let&apos;s talk about your vision. Every great collaboration starts with a conversation.
            </p>
            <a href="/contact" className="btn btn-primary">Get in Touch</a>
          </div>
        </section>
      </main>
      <Footer />

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}
