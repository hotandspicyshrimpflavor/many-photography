'use client';

const testimonials = [
  {
    id: 1,
    quote: "Many captured our wedding day perfectly. Every photo tells a story. We couldn't have asked for a better photographer.",
    author: "Sarah & Michael",
    location: "Los Angeles, CA",
    service: "Wedding Photography",
  },
  {
    id: 2,
    quote: "The corporate headshots Many took for our team have gotten more compliments than our actual work. Absolutely incredible eye.",
    author: "James Chen",
    location: "San Francisco, CA",
    service: "Commercial Photography",
  },
  {
    id: 3,
    quote: "Working with Many was an artistic experience. She understood my vision and elevated it beyond what I imagined.",
    author: "Elena Rodriguez",
    location: "New York, NY",
    service: "Portrait Session",
  },
];

export default function Testimonials() {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: 'var(--space-lg)',
    }}>
      {testimonials.map((item, index) => (
        <div
          key={item.id}
          style={{
            background: 'var(--color-surface)',
            padding: 'var(--space-xl)',
            borderRadius: '4px',
            borderLeft: '3px solid var(--color-primary)',
            opacity: 0,
            animation: `fadeInUp 0.6s var(--ease-out-expo) ${index * 0.15}s forwards`,
          }}
        >
          {/* Quote Icon */}
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: '4rem',
            color: 'var(--color-primary)',
            opacity: 0.3,
            lineHeight: 1,
            marginBottom: 'var(--space-md)',
          }}>
            &ldquo;
          </div>

          <p style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.125rem',
            fontStyle: 'italic',
            color: 'var(--color-text-primary)',
            marginBottom: 'var(--space-lg)',
            lineHeight: 1.7,
          }}>
            {item.quote}
          </p>

          <div style={{
            borderTop: '1px solid var(--color-border)',
            paddingTop: 'var(--space-md)',
          }}>
            <p style={{
              fontWeight: 600,
              color: 'var(--color-text-primary)',
            }}>
              {item.author}
            </p>
            <p style={{
              fontSize: '0.875rem',
              color: 'var(--color-text-secondary)',
            }}>
              {item.location}
            </p>
            <span style={{
              display: 'inline-block',
              marginTop: 'var(--space-sm)',
              fontSize: '0.75rem',
              color: 'var(--color-primary)',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}>
              {item.service}
            </span>
          </div>
        </div>
      ))}

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
    </div>
  );
}
