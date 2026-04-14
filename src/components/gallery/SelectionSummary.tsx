'use client';

interface SelectionSummaryProps {
  count: number;
  onSubmit: () => void;
  submitting: boolean;
}

export default function SelectionSummary({ count, onSubmit, submitting }: SelectionSummaryProps) {
  return (
    <div style={{
      position: 'fixed',
      bottom: 24,
      left: '50%',
      transform: 'translateX(-50%)',
      background: '#1a1a1a',
      border: '1px solid rgba(201, 168, 76, 0.4)',
      borderRadius: 12,
      padding: '1rem 1.5rem',
      display: 'flex',
      alignItems: 'center',
      gap: '1.5rem',
      zIndex: 50,
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
      }}>
        <span style={{ fontSize: '1.5rem', color: '#C9A84C' }}>★</span>
        <span style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.25rem',
          color: '#f5f0eb',
        }}>
          {count} photo{count !== 1 ? 's' : ''} selected
        </span>
      </div>

      <button
        onClick={onSubmit}
        disabled={submitting}
        style={{
          background: '#C9A84C',
          border: 'none',
          borderRadius: 6,
          padding: '0.625rem 1.25rem',
          color: '#0a0a0a',
          fontWeight: 600,
          fontSize: '0.875rem',
          cursor: submitting ? 'not-allowed' : 'pointer',
          opacity: submitting ? 0.6 : 1,
          transition: 'opacity 0.2s',
        }}
      >
        {submitting ? 'Submitting...' : 'Submit Selection'}
      </button>
    </div>
  );
}