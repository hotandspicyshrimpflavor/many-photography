import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { Resend } from 'resend';
import { cookies } from 'next/headers';

function getResend(): Resend {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY environment variable is not set');
  }
  return new Resend(process.env.RESEND_API_KEY);
}

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET not configured');
  return new TextEncoder().encode(secret);
}

async function verifyAdmin(token: string): Promise<boolean> {
  try {
    const { jwtVerify } = await import('jose');
    const { payload } = await jwtVerify(token, getJwtSecret());
    return payload.sub !== undefined;
  } catch {
    return false;
  }
}

/**
 * GET /api/admin/selections — List all photo selections
 * PATCH /api/admin/selections — Approve or reject a selection
 */
export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('admin_session');
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isValid = await verifyAdmin(session.value);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status'); // pending | approved | rejected

    const selections = await prisma.photoSelection.findMany({
      where: status ? { status } : {},
      include: {
        gallery: {
          include: {
            client: true,
            files: true,
          },
        },
      },
      orderBy: { submittedAt: 'desc' },
    });

    return NextResponse.json({
      selections: selections.map(s => ({
        id: s.id,
        galleryId: s.galleryId,
        clientEmail: s.clientEmail,
        notes: s.notes as Array<{fileId: string; note: string}>,
        status: s.status,
        adminNotes: s.adminNotes,
        message: s.message,
        submittedAt: s.submittedAt,
        reviewedAt: s.reviewedAt,
        gallery: {
          id: s.gallery.id,
          title: s.gallery.title,
          sessionDate: s.gallery.sessionDate,
          client: {
            fullName: s.gallery.client.fullName,
            email: s.gallery.client.email,
          },
        },
        fileCount: s.gallery.files.length,
      })),
    });
  } catch (error) {
    console.error('GET /api/admin/selections error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('admin_session');
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isValid = await verifyAdmin(session.value);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const { selectionId, status, adminNotes } = await req.json();

    if (!selectionId || !status) {
      return NextResponse.json({ error: 'selectionId and status are required' }, { status: 400 });
    }

    if (!['approved', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Status must be "approved" or "rejected"' }, { status: 400 });
    }

    const selection = await prisma.photoSelection.update({
      where: { id: selectionId },
      data: {
        status,
        adminNotes: adminNotes || null,
        reviewedAt: new Date(),
      },
      include: { gallery: { include: { client: true } } },
    });

    // Send email to client
    try {
      const resend = getResend();
      const statusMessage = status === 'approved'
        ? 'Your photo selection has been approved! We will be in touch soon about next steps.'
        : 'Your photo selection has been noted. We may follow up with questions.';

      await resend.emails.send({
        from: "Many's Photography <noreply@manyphotography.com>",
        to: [selection.clientEmail],
        subject: `📋 Photo Selection ${status === 'approved' ? 'Approved' : 'Received'}`,
        html: `
          <h2>Hi ${selection.gallery.client.fullName},</h2>
          <p>${statusMessage}</p>
          <p><strong>Gallery:</strong> ${selection.gallery.title}</p>
          <p style="margin-top: 24px; color: #8A8A7A; font-size: 14px;">
            © Many's Photography
          </p>
        `,
      });
    } catch (emailError) {
      console.error('Failed to send selection review email:', emailError);
      // Don't fail the request — selection was already updated
    }

    return NextResponse.json({ success: true, selection });
  } catch (error) {
    console.error('PATCH /api/admin/selections error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}