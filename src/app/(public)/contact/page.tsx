'use client';

import { useState } from 'react';
import Navigation from '@/components/ui/Navigation';
import Footer from '@/components/ui/Footer';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: '',
    date: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [honeypot, setHoneypot] = useState(''); // Spam trap

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (honeypot) return; // Bot detected

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setSubmitted(true);
      }
    } catch (error) {
      console.error('Form submission error:', error);
    }

    setIsSubmitting(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <>
      <Navigation />
      <main style={{ minHeight: '100vh', paddingTop: '80px' }}>
        <div className="container" style={{ maxWidth: '800px', padding: 'var(--space-2xl) var(--space-lg)' }}>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            textAlign: 'center',
            marginBottom: 'var(--space-md)',
          }}>
            Let&apos;s Create <span className="text-gradient">Together</span>
          </h1>
          <p style={{
            textAlign: 'center',
            color: 'var(--color-text-secondary)',
            maxWidth: '50ch',
            margin: '0 auto var(--space-xl)',
          }}>
            Ready to capture your story? Fill out the form below and I&apos;ll get back to you within 24 hours.
          </p>

          {submitted ? (
            <div style={{
              textAlign: 'center',
              padding: 'var(--space-2xl)',
              background: 'var(--color-surface)',
              borderRadius: '8px',
            }}>
              <div style={{
                fontSize: '4rem',
                marginBottom: 'var(--space-lg)',
              }}>✨</div>
              <h2 style={{ fontFamily: 'var(--font-display)', marginBottom: 'var(--space-md)' }}>
                Message Sent!
              </h2>
              <p style={{ color: 'var(--color-text-secondary)' }}>
                Thank you for reaching out. I&apos;ll be in touch soon.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{
              background: 'var(--color-surface)',
              padding: 'var(--space-xl)',
              borderRadius: '8px',
            }}>
              {/* Honeypot - hidden from real users */}
              <input
                type="text"
                name="website"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                style={{ display: 'none' }}
                tabIndex={-1}
                autoComplete="off"
              />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-lg)', marginBottom: 'var(--space-lg)' }}>
                <div>
                  <label htmlFor="name" style={{ display: 'block', marginBottom: 'var(--space-sm)', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
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

                <div>
                  <label htmlFor="email" style={{ display: 'block', marginBottom: 'var(--space-sm)', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
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
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-lg)', marginBottom: 'var(--space-lg)' }}>
                <div>
                  <label htmlFor="phone" style={{ display: 'block', marginBottom: 'var(--space-sm)', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                    Phone (optional)
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
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

                <div>
                  <label htmlFor="service" style={{ display: 'block', marginBottom: 'var(--space-sm)', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                    Service Type *
                  </label>
                  <select
                    id="service"
                    name="service"
                    value={formData.service}
                    onChange={handleChange}
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
                  >
                    <option value="">Select a service</option>
                    <option value="wedding">Wedding Photography</option>
                    <option value="portrait">Portrait Session</option>
                    <option value="commercial">Commercial / Brand</option>
                    <option value="event">Event Coverage</option>
                    <option value="video">Video Production</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: 'var(--space-lg)' }}>
                <label htmlFor="date" style={{ display: 'block', marginBottom: 'var(--space-sm)', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                  Preferred Date (if known)
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
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

              <div style={{ marginBottom: 'var(--space-xl)' }}>
                <label htmlFor="message" style={{ display: 'block', marginBottom: 'var(--space-sm)', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                  Tell me about your vision *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  placeholder="Describe your project, what you're looking for, any specific ideas..."
                  style={{
                    width: '100%',
                    padding: 'var(--space-md)',
                    background: 'var(--color-bg)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '4px',
                    color: 'var(--color-text-primary)',
                    fontSize: '1rem',
                    resize: 'vertical',
                    fontFamily: 'var(--font-body)',
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary"
                style={{ width: '100%', padding: 'var(--space-lg)' }}
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
