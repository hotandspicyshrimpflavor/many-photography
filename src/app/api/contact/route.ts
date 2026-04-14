import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

let _resend: Resend | null = null;

function getResend(): Resend {
  if (!_resend) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY environment variable is not set');
    }
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Simple in-memory rate limiter: 5 submissions per IP per hour
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60 * 60 * 1000 });
    return true;
  }

  if (entry.count >= 5) return false;
  entry.count++;
  return true;
}

export async function POST(req: NextRequest) {
  try {
    // Rate limit by IP
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      req.headers.get('x-real-ip') ||
      'unknown';

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many submissions. Please try again later.' },
        { status: 429 }
      );
    }

    const { name, email, phone, service, date, message, website } = await req.json();

    // Honeypot check
    if (website) {
      // Bot detected — silently succeed to not reveal the trap
      return NextResponse.json({ success: true });
    }

    if (!name || !email || !service || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Enforce reasonable length limits
    if (
      String(name).length > 200 ||
      String(email).length > 254 ||
      String(message).length > 5000
    ) {
      return NextResponse.json({ error: 'Input too long' }, { status: 400 });
    }

    const safeName = escapeHtml(String(name));
    const safeEmail = escapeHtml(String(email));
    const safePhone = phone ? escapeHtml(String(phone)) : 'Not provided';
    const safeService = escapeHtml(String(service));
    const safeDate = date ? escapeHtml(String(date)) : 'Not specified';
    const safeMessage = escapeHtml(String(message)).replace(/\n/g, '<br>');

    // Send email to Many
    const { error } = await getResend().emails.send({
      from: 'Contact Form <noreply@manyphotography.com>',
      to: ['many@manyphotography.com'],
      subject: `New Inquiry: ${safeService} from ${safeName}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${safeName}</p>
        <p><strong>Email:</strong> ${safeEmail}</p>
        <p><strong>Phone:</strong> ${safePhone}</p>
        <p><strong>Service:</strong> ${safeService}</p>
        <p><strong>Preferred Date:</strong> ${safeDate}</p>
        <h3>Message:</h3>
        <p>${safeMessage}</p>
      `,
    });

    if (error) {
      console.error('Failed to send contact email:', error);
      return NextResponse.json(
        { error: 'Failed to send message' },
        { status: 500 }
      );
    }

    // Send auto-reply to client
    await getResend().emails.send({
      from: "Many's Photography <noreply@manyphotography.com>",
      to: [email],
      subject: 'Thanks for reaching out!',
      html: `
        <h2>Hi ${safeName},</h2>
        <p>Thank you for your message! I&apos;ve received your inquiry about ${safeService}.</p>
        <p>I typically respond within 24 hours. Can&apos;t wait to learn more about your vision!</p>
        <p>Best,<br>Many</p>
      `,
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
