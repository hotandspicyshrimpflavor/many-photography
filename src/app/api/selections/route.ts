import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { Resend } from 'resend';
import { verifyToken, isValidTokenFormat, parseToken } from '@/lib/auth';

function getResend(): Resend {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY environment variable is not set');
  }
  return new Resend(process.env.RESEND_API_KEY);
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

interface SelectionItem {
  fileId: string;
  note: string;
}

/**
 * Resolve a bearer token to a gallery + client via proper bcrypt verification.
 * The old code used `tokenHash: token` which compared a raw token string against
 * a bcrypt hash — a comparison that can never succeed. This is the correct approach.
 */
async function resolveGalleryByToken(token: string) {
  if (!isValidTokenFormat(token)) return null;

  const parsed = parseToken(token);
  if (!parsed) return null;

  const { fullName } = parsed;
  const normalizedToken = token.toUpperCase();

  const clients = await prisma.client.findMany({
    where: { fullName: { equals: fullName, mode: 'insensitive' } },
    include: {
      galleries: {
        include: {
          tokens: { where: { isActive: true } },
          client: true,
        },
      },
    },
  });

  for (const client of clients) {
    for (const gallery of client.galleries) {
      for (const tokenRecord of gallery.tokens) {
        if (tokenRecord.lockedUntil && new Date(tokenRecord.lockedUntil) > new Date()) {
          continue;
        }
        if (await verifyToken(normalizedToken, tokenRecord.tokenHash)) {
          return { gallery, client };
        }
      }
    }
  }

  return null;
}

/**
 * POST /api/selections — Client submits their photo selection
 * Requires: Authorization: Bearer <NAME-YYYY-MM-DD token>
 * Body: { favorites: [{fileId, note}], message?: string }
 */
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authorization header required' }, { status: 401 });
    }

    const token = authHeader.slice(7).trim();
    const body = await req.json();
    const { favorites, message } = body;

    if (!favorites || !Array.isArray(favorites) || favorites.length === 0) {
      return NextResponse.json({ error: 'At least one favorite is required' }, { status: 400 });
    }

    // Validate each item has a fileId string
    if (!favorites.every((f: unknown) => f && typeof (f as SelectionItem).fileId === 'string')) {
      return NextResponse.json({ error: 'Each favorite must have a fileId' }, { status: 400 });
    }

    const resolved = await resolveGalleryByToken(token);
    if (!resolved) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    const { gallery, client } = resolved;

    // Check gallery expiry
    if (gallery.expiresAt && new Date(gallery.expiresAt) < new Date()) {
      return NextResponse.json({ error: 'This gallery has expired' }, { status: 410 });
    }

    // Verify all fileIds belong to this gallery
    const fileIds = favorites.map((f: SelectionItem) => f.fileId);
    const validFiles = await prisma.file.findMany({
      where: { id: { in: fileIds }, galleryId: gallery.id },
    });

    if (validFiles.length !== fileIds.length) {
      return NextResponse.json({ error: 'Some files not found in this gallery' }, { status: 400 });
    }

    // Sanitize optional client message (max 2000 chars)
    const safeMessage = typeof message === 'string' ? message.slice(0, 2000) : null;

    // Create photo selection
    const selection = await prisma.photoSelection.create({
      data: {
        galleryId: gallery.id,
        clientEmail: client.email,
        notes: favorites as unknown as object,
        message: safeMessage,
      },
    });

    // Send email to admin — all user-supplied content is escaped before insertion
    try {
      const fileList = favorites.map((f: SelectionItem) => {
        const file = validFiles.find(vf => vf.id === f.fileId);
        const fname = escapeHtml(file?.originalFilename || f.fileId);
        const note = f.note ? ` — &ldquo;${escapeHtml(f.note)}&rdquo;` : '';
        return `  • ${fname}${note}`;
      }).join('\n');

      const resend = getResend();
      const adminUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin/dashboard`;
      const safeClientName = escapeHtml(client.fullName);
      const safeGalleryTitle = escapeHtml(gallery.title);
      const safeMessageHtml = safeMessage
        ? `<h3>Client Message:</h3><p>${escapeHtml(safeMessage).replace(/\n/g, '<br>')}</p>`
        : '';

      await resend.emails.send({
        from: "Many's Photography <noreply@manyphotography.com>",
        to: ['many@manyphotography.com'],
        subject: `New Photo Selection from ${safeClientName}`,
        html: `
          <h2>New Photo Selection Submitted</h2>
          <p><strong>Client:</strong> ${safeClientName}</p>
          <p><strong>Gallery:</strong> ${safeGalleryTitle}</p>
          <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>

          <h3>Selected Photos (${favorites.length}):</h3>
          <pre style="background:#1a1a1a;padding:16px;border-radius:8px;overflow-x:auto">${fileList}</pre>

          ${safeMessageHtml}

          <p style="margin-top:24px">
            <a href="${adminUrl}" style="background:#C9A84C;color:#0A0A0A;padding:12px 24px;border-radius:4px;text-decoration:none;font-weight:600">
              Review in Admin Dashboard &rarr;
            </a>
          </p>
        `,
      });
    } catch (emailError) {
      console.error('Failed to send selection email:', emailError);
      // Don't fail the request if email fails — selection is still recorded
    }

    return NextResponse.json({
      success: true,
      selectionId: selection.id,
      message: 'Your selection has been submitted!',
    });
  } catch (error) {
    console.error('POST /api/selections error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
