'use client';

export default function Awards() {
  const awards = [
    {
      name: 'Awwwards',
      description: 'Site of the Day',
      year: '2024',
      badge: 'SOTD',
    },
    {
      name: 'CSS Design Awards',
      description: 'Outstanding Achievement',
      year: '2024',
      badge: 'UCD',
    },
    {
      name: 'The Photography Awards',
      description: 'Best Wedding Photographer',
      year: '2023',
      badge: 'Winner',
    },
  ];

  return (
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: 'var(--space-xl)',
      padding: 'var(--space-lg) 0',
    }}>
      {awards.map((award) => (
        <div
          key={award.name}
          style={{
            textAlign: 'center',
            opacity: 0,
            animation: 'fadeIn 0.8s var(--ease-out-expo) forwards',
          }}
        >
          {/* Badge Circle */}
          <div style={{
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            border: '2px solid var(--color-primary)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto var(--space-md)',
            background: 'linear-gradient(135deg, var(--color-surface) 0%, var(--color-surface-elevated) 100%)',
            boxShadow: '0 0 30px rgba(201, 168, 76, 0.1)',
          }}>
            <span style={{
              fontSize: '0.625rem',
              color: 'var(--color-primary)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}>
              {award.year}
            </span>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.25rem',
              color: 'var(--color-text-primary)',
              fontWeight: 600,
            }}>
              {award.badge}
            </span>
          </div>

          <h4 style={{
            fontFamily: 'var(--font-display)',
            color: 'var(--color-text-primary)',
            marginBottom: 'var(--space-xs)',
          }}>
            {award.name}
          </h4>
          <p style={{
            fontSize: '0.875rem',
            color: 'var(--color-text-secondary)',
          }}>
            {award.description}
          </p>
        </div>
      ))}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
