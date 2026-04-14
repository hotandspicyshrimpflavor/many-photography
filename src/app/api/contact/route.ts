import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, service, date, message, website } = await req.json();

    // Honeypot check
    if (website) {
      // Bot detected - silently succeed to not tip off bots
      return NextResponse.json({ success: true });
    }

    if (!name || !email || !service || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safePhone = phone ? escapeHtml(phone) : 'Not provided';
    const safeService = escapeHtml(service);
    const safeDate = date ? escapeHtml(date) : 'Not specified';
    const safeMessage = escapeHtml(message).replace(/\n/g, '<br>');

    // Send email to Many
    const { error } = await resend.emails.send({
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
    await resend.emails.send({
      from: "Many's Photography <noreply@manyphotography.com>",
      to: [email],
      subject: 'Thanks for reaching out!',
      html: `
        <h2>Hi ${safeName},</h2>
        <p>Thank you for your message! I've received your inquiry about ${safeService}.</p>
        <p>I typically respond within 24 hours. Can't wait to learn more about your vision!</p>
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
