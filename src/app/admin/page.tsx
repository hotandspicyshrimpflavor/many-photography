'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Invalid credentials');
        setIsLoading(false);
        return;
      }

      router.push('/admin/dashboard');
    } catch {
      setError('Something went wrong. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div style={{
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
        maxWidth: '400px',
        textAlign: 'center',
      }}>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.5rem',
          color: 'var(--color-primary)',
          marginBottom: 'var(--space-sm)',
        }}>
          Many&apos;s Photography
        </h1>
        <p style={{
          color: 'var(--color-text-secondary)',
          marginBottom: 'var(--space-xl)',
        }}>
          Admin Portal
        </p>

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
            <label htmlFor="email" style={{
              display: 'block',
              textAlign: 'left',
              marginBottom: 'var(--space-sm)',
              fontSize: '0.875rem',
              color: 'var(--color-text-secondary)',
            }}>
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              style={{
                width: '100%',
                padding: 'var(--space-md)',
                background: 'var(--color-bg)',
                border: '1px solid var(--color-border)',
                borderRadius: '4px',
                color: 'var(--color-text-primary)',
                fontSize: '1rem',
              }}
            />
          </div>

          <div style={{ marginBottom: 'var(--space-lg)' }}>
            <label htmlFor="password" style={{
              display: 'block',
              textAlign: 'left',
              marginBottom: 'var(--space-sm)',
              fontSize: '0.875rem',
              color: 'var(--color-text-secondary)',
            }}>
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              style={{
                width: '100%',
                padding: 'var(--space-md)',
                background: 'var(--color-bg)',
                border: '1px solid var(--color-border)',
                borderRadius: '4px',
                color: 'var(--color-text-primary)',
                fontSize: '1rem',
              }}
            />
          </div>

          {error && (
            <p style={{
              marginBottom: 'var(--space-md)',
              color: 'var(--color-error)',
              fontSize: '0.875rem',
              textAlign: 'left',
            }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary"
            style={{ width: '100%', opacity: isLoading ? 0.7 : 1 }}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p style={{
          marginTop: 'var(--space-lg)',
          fontSize: '0.875rem',
          color: 'var(--color-text-muted)',
        }}>
          <Link href="/" style={{ color: 'var(--color-primary)' }}>
            ← Back to site
          </Link>
        </p>
      </div>
    </div>
  );
}
