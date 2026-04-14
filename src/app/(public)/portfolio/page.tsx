'use client';

import Navigation from '@/components/ui/Navigation';
import Footer from '@/components/ui/Footer';
import { useState } from 'react';

const categories = [
  { id: 'all', label: 'All Work' },
  { id: 'wedding', label: 'Wedding' },
  { id: 'portrait', label: 'Portrait' },
  { id: 'commercial', label: 'Commercial' },
  { id: 'video', label: 'Video' },
  { id: 'events', label: 'Events' },
];

const portfolioItems = [
  { id: 1, title: 'Golden Hour', category: 'wedding', imageUrl: '/images/portfolio/golden-hour.jpg' },
  { id: 2, title: 'Urban Stories', category: 'portrait', imageUrl: '/images/portfolio/urban-stories.jpg' },
  { id: 3, title: 'Brand Launch', category: 'commercial', imageUrl: '/images/portfolio/brand-launch.jpg' },
  { id: 4, title: 'First Look', category: 'wedding', imageUrl: '/images/portfolio/first-look.jpg' },
  { id: 5, title: 'Natural Light', category: 'portrait', imageUrl: '/images/portfolio/natural-light.jpg' },
  { id: 6, title: 'Product Hero', category: 'commercial', imageUrl: '/images/portfolio/product-hero.jpg' },
  { id: 7, title: 'The Dance', category: 'wedding', imageUrl: '/images/portfolio/the-dance.jpg' },
  { id: 8, title: 'Editorial', category: 'portrait', imageUrl: '/images/portfolio/editorial.jpg' },
  { id: 9, title: 'Behind the Scenes', category: 'events', imageUrl: '/images/portfolio/bts.jpg' },
];

export default function PortfolioPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedImage, setSelectedImage] = useState<typeof portfolioItems[0] | null>(null);

  const filteredItems = activeCategory === 'all'
    ? portfolioItems
    : portfolioItems.filter(item => item.category === activeCategory);

  return (
    <>
      <Navigation />
      <main style={{ minHeight: '100vh', paddingTop: '80px' }}>
        {/* Hero */}
        <section style={{ padding: 'var(--space-xl) 0', textAlign: 'center' }}>
          <div className="container">
            <h1 style={{
              fontFamily: 'var(--font-display)',
              marginBottom: 'var(--space-lg)',
            }}>
              Portfolio
            </h1>

            {/* Category Filter */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: 'var(--space-sm)',
              marginBottom: 'var(--space-xl)',
            }}>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  style={{
                    padding: 'var(--space-sm) var(--space-lg)',
                    background: activeCategory === cat.id ? 'var(--color-primary)' : 'transparent',
                    color: activeCategory === cat.id ? 'var(--color-bg)' : 'var(--color-text-secondary)',
                    border: '1px solid var(--color-primary)',
                    borderRadius: '2px',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    transition: 'all var(--duration-fast)',
                  }}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Gallery Grid */}
        <section style={{ padding: '0 0 var(--space-2xl)' }}>
          <div className="container">
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
              gap: 'var(--space-md)',
            }}>
              {filteredItems.map((item, index) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedImage(item)}
                  style={{
                    position: 'relative',
                    aspectRatio: '4/3',
                    cursor: 'pointer',
                    overflow: 'hidden',
                    borderRadius: '4px',
                    opacity: 0,
                    animation: `fadeInUp 0.5s var(--ease-out-expo) ${index * 0.05}s forwards`,
                  }}
                  className="portfolio-item"
                >
                  {/* Placeholder gradient */}
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: `linear-gradient(135deg, hsl(${item.id * 40 + 200}, 30%, 15%) 0%, hsl(${item.id * 40 + 250}, 35%, 12%) 100%)`,
                  }} />

                  {/* Overlay */}
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(10, 10, 10, 0.6)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: 0,
                    transition: 'opacity var(--duration-normal)',
                  }}
                    className="portfolio-overlay"
                  >
                    <span style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '1.5rem',
                      color: 'var(--color-text-primary)',
                      textAlign: 'center',
                      padding: 'var(--space-md)',
                    }}>
                      {item.title}
                    </span>
                    <span style={{
                      fontSize: '0.75rem',
                      color: 'var(--color-primary)',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                    }}>
                      View →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Lightbox */}
        {selectedImage && (
          <div
            onClick={() => setSelectedImage(null)}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 1000,
              background: 'rgba(0, 0, 0, 0.95)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
            className="animate-fade-in"
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImage(null);
              }}
              style={{
                position: 'absolute',
                top: 'var(--space-lg)',
                right: 'var(--space-lg)',
                background: 'none',
                border: 'none',
                color: 'var(--color-text-primary)',
                cursor: 'pointer',
                fontSize: '2rem',
              }}
              aria-label="Close"
            >
              ×
            </button>
            <div style={{
              maxWidth: '85vw',
              maxHeight: '85vh',
              aspectRatio: '4/3',
              background: `linear-gradient(135deg, hsl(${selectedImage.id * 40 + 200}, 30%, 15%) 0%, hsl(${selectedImage.id * 40 + 250}, 35%, 12%) 100%)`,
              borderRadius: '4px',
            }} />
            <div style={{
              position: 'absolute',
              bottom: 'var(--space-xl)',
              textAlign: 'center',
            }}>
              <span style={{
                fontSize: '0.875rem',
                color: 'var(--color-primary)',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}>
                {selectedImage.category}
              </span>
              <h3 style={{
                fontFamily: 'var(--font-display)',
                marginTop: 'var(--space-sm)',
              }}>
                {selectedImage.title}
              </h3>
            </div>
          </div>
        )}
      </main>
      <Footer />

      <style jsx>{`
        .portfolio-item:hover .portfolio-overlay {
          opacity: 1 !important;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </>
  );
}
