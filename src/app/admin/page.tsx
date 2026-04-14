import Navigation from '@/components/ui/Navigation';
import Footer from '@/components/ui/Footer';

export default function AdminLoginPage() {
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

        <form style={{
          background: 'var(--color-surface)',
          padding: 'var(--space-xl)',
          borderRadius: '8px',
          border: '1px solid var(--color-border)',
        }}>
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
              required
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
              required
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

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
            Login
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
