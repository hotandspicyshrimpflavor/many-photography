import Navigation from '@/components/ui/Navigation';
import Footer from '@/components/ui/Footer';

const services = [
  {
    id: 'wedding',
    title: 'Wedding Photography',
    tagline: 'Your love story, told cinematically',
    description: 'From intimate elopements to grand celebrations — I capture the emotion, the chaos, the joy, and every quiet moment in between.',
    startingPrice: '$3,500',
    includes: [
      '8 hours of coverage',
      'Two photographers',
      '500+ edited images',
      'Online private gallery',
      'Web quality downloads',
      'Print quality available (add-on)',
    ],
    heroImage: '/images/services/wedding.jpg',
  },
  {
    id: 'portrait',
    title: 'Portrait Sessions',
    tagline: 'The essence of who you are',
    description: 'Individual, couples, family, or creative editorial — we craft portraits that reveal rather than simply show.',
    startingPrice: '$800',
    includes: [
      '2 hours of coverage',
      '1 location',
      '50+ edited images',
      'Online private gallery',
      'Web quality downloads',
      'Print quality available (add-on)',
    ],
    heroImage: '/images/services/portrait.jpg',
  },
  {
    id: 'commercial',
    title: 'Commercial & Brand',
    tagline: 'Your brand, elevated',
    description: 'Product photography, brand campaigns, corporate headshots, and social content that makes your brand unforgettable.',
    startingPrice: '$1,500',
    includes: [
      'Flexible hours',
      'Studio or location',
      'High-resolution files',
      'Commercial license included',
      'Rush delivery available',
      'Multiple final formats',
    ],
    heroImage: '/images/services/commercial.jpg',
  },
  {
    id: 'event',
    title: 'Event Coverage',
    tagline: 'Moments that matter',
    description: 'Corporate events, galas, launches, and private celebrations — documentary-style coverage with an artistic eye.',
    startingPrice: '$2,000',
    includes: [
      'Full event coverage',
      'Quick turnaround (48h)',
      'All edited images',
      'Online gallery',
      'Social-ready files',
      'Discount on print orders',
    ],
    heroImage: '/images/services/event.jpg',
  },
  {
    id: 'video',
    title: 'Video Production',
    tagline: 'Moving pictures, lasting memories',
    description: 'Cinematic highlight films, vows, speeches, behind-the-scenes, and social content that moves as beautifully as it looks.',
    startingPrice: '$2,500',
    includes: [
      '4K cinematic footage',
      'Professional audio',
      '2-5 minute highlight film',
      'Full speeches/vows',
      'Music licensing included',
      'Multiple aspect ratios',
    ],
    heroImage: '/images/services/video.jpg',
  },
];

