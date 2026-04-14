'use client';

import { useState } from 'react';

const featuredWork = [
  { id: 1, title: 'Golden Hour', category: 'Wedding', imageUrl: '/images/featured/golden-hour.jpg' },
  { id: 2, title: 'Urban Light', category: 'Portrait', imageUrl: '/images/featured/urban-light.jpg' },
  { id: 3, title: 'Brand Story', category: 'Commercial', imageUrl: '/images/featured/brand-story.jpg' },
  { id: 4, title: 'First Dance', category: 'Wedding', imageUrl: '/images/featured/first-dance.jpg' },
  { id: 5, title: 'Natural Beauty', category: 'Portrait', imageUrl: '/images/featured/natural-beauty.jpg' },
  { id: 6, title: 'Product Launch', category: 'Commercial', imageUrl: '/images/featured/product-launch.jpg' },
];

export default function FeaturedWork() {
  const [selectedImage, setSelectedImage] = useState<typeof featuredWork[0] | null>(null);

  return (
    <>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: 'var(--space-md)',
      }}>
        {featuredWork.map((item, index) => (
          <div
            key={item.id}
            onClick={() => setSelectedImage(item)}
            style={{
              position: 'relative',
              aspectRatio: '4/5',
              cursor: 'pointer',
              overflow: 'hidden',
              borderRadius: '4px',
              opacity: 0,
              animation: `fadeInUp 0.6s var(--ease-out-expo) ${index * 0.1}s forwards`,
            }}
            className="featured-item"
          >
            {/* Placeholder gradient background */}
            <div style={{
              position: 'absolute',
              inset: 0,
              background: `linear-gradient(135deg,
                hsl(${index * 60}, 30%, 20%) 0%,
                hsl(${index * 60 + 30}, 40%, 15%) 100%)`,
            }} />

            {/* Overlay on hover */}
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(10, 10, 10, 0.7)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              padding: 'var(--space-lg)',
              opacity: 0,
              transition: 'opacity var(--duration-normal)',
            }}
              className="featured-overlay"
            >
              <span style={{
                fontSize: '0.75rem',
                color: 'var(--color-primary)',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: 'var(--space-xs)',
              }}>
                {item.category}
              </span>
              <h4 style={{
                fontFamily: 'var(--font-display)',
                color: 'var(--color-text-primary)',
              }}>
                {item.title}
              </h4>
            </div>
          </div>
        ))}
      </div>

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
            maxWidth: '80vw',
            maxHeight: '80vh',
            aspectRatio: '4/5',
            background: `linear-gradient(135deg,
              hsl(${featuredWork.indexOf(selectedImage) * 60}, 30%, 20%) 0%,
              hsl(${featuredWork.indexOf(selectedImage) * 60 + 30}, 40%, 15%) 100%)`,
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

      <style jsx>{`
        .featured-item:hover .featured-overlay {
          opacity: 1 !important;
        }

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
