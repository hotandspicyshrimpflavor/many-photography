import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer style={{
      background: 'var(--color-surface)',
      borderTop: '1px solid var(--color-border)',
      padding: 'var(--space-xl) 0',
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 'var(--space-xl)',
          marginBottom: 'var(--space-xl)',
        }}>
          {/* Brand */}
          <div>
            <h3 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.5rem',
              color: 'var(--color-primary)',
              marginBottom: 'var(--space-md)',
            }}>
              Many&apos;s Photography
            </h3>
            <p style={{
              color: 'var(--color-text-secondary)',
              fontSize: '0.875rem',
              maxWidth: '25ch',
            }}>
              Award-winning photography & videography. Capturing moments that last forever.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{
              fontSize: '0.75rem',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--color-text-muted)',
              marginBottom: 'var(--space-md)',
            }}>
              Explore
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
              {['Portfolio', 'Services', 'About', 'Awards', 'Contact'].map((item) => (
                <Link
                  key={item}
                  href={`/${item.toLowerCase()}`}
                  style={{
                    color: 'var(--color-text-secondary)',
                    fontSize: '0.875rem',
                    transition: 'color var(--duration-fast)',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-primary)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-secondary)'}
                >
                  {item}
                </Link>
              ))}
            </div>
          </div>

          {/* Legal */}
          <div>
            <h4 style={{
              fontSize: '0.75rem',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--color-text-muted)',
              marginBottom: 'var(--space-md)',
            }}>
              Legal
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
              {['Privacy Policy', 'Terms of Service', 'Copyright'].map((item) => (
                <Link
                  key={item}
                  href={`/${item.toLowerCase().replace(/\s+/g, '-')}`}
                  style={{
                    color: 'var(--color-text-secondary)',
                    fontSize: '0.875rem',
                    transition: 'color var(--duration-fast)',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-primary)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-secondary)'}
                >
                  {item}
                </Link>
              ))}
            </div>
          </div>

          {/* Social */}
          <div>
            <h4 style={{
              fontSize: '0.75rem',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--color-text-muted)',
              marginBottom: 'var(--space-md)',
            }}>
              Follow
            </h4>
            <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
              {[
                { name: 'Instagram', url: '#' },
                { name: 'Twitter', url: '#' },
                { name: 'LinkedIn', url: '#' },
              ].map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: 'var(--color-text-secondary)',
                    fontSize: '0.875rem',
                    transition: 'color var(--duration-fast)',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-primary)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-secondary)'}
                >
                  {social.name}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{
          borderTop: '1px solid var(--color-border)',
          paddingTop: 'var(--space-lg)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 'var(--space-md)',
        }}>
          <p style={{
            color: 'var(--color-text-muted)',
            fontSize: '0.75rem',
          }}>
            © {currentYear} Many&apos;s Photography. All rights reserved.
          </p>
          <p style={{
            color: 'var(--color-text-muted)',
            fontSize: '0.75rem',
          }}>
            © All photographs and videos on this site are protected by copyright.
          </p>
        </div>
      </div>
    </footer>
  );
}