export default function ServicesPage() {
  return (
    <>
      <Navigation />
      <main style={{ minHeight: '100vh', paddingTop: '80px' }}>
        {/* Hero */}
        <section style={{
          padding: 'var(--space-2xl) 0',
          textAlign: 'center',
        }}>
          <div className="container">
            <h1 style={{
              fontFamily: 'var(--font-display)',
              marginBottom: 'var(--space-md)',
            }}>
              Services & <span className="text-gradient">Pricing</span>
            </h1>
            <p style={{
              color: 'var(--color-text-secondary)',
              maxWidth: '55ch',
              margin: '0 auto',
            }}>
              Every session is tailored to your vision. These packages are starting points — let&apos;s build exactly what you need.
            </p>
          </div>
        </section>

        {/* Services */}
        {services.map((service, index) => (
          <section
            key={service.id}
            id={service.id}
            style={{
              padding: 'var(--space-2xl) 0',
              background: index % 2 === 1 ? 'var(--color-surface)' : 'transparent',
            }}
          >
            <div className="container">
              <div style={{
                display: 'grid',
                gridTemplateColumns: index % 2 === 0 ? '1fr 1fr' : '1fr 1fr',
                gap: 'var(--space-2xl)',
                alignItems: 'center',
                direction: index % 2 === 0 ? 'ltr' : 'rtl',
              }}>
                {/* Image placeholder */}
                <div style={{
                  aspectRatio: '4/3',
                  background: `linear-gradient(135deg, hsl(${index * 60 + 200}, 30%, 15%) 0%, hsl(${index * 60 + 240}, 35%, 10%) 100%)`,
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-text-muted)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.875rem',
                  direction: 'ltr',
                }}>
                  [{service.title} Hero]
                </div>

                <div style={{ direction: 'ltr' }}>
                  <span style={{
                    fontSize: '0.75rem',
                    color: 'var(--color-primary)',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                  }}>
                    {service.tagline}
                  </span>
                  <h2 style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'clamp(2rem, 4vw, 3rem)',
                    margin: 'var(--space-sm) 0 var(--space-md)',
                  }}>
                    {service.title}
                  </h2>
                  <p style={{
                    color: 'var(--color-text-secondary)',
                    marginBottom: 'var(--space-lg)',
                    lineHeight: 1.7,
                  }}>
                    {service.description}
                  </p>

                  <div style={{
                    background: 'var(--color-surface)',
                    padding: 'var(--space-lg)',
                    borderRadius: '8px',
                    marginBottom: 'var(--space-lg)',
                  }}>
                    <div style={{
                      fontSize: '0.75rem',
                      color: 'var(--color-text-muted)',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      marginBottom: 'var(--space-sm)',
                    }}>
                      Starting at
                    </div>
                    <div style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '2.5rem',
                      color: 'var(--color-primary)',
                    }}>
                      {service.startingPrice}
                    </div>
                  </div>

                  <h4 style={{
                    fontSize: '0.875rem',
                    color: 'var(--color-text-secondary)',
                    marginBottom: 'var(--space-md)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}>
                    What&apos;s Included
                  </h4>
                  <ul style={{
                    listStyle: 'none',
                    padding: 0,
                    margin: '0 0 var(--space-lg) 0',
                  }}>
                    {service.includes.map((item) => (
                      <li key={item} style={{
                        padding: 'var(--space-sm) 0',
                        borderBottom: '1px solid var(--color-border)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--space-sm)',
                        color: 'var(--color-text-secondary)',
                      }}>
                        <span style={{ color: 'var(--color-primary)' }}>✓</span>
                        {item}
                      </li>
                    ))}
                  </ul>

                  <a href="/contact" className="btn btn-primary">
                    Book This Service
                  </a>
                </div>
              </div>
            </div>
          </section>
        ))}

        {/* Custom Quote */}
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
              Need Something <span className="text-gradient">Different</span>?
            </h2>
            <p style={{
              color: 'var(--color-text-secondary)',
              maxWidth: '50ch',
              margin: '0 auto var(--space-xl)',
            }}>
              Custom packages available for multi-day shoots, destination weddings, ongoing brand partnerships, and more.
            </p>
            <a href="/contact" className="btn btn-outline">Request Custom Quote</a>
          </div>
        </section>

        {/* FAQ Preview */}
        <section style={{ padding: 'var(--space-2xl) 0' }}>
          <div className="container" style={{ maxWidth: '800px' }}>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              textAlign: 'center',
              marginBottom: 'var(--space-xl)',
            }}>
              Common <span className="text-gradient">Questions</span>
            </h2>
            {[
              {
                q: 'How far in advance should I book?',
                a: 'For weddings, 6-12 months is ideal. Portrait sessions, 2-4 weeks. I can sometimes accommodate shorter notice — just ask.',
              },
              {
                q: 'Do you travel?',
                a: 'Absolutely. Destination fees vary based on location. I have passports and an ever-growing collection of travel stories.',
              },
              {
                q: 'When will I receive my photos?',
                a: 'Wedding galleries are delivered within 6-8 weeks. Portrait sessions within 2-3 weeks. Rush delivery available.',
              },
              {
                q: 'Can I get print quality files?',
                a: 'Yes. Web quality is included in all packages. Print quality (full resolution, minimal watermark) is available as an add-on.',
              },
            ].map((faq, i) => (
              <div key={i} style={{
                marginBottom: 'var(--space-lg)',
                padding: 'var(--space-lg)',
                background: 'var(--color-surface)',
                borderRadius: '8px',
              }}>
                <h4 style={{ marginBottom: 'var(--space-sm)', color: 'var(--color-text-primary)' }}>
                  {faq.q}
                </h4>
                <p style={{ color: 'var(--color-text-secondary)', margin: 0 }}>
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
