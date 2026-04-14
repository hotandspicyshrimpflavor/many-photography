'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PortalPage() {
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/portal/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: token.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Invalid token. Please check your code.');
        setIsLoading(false);
        return;
      }

      // Redirect to the private gallery
      router.push(`/portal/${encodeURIComponent(token.trim())}`);
    } catch {
      setError('Something went wrong. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'var(--space-lg)',
      background: 'linear-gradient(180deg, var(--color-bg) 0%, var(--color-surface) 100%)',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '480px',
        textAlign: 'center',
      }}>
        {/* Logo */}
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '2rem',
          color: 'var(--color-primary)',
          marginBottom: 'var(--space-sm)',
        }}>
          Many&apos;s Photography
        </h1>
        <p style={{
          color: 'var(--color-text-secondary)',
          marginBottom: 'var(--space-xl)',
        }}>
          Client Portal
        </p>

        {/* Login Form */}
        <form
          onSubmit={handleSubmit}
          style={{
            background: 'var(--color-surface)',
            padding: 'var(--space-xl)',
            borderRadius: '8px',
            border: '1px solid var(--color-border)',
          }}
        >
          <div style={{ marginBottom: 'var(--space-lg)' }}>
            <label
              htmlFor="token"
              style={{
                display: 'block',
                textAlign: 'left',
                marginBottom: 'var(--space-sm)',
                fontSize: '0.875rem',
                color: 'var(--color-text-secondary)',
              }}
            >
              Enter your access code
            </label>
            <input
              id="token"
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="JOHN DOE-2024-06-15"
              style={{
                width: '100%',
                padding: 'var(--space-md)',
                background: 'var(--color-bg)',
                border: '1px solid var(--color-border)',
                borderRadius: '4px',
                color: 'var(--color-text-primary)',
                fontFamily: 'var(--font-mono)',
                fontSize: '1rem',
                textAlign: 'center',
                letterSpacing: '0.05em',
              }}
              className="protected-image"
              required
              autoFocus
            />
            {error && (
              <p style={{
                marginTop: 'var(--space-sm)',
                color: 'var(--color-error)',
                fontSize: '0.875rem',
              }}>
                {error}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading || !token.trim()}
            className="btn btn-primary"
            style={{
              width: '100%',
              padding: 'var(--space-md)',
              opacity: isLoading || !token.trim() ? 0.7 : 1,
            }}
          >
            {isLoading ? 'Verifying...' : 'Access My Gallery'}
          </button>
        </form>

        {/* Help Text */}
        <p style={{
          marginTop: 'var(--space-lg)',
          fontSize: '0.875rem',
          color: 'var(--color-text-muted)',
        }}>
          Your access code was provided in your delivery email.
          <br />
          Can&apos;t find it?{' '}
          <a
            href="/contact"
            style={{
              color: 'var(--color-primary)',
              textDecoration: 'underline',
            }}
          >
            Contact support
          </a>
        </p>

        {/* Copyright Notice */}
        <p style={{
          marginTop: 'var(--space-xl)',
          fontSize: '0.75rem',
          color: 'var(--color-text-muted)',
        }}>
          © Many&apos;s Photography — All rights reserved.
          <br />
          All images are protected by copyright law.
        </p>
      </div>

      {/* Anti-debug: detect DevTools */}
      <script dangerouslySetInnerHTML={{
        __html: `
          (function() {
            const devtools = {open: false};
            const threshold = 160;
            const emit = () => { devtools.open = true; };
            setInterval(() => {
              if (window.outerWidth - window.innerWidth > threshold ||
                  window.outerHeight - window.innerHeight > threshold) {
                emit();
              }
            }, 1000);
          })();
        `,
      }} />
    </main>
  );
}
