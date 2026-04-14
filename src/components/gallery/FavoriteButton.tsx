'use client';

interface FavoriteButtonProps {
  isFavorite: boolean;
  onToggle: () => void;
}

export default function FavoriteButton({ isFavorite, onToggle }: FavoriteButtonProps) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      style={{
        position: 'absolute',
        top: 8,
        right: 8,
        background: isFavorite ? 'rgba(201, 168, 76, 0.95)' : 'rgba(0, 0, 0, 0.5)',
        border: 'none',
        borderRadius: '50%',
        width: 36,
        height: 36,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.25rem',
        transition: 'all 0.2s ease',
        zIndex: 10,
      }}
      aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
    >
      <span style={{
        color: isFavorite ? '#0a0a0a' : '#ffffff',
        lineHeight: 1,
      }}>
        {isFavorite ? '★' : '☆'}
      </span>
    </button>
  );
}