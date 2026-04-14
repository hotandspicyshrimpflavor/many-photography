'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { applyClientWatermark, createWatermarkPreview } from '@/lib/client-watermark';

interface UploadedFile {
  id: string;
  file: File;
  preview: string;
  status: 'pending' | 'watermarking' | 'ready' | 'uploading' | 'done' | 'error';
  progress: number;
  error?: string;
}

interface Client {
  id: string;
  fullName: string;
  email: string;
}

interface Gallery {
  id: string;
  title: string;
  sessionDate: string;
  clientName: string;
  token: string;
  expiresAt?: string;
}

export default function AdminDashboard() {
  const [clients, setClients] = useState<Client[]>([]);
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [galleryTitle, setGalleryTitle] = useState('');
  const [sessionDate, setSessionDate] = useState('');
  const [token, setToken] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [activeTab, setActiveTab] = useState<'clients' | 'upload' | 'galleries' | 'selections'>('clients');
  const [watermarkPreview, setWatermarkPreview] = useState<string | null>(null);
  const [watermarkOptions, setWatermarkOptions] = useState({
    position: 'corner' as 'corner' | 'center' | 'tiled',
    corner: 'br' as 'br' | 'bl' | 'tr' | 'tl',
    opacity: 0.4,
    text: "© Many's Photography",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection with drag-and-drop
  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newFiles: UploadedFile[] = Array.from(files)
      .filter(f => f.type.startsWith('image/'))
      .map((file) => ({
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        file,
        preview: URL.createObjectURL(file),
        status: 'pending' as const,
        progress: 0,
      }));

    setUploadedFiles(prev => [...prev, ...newFiles]);

    // Auto-generate watermark preview from first image
    if (newFiles.length > 0 && !watermarkPreview) {
      try {
        const preview = await createWatermarkPreview(newFiles[0].file, {
          ...watermarkOptions,
        });
        setWatermarkPreview(preview);
      } catch (e) {
        console.error('Failed to create preview:', e);
      }
    }
  }, [watermarkPreview, watermarkOptions]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const updateFileStatus = useCallback((id: string, updates: Partial<UploadedFile>) => {
    setUploadedFiles(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
  }, []);

  // Process files: watermark then prepare for upload
  const processFiles = useCallback(async () => {
    const pending = uploadedFiles.filter(f => f.status === 'pending');
    
    for (const file of pending) {
      updateFileStatus(file.id, { status: 'watermarking', progress: 10 });

      try {
        // Apply client-side watermark
        const watermarkedBlob = await applyClientWatermark(file.file, {
          ...watermarkOptions,
          position: watermarkOptions.position === 'corner' ? 'corner' : watermarkOptions.position,
          corner: watermarkOptions.position === 'corner' ? watermarkOptions.corner : undefined,
        });

        // Create preview of watermarked version
        updateFileStatus(file.id, { progress: 70 });
        const watermarkedPreview = URL.createObjectURL(watermarkedBlob);
        
        updateFileStatus(file.id, { 
          status: 'ready', 
          progress: 100,
          preview: watermarkedPreview,
        });
      } catch (err) {
        updateFileStatus(file.id, { 
          status: 'error', 
          error: err instanceof Error ? err.message : 'Watermarking failed' 
        });
      }
    }
  }, [uploadedFiles, watermarkOptions, updateFileStatus]);

  // Update watermark preview on option change
  const updatePreview = useCallback(async () => {
    const firstFile = uploadedFiles[0];
    if (!firstFile) return;

    try {
      const preview = await createWatermarkPreview(firstFile.file, {
        ...watermarkOptions,
        position: watermarkOptions.position === 'corner' ? 'corner' : watermarkOptions.position,
        corner: watermarkOptions.position === 'corner' ? watermarkOptions.corner : undefined,
      });
      setWatermarkPreview(preview);
    } catch (e) {
      console.error('Preview update failed:', e);
    }
  }, [uploadedFiles, watermarkOptions]);

  const removeFile = useCallback((id: string) => {
    setUploadedFiles(prev => {
      const file = prev.find(f => f.id === id);
      if (file) URL.revokeObjectURL(file.preview);
      return prev.filter(f => f.id !== id);
    });
  }, []);

  const readyFiles = uploadedFiles.filter(f => f.status === 'ready');

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--color-bg)',
      color: 'var(--color-text-primary)',
    }}>
      {/* Header */}
      <header style={{
        padding: 'var(--space-lg) var(--space-xl)',
        borderBottom: '1px solid var(--color-border)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'var(--color-surface)',
      }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', marginBottom: 4 }}>
            <span style={{ color: 'var(--color-primary)' }}>Many&apos;s</span> Photography
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
            Admin Dashboard
          </p>
        </div>
        <Link 
          href="/" 
          style={{ 
            color: 'var(--color-text-secondary)', 
            fontSize: '0.875rem',
            textDecoration: 'none',
          }}
        >
          ← Back to site
        </Link>
      </header>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid var(--color-border)',
        background: 'var(--color-surface)',
        padding: '0 var(--space-xl)',
      }}>
        {(['clients', 'upload', 'galleries', 'selections'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: 'var(--space-md) var(--space-lg)',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === tab ? '2px solid var(--color-primary)' : '2px solid transparent',
              color: activeTab === tab ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              cursor: 'pointer',
              fontFamily: 'var(--font-body)',
              fontSize: '0.875rem',
              textTransform: 'capitalize',
              transition: 'all 0.2s',
            }}
          >
            {tab === 'clients' ? 'Clients & Galleries' : tab === 'upload' ? 'Upload Gallery' : tab === 'galleries' ? 'Manage Galleries' : 'Selections'}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: 'var(--space-xl)' }}>

        {/* Clients & Galleries Tab */}
        {activeTab === 'clients' && (
          <div style={{ maxWidth: 800 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', marginBottom: 'var(--space-xl)' }}>
              Create Client & Gallery
            </h2>
            
            <form style={{
              background: 'var(--color-surface)',
              padding: 'var(--space-xl)',
              borderRadius: 8,
              marginBottom: 'var(--space-xl)',
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-lg)', marginBottom: 'var(--space-lg)' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 4, fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                    Client Name
                  </label>
                  <input
                    type="text"
                    value={selectedClient}
                    onChange={e => setSelectedClient(e.target.value)}
                    placeholder="e.g., Sarah & Michael"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 4, fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                    Client Email
                  </label>
                  <input
                    type="email"
                    placeholder="client@example.com"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 4, fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                    Gallery Title
                  </label>
                  <input
                    type="text"
                    value={galleryTitle}
                    onChange={e => setGalleryTitle(e.target.value)}
                    placeholder="e.g., Wedding Day"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 4, fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                    Session Date
                  </label>
                  <input
                    type="date"
                    value={sessionDate}
                    onChange={e => setSessionDate(e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 4, fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                    Client Token
                  </label>
                  <input
                    type="text"
                    value={token}
                    onChange={e => setToken(e.target.value)}
                    placeholder="SARAH MICHAEL-2024-06-15"
                    style={{ ...inputStyle, fontFamily: 'var(--font-mono)' }}
                  />
                  <p style={{ marginTop: 4, fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                    Format: NAME-YYYY-MM-DD
                  </p>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 4, fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                    Expiration Date
                  </label>
                  <input
                    type="date"
                    value={expiresAt}
                    onChange={e => setExpiresAt(e.target.value)}
                    style={inputStyle}
                  />
                </div>
              </div>
              <button
                type="button"
                className="btn btn-primary"
                style={{ opacity: !selectedClient || !galleryTitle || !token ? 0.5 : 1 }}
                disabled={!selectedClient || !galleryTitle || !token}
              >
                Create Gallery & Send Token
              </button>
            </form>

            {/* Existing Galleries */}
            <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: 'var(--space-md)' }}>
              Recent Galleries
            </h3>
            {galleries.length === 0 ? (
              <p style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                No galleries created yet.
              </p>
            ) : (
              <div style={{ display: 'grid', gap: 'var(--space-md)' }}>
                {galleries.map(g => (
                  <div key={g.id} style={{
                    background: 'var(--color-surface)',
                    padding: 'var(--space-lg)',
                    borderRadius: 8,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                    <div>
                      <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>{g.title}</p>
                      <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                        {g.clientName} · {g.sessionDate}
                      </p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
                        Token: {g.token}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      {g.expiresAt && (
                        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                          Expires: {new Date(g.expiresAt).toLocaleDateString()}
                        </p>
                      )}
                      <button className="btn btn-outline" style={{ marginTop: 4, fontSize: '0.75rem', padding: '4px 12px' }}>
                        View
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Upload Tab */}
        {activeTab === 'upload' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 'var(--space-xl)' }}>
            {/* Drop Zone */}
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', marginBottom: 'var(--space-md)' }}>
                Upload Photos
              </h2>
              <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-lg)', fontSize: '0.875rem' }}>
                Drag and drop images or click to select. Watermarks are applied client-side before upload — originals never leave your device.
              </p>

              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: '2px dashed var(--color-border)',
                  borderRadius: 8,
                  padding: 'var(--space-2xl)',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  background: 'var(--color-surface)',
                }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={e => handleFiles(e.target.files)}
                  style={{ display: 'none' }}
                />
                <p style={{ fontSize: '3rem', marginBottom: 'var(--space-md)' }}>📷</p>
                <p style={{ color: 'var(--color-text-secondary)' }}>
                  Drop photos here or click to browse
                </p>
              </div>

              {/* File List */}
              {uploadedFiles.length > 0 && (
                <div style={{ marginTop: 'var(--space-xl)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem' }}>
                      {uploadedFiles.length} file{uploadedFiles.length !== 1 ? 's' : ''} selected
                    </h3>
                    {uploadedFiles.some(f => f.status === 'pending') && (
                      <button
                        onClick={processFiles}
                        className="btn btn-primary"
                        style={{ fontSize: '0.875rem' }}
                      >
                        Apply Watermark to All
                      </button>
                    )}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 'var(--space-md)' }}>
                    {uploadedFiles.map(file => (
                      <div key={file.id} style={{
                        position: 'relative',
                        aspectRatio: '1',
                        borderRadius: 4,
                        overflow: 'hidden',
                        background: 'var(--color-surface)',
                        border: '1px solid var(--color-border)',
                      }}>
                        <img
                          src={file.preview}
                          alt=""
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        
                        {/* Status overlay */}
                        {file.status === 'watermarking' && (
                          <div style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'rgba(0,0,0,0.7)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.75rem',
                            color: 'var(--color-primary)',
                          }}>
                            Applying...
                          </div>
                        )}
                        {file.status === 'ready' && (
                          <div style={{
                            position: 'absolute',
                            top: 4,
                            right: 4,
                            background: 'var(--color-primary)',
                            color: 'var(--color-bg)',
                            borderRadius: '50%',
                            width: 20,
                            height: 20,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.625rem',
                          }}>
                            ✓
                          </div>
                        )}
                        {file.status === 'error' && (
                          <div style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'rgba(200,50,50,0.8)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.75rem',
                            color: 'white',
                            padding: 4,
                            textAlign: 'center',
                          }}>
                            {file.error}
                          </div>
                        )}

                        {/* Remove button */}
                        <button
                          onClick={() => removeFile(file.id)}
                          style={{
                            position: 'absolute',
                            top: 4,
                            left: 4,
                            background: 'rgba(0,0,0,0.6)',
                            border: 'none',
                            borderRadius: '50%',
                            width: 20,
                            height: 20,
                            color: 'white',
                            cursor: 'pointer',
                            fontSize: '0.625rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Upload Action */}
                  {readyFiles.length > 0 && (
                    <div style={{
                      marginTop: 'var(--space-xl)',
                      padding: 'var(--space-lg)',
                      background: 'var(--color-surface)',
                      borderRadius: 8,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}>
                      <div>
                        <p style={{ fontWeight: 600 }}>{readyFiles.length} watermarked photos ready</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                          Client-side watermark applied. Select a gallery below to upload.
                        </p>
                      </div>
                      <button className="btn btn-primary">
                        Upload to Gallery →
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Watermark Controls */}
            <div style={{
              background: 'var(--color-surface)',
              padding: 'var(--space-lg)',
              borderRadius: 8,
              height: 'fit-content',
            }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', marginBottom: 'var(--space-md)' }}>
                Watermark Settings
              </h3>

              {/* Live Preview */}
              {watermarkPreview && (
                <div style={{
                  aspectRatio: '3/4',
                  borderRadius: 4,
                  overflow: 'hidden',
                  marginBottom: 'var(--space-lg)',
                  background: '#0d0b09',
                }}>
                  <img
                    src={watermarkPreview}
                    alt="Watermark preview"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 4, fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                    Text
                  </label>
                  <input
                    type="text"
                    value={watermarkOptions.text}
                    onChange={e => {
                      setWatermarkOptions(prev => ({ ...prev, text: e.target.value }));
                      setTimeout(updatePreview, 100);
                    }}
                    style={{ ...inputStyle, fontSize: '0.875rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: 4, fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                    Position
                  </label>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {(['corner', 'center', 'tiled'] as const).map(pos => (
                      <button
                        key={pos}
                        onClick={() => {
                          setWatermarkOptions(prev => ({ ...prev, position: pos }));
                          setTimeout(updatePreview, 100);
                        }}
                        style={{
                          flex: 1,
                          padding: '6px 8px',
                          background: watermarkOptions.position === pos ? 'var(--color-primary)' : 'var(--color-bg)',
                          color: watermarkOptions.position === pos ? 'var(--color-bg)' : 'var(--color-text-secondary)',
                          border: '1px solid var(--color-border)',
                          borderRadius: 4,
                          cursor: 'pointer',
                          fontSize: '0.75rem',
                          textTransform: 'capitalize',
                        }}
                      >
                        {pos}
                      </button>
                    ))}
                  </div>
                </div>

                {watermarkOptions.position === 'corner' && (
                  <div>
                    <label style={{ display: 'block', marginBottom: 4, fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                      Corner
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
                      {(['tl', 'tr', 'bl', 'br'] as const).map(corner => (
                        <button
                          key={corner}
                          onClick={() => {
                            setWatermarkOptions(prev => ({ ...prev, corner }));
                            setTimeout(updatePreview, 100);
                          }}
                          style={{
                            padding: '6px 8px',
                            background: watermarkOptions.corner === corner ? 'var(--color-primary)' : 'var(--color-bg)',
                            color: watermarkOptions.corner === corner ? 'var(--color-bg)' : 'var(--color-text-secondary)',
                            border: '1px solid var(--color-border)',
                            borderRadius: 4,
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                            textTransform: 'uppercase',
                          }}
                        >
                          {corner}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label style={{ display: 'block', marginBottom: 4, fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                    Opacity: {Math.round(watermarkOptions.opacity * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="0.8"
                    step="0.05"
                    value={watermarkOptions.opacity}
                    onChange={e => {
                      setWatermarkOptions(prev => ({ ...prev, opacity: parseFloat(e.target.value) }));
                      setTimeout(updatePreview, 100);
                    }}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <p style={{
                marginTop: 'var(--space-md)',
                fontSize: '0.625rem',
                color: 'var(--color-text-muted)',
                lineHeight: 1.4,
              }}>
                🔒 Watermark applied in your browser. Original files never leave your device unbranded.
              </p>
            </div>
          </div>
        )}

        {/* Galleries Tab */}
        {activeTab === 'galleries' && (
          <div style={{ maxWidth: 800 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', marginBottom: 'var(--space-xl)' }}>
              Manage Galleries
            </h2>
            <p style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
              Gallery management coming soon.
            </p>
          </div>
        )}

        {/* Selections Tab */}
        {activeTab === 'selections' && (
          <SelectionsTab />
        )}
      </div>
    </div>
  );
}

// Selections Tab Component
function SelectionsTab() {
  const [selections, setSelections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [selectedSelection, setSelectedSelection] = useState<any | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadSelections();
  }, [filter]);

  async function loadSelections() {
    setLoading(true);
    try {
      const params = filter !== 'all' ? `?status=${filter}` : '';
      const res = await fetch(`/api/admin/selections${params}`, {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setSelections(data.selections || []);
      }
    } catch {
      console.error('Failed to load selections');
    } finally {
      setLoading(false);
    }
  }

  async function handleReview(selectionId: string, status: 'approved' | 'rejected') {
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/selections', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ selectionId, status, adminNotes }),
      });
      if (res.ok) {
        setSelections(prev =>
          prev.map(s => s.id === selectionId ? { ...s, status, adminNotes } : s)
        );
        setSelectedSelection(null);
        setAdminNotes('');
      }
    } catch {
      alert('Failed to update selection');
    } finally {
      setActionLoading(false);
    }
  }

  const filteredSelections = selections;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-xl)' }}>
        <h2 style={{ fontFamily: 'var(--font-display)' }}>Photo Selections</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          {(['all', 'pending', 'approved', 'rejected'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '6px 12px',
                background: filter === f ? 'var(--color-primary)' : 'var(--color-surface)',
                color: filter === f ? 'var(--color-bg)' : 'var(--color-text-secondary)',
                border: '1px solid var(--color-border)',
                borderRadius: 4,
                cursor: 'pointer',
                fontSize: '0.75rem',
                textTransform: 'capitalize',
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p style={{ color: 'var(--color-text-muted)' }}>Loading...</p>
      ) : filteredSelections.length === 0 ? (
        <p style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
          No selections found.
        </p>
      ) : (
        <div style={{ display: 'grid', gap: 'var(--space-md)' }}>
          {filteredSelections.map(selection => (
            <div
              key={selection.id}
              style={{
                background: 'var(--color-surface)',
                padding: 'var(--space-lg)',
                borderRadius: 8,
                border: '1px solid var(--color-border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{
                    background: selection.status === 'pending' ? '#D4A5A5' : selection.status === 'approved' ? '#4CAF50' : '#8A8A7A',
                    color: 'var(--color-bg)',
                    padding: '2px 8px',
                    borderRadius: 4,
                    fontSize: '0.625rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                  }}>
                    {selection.status}
                  </span>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '1rem' }}>
                    {selection.gallery?.client?.fullName || 'Unknown'}
                  </span>
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                  {selection.gallery?.title || 'Unknown gallery'}
                </p>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: 4 }}>
                  {selection.notes?.length || 0} photos selected
                  {' · '}
                  Submitted {new Date(selection.submittedAt).toLocaleDateString()}
                </p>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => {
                    setSelectedSelection(selection);
                    setAdminNotes(selection.adminNotes || '');
                  }}
                  style={{
                    padding: '6px 12px',
                    background: 'var(--color-bg)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 4,
                    color: 'var(--color-text-secondary)',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                  }}
                >
                  Review
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Selection Detail Modal */}
      {selectedSelection && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.8)',
          zIndex: 1001,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
        }}>
          <div style={{
            background: 'var(--color-surface)',
            borderRadius: 8,
            padding: 'var(--space-xl)',
            maxWidth: 600,
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-lg)' }}>
              <div>
                <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: 4 }}>
                  {selectedSelection.gallery?.client?.fullName}
                </h3>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
                  {selectedSelection.gallery?.title}
                </p>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', marginTop: 4 }}>
                  {new Date(selectedSelection.submittedAt).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedSelection(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-text-muted)',
                  cursor: 'pointer',
                  fontSize: '1.25rem',
                }}
              >
                ✕
              </button>
            </div>

            {/* Selected Photos */}
            <div style={{ marginBottom: 'var(--space-lg)' }}>
              <h4 style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-sm)' }}>
                Selected Photos ({selectedSelection.notes?.length || 0})
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 8 }}>
                {(selectedSelection.notes || []).map((note: any, idx: number) => (
                  <div
                    key={idx}
                    style={{
                      background: 'var(--color-bg)',
                      borderRadius: 4,
                      padding: 8,
                      fontSize: '0.75rem',
                    }}
                  >
                    <div style={{ fontFamily: 'var(--font-mono)', marginBottom: 4, color: 'var(--color-text-muted)' }}>
                      Photo {idx + 1}
                    </div>
                    {note.note && (
                      <div style={{ color: 'var(--color-primary)', fontStyle: 'italic' }}>
                        "{note.note}"
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Admin Notes */}
            <div style={{ marginBottom: 'var(--space-lg)' }}>
              <label style={{ display: 'block', marginBottom: 4, fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                Admin Notes
              </label>
              <textarea
                value={adminNotes}
                onChange={e => setAdminNotes(e.target.value)}
                placeholder="Add notes about this selection..."
                style={{
                  width: '100%',
                  minHeight: 80,
                  padding: '0.75rem',
                  background: 'var(--color-bg)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 4,
                  color: 'var(--color-text-primary)',
                  fontFamily: 'inherit',
                  fontSize: '0.875rem',
                  resize: 'vertical',
                }}
              />
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setSelectedSelection(null)}
                style={{
                  padding: '8px 16px',
                  background: 'transparent',
                  border: '1px solid var(--color-border)',
                  borderRadius: 4,
                  color: 'var(--color-text-secondary)',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleReview(selectedSelection.id, 'rejected')}
                disabled={actionLoading}
                style={{
                  padding: '8px 16px',
                  background: '#8A8A7A',
                  border: 'none',
                  borderRadius: 4,
                  color: 'var(--color-bg)',
                  cursor: actionLoading ? 'not-allowed' : 'pointer',
                  opacity: actionLoading ? 0.6 : 1,
                }}
              >
                Reject
              </button>
              <button
                onClick={() => handleReview(selectedSelection.id, 'approved')}
                disabled={actionLoading}
                style={{
                  padding: '8px 16px',
                  background: '#4CAF50',
                  border: 'none',
                  borderRadius: 4,
                  color: 'white',
                  cursor: actionLoading ? 'not-allowed' : 'pointer',
                  opacity: actionLoading ? 0.6 : 1,
                }}
              >
                Approve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  background: 'var(--color-bg)',
  border: '1px solid var(--color-border)',
  borderRadius: 4,
  color: 'var(--color-text-primary)',
  fontSize: '0.875rem',
};
