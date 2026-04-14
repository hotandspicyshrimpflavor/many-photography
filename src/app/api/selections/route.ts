import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { Resend } from 'resend';

function getResend(): Resend {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY environment variable is not set');
  }
  return new Resend(process.env.RESEND_API_KEY);
}

interface SelectionItem {
  fileId: string;
  note: string;
}

/**
 * POST /api/selections — Client submits their photo selection
 * Requires: Authorization header with gallery token
 * Body: { favorites: [{fileId, note}], message?: string }
 */
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Authorization header required' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { favorites, message } = await req.json();

    if (!favorites || !Array.isArray(favorites) || favorites.length === 0) {
      return NextResponse.json({ error: 'At least one favorite is required' }, { status: 400 });
    }

    // Find gallery by token
    const gallery = await prisma.gallery.findFirst({
      where: {
        tokens: {
          some: {
            tokenHash: token,
            isActive: true,
          },
        },
      },
      include: {
        client: true,
        files: { where: { id: { in: favorites.map((f: SelectionItem) => f.fileId) } } },
      },
    });

    if (!gallery) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    // Verify all fileIds belong to this gallery
    const fileIds = favorites.map((f: SelectionItem) => f.fileId);
    const validFiles = gallery.files;
    if (validFiles.length !== fileIds.length) {
      return NextResponse.json({ error: 'Some files not found in this gallery' }, { status: 400 });
    }

    // Create photo selection
    const selection = await prisma.photoSelection.create({
      data: {
        galleryId: gallery.id,
        clientEmail: gallery.client.email,
        notes: favorites as any,
        message: message || null,
      },
    });

    // Send email to admin
    try {
      const fileList = favorites.map((f: SelectionItem) => {
        const file = validFiles.find(vf => vf.id === f.fileId);
        return `  • ${file?.originalFilename || f.fileId}${f.note ? ` — "${f.note}"` : ''}`;
      }).join('\n');

      const resend = getResend();
      const adminUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin/dashboard`;

      await resend.emails.send({
        from: "Many's Photography <noreply@manyphotography.com>",
        to: ['many@manyphotography.com'],
        subject: `📸 New Photo Selection from ${gallery.client.fullName}`,
        html: `
          <h2>New Photo Selection Submitted</h2>
          <p><strong>Client:</strong> ${gallery.client.fullName}</p>
          <p><strong>Gallery:</strong> ${gallery.title}</p>
          <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
          
          <h3>Selected Photos (${favorites.length}):</h3>
          <pre style="background: #1a1a1a; padding: 16px; border-radius: 8px; overflow-x: auto">${fileList}</pre>
          
          ${message ? `<h3>Client Message:</h3><p>${message}</p>` : ''}
          
          <p style="margin-top: 24px">
            <a href="${adminUrl}" style="background: #C9A84C; color: #0A0A0A; padding: 12px 24px; border-radius: 4px; text-decoration: none; font-weight: 600">
              Review in Admin Dashboard →
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