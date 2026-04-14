import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

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

    // Send email to Many
    const { error } = await resend.emails.send({
      from: 'Contact Form <noreply@manyphotography.com>',
      to: ['many@manyphotography.com'],
      subject: `New Inquiry: ${service} from ${name}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
        <p><strong>Service:</strong> ${service}</p>
        <p><strong>Preferred Date:</strong> ${date || 'Not specified'}</p>
        <h3>Message:</h3>
        <p>${message.replace(/\n/g, '<br>')}</p>
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
        <h2>Hi ${name},</h2>
        <p>Thank you for your message! I&apos;ve received your inquiry about ${service}.</p>
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
