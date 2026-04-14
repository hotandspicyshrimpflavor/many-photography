import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = 'Many\'s Photography <noreply@manyphotography.com>';
const FROM_SUPPORT = 'support@manyphotography.com';

interface SendTokenEmailParams {
  to: string;
  clientName: string;
  token: string;
  galleryTitle: string;
  expiresAt: Date;
}

export async function sendTokenEmail({
  to,
  clientName,
  token,
  galleryTitle,
  expiresAt,
}: SendTokenEmailParams) {
  const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL}/portal/${encodeURIComponent(token)}`;

  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `Your photos from ${galleryTitle} are ready!`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: 'DM Sans', Arial, sans-serif; background: #0A0A0A; color: #F5F5F0; margin: 0; padding: 40px; }
            .container { max-width: 600px; margin: 0 auto; }
            .header { text-align: center; margin-bottom: 40px; }
            .logo { font-family: 'Playfair Display', serif; font-size: 28px; color: #C9A84C; }
            .content { background: #1A1A1A; padding: 40px; border-radius: 8px; }
            .token-box { background: #0A0A0A; padding: 20px; border-radius: 4px; text-align: center; margin: 30px 0; }
            .token { font-family: monospace; font-size: 24px; color: #C9A84C; letter-spacing: 2px; }
            .btn { display: inline-block; background: #C9A84C; color: #0A0A0A; padding: 16px 32px; text-decoration: none; border-radius: 4px; font-weight: 600; margin: 20px 0; }
            .footer { text-align: center; margin-top: 40px; color: #8A8A7A; font-size: 14px; }
            .warning { color: #D4A5A5; font-size: 14px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">Many&apos;s Photography</div>
            </div>
            <div class="content">
              <h1 style="margin: 0 0 20px; font-family: 'Playfair Display', serif;">Your photos are ready!</h1>
              <p>Hi ${clientName},</p>
              <p>Your photo gallery <strong>${galleryTitle}</strong> is ready for viewing and download.</p>
              <div class="token-box">
                <p style="margin: 0 0 10px; color: #8A8A7A;">Your Access Code:</p>
                <div class="token">${token}</div>
              </div>
              <p style="text-align: center;">
                <a href="${loginUrl}" class="btn">View My Photos</a>
              </p>
              <p style="color: #8A8A7A;">Or copy and paste this link:</p>
              <p style="color: #8A8A7A; font-size: 14px; word-break: break-all;">${loginUrl}</p>
              <p class="warning">⚠️ This link expires on ${expiresAt.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
            </div>
            <div class="footer">
              <p>© Many's Photography — All rights reserved</p>
              <p>Questions? Contact us at ${FROM_SUPPORT}</p>
            </div>
          </div>
        </body>
      </html>
    `,
  });

  if (error) {
    console.error('Failed to send token email:', error);
    throw error;
  }

  return data;
}

interface SendDownloadReminderParams {
  to: string;
  clientName: string;
  galleryTitle: string;
  daysUntilExpiry: number;
  loginUrl: string;
}

export async function sendDownloadReminder({
  to,
  clientName,
  galleryTitle,
  daysUntilExpiry,
  loginUrl,
}: SendDownloadReminderParams) {
  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `Reminder: Your photos expire in ${daysUntilExpiry} days`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: 'DM Sans', Arial, sans-serif; background: #0A0A0A; color: #F5F5F0; margin: 0; padding: 40px; }
            .container { max-width: 600px; margin: 0 auto; }
            .content { background: #1A1A1A; padding: 40px; border-radius: 8px; }
            .btn { display: inline-block; background: #C9A84C; color: #0A0A0A; padding: 16px 32px; text-decoration: none; border-radius: 4px; font-weight: 600; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="content">
              <h1 style="font-family: 'Playfair Display', serif;">Don&apos;t miss your memories!</h1>
              <p>Hi ${clientName},</p>
              <p>Your gallery <strong>${galleryTitle}</strong> will expire in <strong>${daysUntilExpiry} days</strong>.</p>
              <p style="text-align: center;">
                <a href="${loginUrl}" class="btn">Download Now</a>
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
  });

  if (error) throw error;
  return data;
}

export { resend };
