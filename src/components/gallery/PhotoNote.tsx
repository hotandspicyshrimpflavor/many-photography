'use client';

import { useState } from 'react';

interface PhotoNoteProps {
  initialNote: string;
  onSave: (note: string) => void;
  onClose: () => void;
}

export default function PhotoNote({ initialNote, onSave, onClose }: PhotoNoteProps) {
  const [note, setNote] = useState(initialNote);

  const handleSave = () => {
    onSave(note);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      zIndex: 1001,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
    }}>
      <div style={{
        background: '#1a1a1a',
        borderRadius: 8,
        padding: '1.5rem',
        maxWidth: 400,
        width: '100%',
        border: '1px solid rgba(201, 168, 76, 0.3)',
      }}>
        <h3 style={{
          fontFamily: 'var(--font-display)',
          color: '#C9A84C',
          marginBottom: '1rem',
          fontSize: '1rem',
        }}>
          Add a Note
        </h3>
        <p style={{
          color: '#8A8A7A',
          fontSize: '0.75rem',
          marginBottom: '1rem',
        }}>
          e.g., "Prefer for album" or "Remove blemish on arm"
        </p>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Enter your note here..."
          maxLength={500}
          style={{
            width: '100%',
            minHeight: 100,
            padding: '0.75rem',
            background: '#0a0a0a',
            border: '1px solid rgba(201, 168, 76, 0.3)',
            borderRadius: 4,
            color: '#f5f0eb',
            fontFamily: 'inherit',
            fontSize: '0.875rem',
            resize: 'vertical',
            outline: 'none',
          }}
          autoFocus
        />
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '1rem',
        }}>
          <span style={{ color: '#5a5a4a', fontSize: '0.75rem' }}>
            {note.length}/500
          </span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={onClose}
              style={{
                padding: '0.5rem 1rem',
                background: 'transparent',
                border: '1px solid rgba(245, 240, 235, 0.2)',
                borderRadius: 4,
                color: '#8A8A7A',
                cursor: 'pointer',
                fontSize: '0.875rem',
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              style={{
                padding: '0.5rem 1rem',
                background: '#C9A84C',
                border: 'none',
                borderRadius: 4,
                color: '#0a0a0a',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.875rem',
              }}
            >
              Save Note
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}