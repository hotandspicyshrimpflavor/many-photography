'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import FavoriteButton from '@/components/gallery/FavoriteButton';
import PhotoNote from '@/components/gallery/PhotoNote';
import SelectionSummary from '@/components/gallery/SelectionSummary';

interface GalleryFile {
  id: string;
  originalFilename: string;
  thumbnailPath: string | null;
  webQualityPath: string | null;
}

interface Favorite {
  id: string;
  fileId: string;
  note: string;
  file: {
    id: string;
    thumbnailPath: string | null;
    webQualityPath: string | null;
    originalFilename: string;
  } | null;
}

export default function ClientGalleryPage() {
  const params = useParams();
  const token = decodeURIComponent(params.token as string);

  const [gallery, setGallery] = useState<{ id: string; title: string; clientName: string; expiresAt?: string } | null>(null);
  const [files, setFiles] = useState<GalleryFile[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lightboxImage, setLightboxImage] = useState<GalleryFile | null>(null);
  const [noteFileId, setNoteFileId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Fetch gallery and files
  useEffect(() => {
    async function loadGallery() {
      try {
        // Verify token
        const verifyRes = await fetch('/api/portal/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        if (!verifyRes.ok) {
          const data = await verifyRes.json();
          setError(data.error || 'Invalid token');
          setLoading(false);
          return;
        }

        const verifyData = await verifyRes.json();
        setGallery({
          id: verifyData.galleryId,
          title: verifyData.galleryTitle,
          clientName: verifyData.clientName,
          expiresAt: verifyData.expiresAt,
        });

        // TODO: Fetch files for this gallery (depends on having actual data)
        // For now, simulate with empty files — real implementation would call:
        // GET /api/gallery/:id/files
        setFiles([]);
        setLoading(false);
      } catch (err) {
        setError('Failed to load gallery');
        setLoading(false);
      }
    }

    loadGallery();
  }, [token]);

  // Load existing favorites
  const loadFavorites = useCallback(async () => {
    try {
      const res = await fetch('/api/favorites', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setFavorites(data.favorites || []);
      }
    } catch {
      // Silently fail — favorites are optional
    }
  }, [token]);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  const handleFavoriteToggle = useCallback(async (fileId: string, isFavorite: boolean) => {
    try {
      const method = isFavorite ? 'DELETE' : 'POST';
      const res = await fetch('/api/favorites', {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ fileId }),
      });

      if (res.ok) {
        await loadFavorites();
      }
    } catch {
      // Silently fail
    }
  }, [token, loadFavorites]);

  const handleNoteSave = useCallback(async (fileId: string, note: string) => {
    try {
      // Update note via POST (upsert behavior)
      await fetch('/api/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ fileId, note }),
      });
      await loadFavorites();
      setNoteFileId(null);
    } catch {
      // Silently fail
    }
  }, [token, loadFavorites]);

  const handleSubmitSelection = useCallback(async () => {
    if (favorites.length === 0) {
      alert('Please favorite at least one photo before submitting.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/selections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          favorites: favorites.map(f => ({ fileId: f.fileId, note: f.note })),
        }),
      });

      if (res.ok) {
        alert('Your selection has been submitted! We will be in touch soon.');
        setFavorites([]);
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to submit selection');
      }
    } catch {
      alert('Failed to submit selection. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }, [favorites, token]);

  const favoriteCount = favorites.length;

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a' }}>
        <p style={{ color: '#C9A84C', fontFamily: 'var(--font-display)' }}>Loading gallery...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a', padding: '2rem', textAlign: 'center' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', color: '#D4A5A5', marginBottom: '1rem' }}>Access Denied</h1>
        <p style={{ color: '#8A8A7A', marginBottom: '2rem' }}>{error}</p>
        <Link href="/portal" style={{ color: '#C9A84C' }}>← Back to login</Link>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#f5f0eb' }}>
      {/* Header */}
      <header style={{
        padding: '1.5rem 2rem',
        borderBottom: '1px solid rgba(201, 168, 76, 0.2)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'rgba(10, 10, 10, 0.95)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: '#C9A84C', marginBottom: 4 }}>
            {gallery?.title}
          </h1>
          <p style={{ fontSize: '0.75rem', color: '#8A8A7A' }}>Welcome, {gallery?.clientName}</p>
        </div>
        <Link href="/portal" style={{ color: '#8A8A7A', fontSize: '0.875rem', textDecoration: 'none' }}>
          ← Exit
        </Link>
      </header>

      {/* Selection Summary (floating) */}
      {favoriteCount > 0 && (
        <SelectionSummary
          count={favoriteCount}
          onSubmit={handleSubmitSelection}
          submitting={submitting}
        />
      )}

      {/* Instructions */}
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <p style={{ color: '#8A8A7A', fontSize: '0.875rem', maxWidth: 500, margin: '0 auto' }}>
          Tap the ★ to favorite photos you love. Add notes for specific feedback.
          When you're done, submit your selection.
        </p>
      </div>

      {/* Gallery Grid */}
      {files.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <p style={{ color: '#8A8A7A' }}>No photos in this gallery yet.</p>
          <p style={{ color: '#5a5a4a', fontSize: '0.875rem', marginTop: '0.5rem' }}>
            Check back soon — photos will appear here once uploaded.
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '1rem',
          padding: '0 2rem 4rem',
        }}>
          {files.map(file => {
            const favorite = favorites.find(f => f.fileId === file.id);
            const isFavorite = !!favorite;

            return (
              <div
                key={file.id}
                style={{
                  position: 'relative',
                  aspectRatio: '1',
                  borderRadius: 4,
                  overflow: 'hidden',
                  background: '#1a1a1a',
                  cursor: 'pointer',
                }}
                onClick={() => setLightboxImage(file)}
              >
                {/* Photo */}
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {file.thumbnailPath ? (
                    <img src={file.thumbnailPath} alt={file.originalFilename} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ color: '#5a5a4a', fontSize: '0.75rem' }}>📷</span>
                  )}
                </div>

                {/* Favorite Button */}
                <FavoriteButton
                  isFavorite={isFavorite}
                  onToggle={() => handleFavoriteToggle(file.id, isFavorite)}
                />

                {/* Note indicator */}
                {favorite?.note && (
                  <div style={{
                    position: 'absolute',
                    bottom: 8,
                    left: 8,
                    background: 'rgba(201, 168, 76, 0.9)',
                    color: '#0a0a0a',
                    fontSize: '0.625rem',
                    padding: '2px 6px',
                    borderRadius: 4,
                    fontWeight: 600,
                  }}>
                    📝
                  </div>
                )}

                {/* Add Note Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setNoteFileId(file.id);
                  }}
                  style={{
                    position: 'absolute',
                    bottom: 8,
                    right: 8,
                    background: 'rgba(0,0,0,0.6)',
                    border: 'none',
                    borderRadius: 4,
                    padding: '4px 8px',
                    color: '#f5f0eb',
                    fontSize: '0.625rem',
                    cursor: 'pointer',
                  }}
                >
                  {favorite?.note ? 'Edit note' : '+ Note'}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Note Modal */}
      {noteFileId && (
        <PhotoNote
          initialNote={favorites.find(f => f.fileId === noteFileId)?.note || ''}
          onSave={(note) => handleNoteSave(noteFileId, note)}
          onClose={() => setNoteFileId(null)}
        />
      )}

      {/* Lightbox */}
      {lightboxImage && (
        <div
          onClick={() => setLightboxImage(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.95)',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
          }}
        >
          <div style={{
            position: 'relative',
            maxWidth: '90vw',
            maxHeight: '80vh',
            aspectRatio: '3/4',
            width: '100%',
            borderRadius: 4,
            overflow: 'hidden',
          }}>
            {lightboxImage.webQualityPath ? (
              <img src={lightboxImage.webQualityPath} alt={lightboxImage.originalFilename} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            ) : (
              <div style={{ width: '100%', height: '100%', background: '#1a1a1a' }} />
            )}
          </div>
          <p style={{
            marginTop: '1.5rem',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.75rem',
            color: 'rgba(245, 240, 235, 0.5)',
          }}>
            Click anywhere to close
          </p>
        </div>
      )}
    </div>
  );
}