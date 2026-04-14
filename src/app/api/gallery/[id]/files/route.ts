import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyToken, isValidTokenFormat, parseToken } from '@/lib/auth';

/**
 * GET /api/gallery/[id]/files
 *
 * Returns the web-quality files for a gallery that the bearer token has access to.
 * Requires: Authorization: Bearer <NAME-YYYY-MM-DD token>
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: galleryId } = await params;

    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authorization header required' }, { status: 401 });
    }

    const token = authHeader.slice(7).trim();

    if (!isValidTokenFormat(token)) {
      return NextResponse.json({ error: 'Invalid token format' }, { status: 401 });
    }

    const parsed = parseToken(token);
    if (!parsed) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const normalizedToken = token.toUpperCase();

    // Find the gallery and verify the token belongs to it
    const gallery = await prisma.gallery.findUnique({
      where: { id: galleryId },
      include: {
        client: true,
        tokens: { where: { isActive: true } },
        files: {
          select: {
            id: true,
            originalFilename: true,
            thumbnailPath: true,
            webQualityPath: true,
            fileType: true,
            mimeType: true,
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!gallery) {
      return NextResponse.json({ error: 'Gallery not found' }, { status: 404 });
    }

    // Check gallery expiry
    if (gallery.expiresAt && new Date(gallery.expiresAt) < new Date()) {
      return NextResponse.json({ error: 'This gallery has expired' }, { status: 410 });
    }

    // Verify the token belongs to this gallery's client
    let tokenValid = false;
    for (const tokenRecord of gallery.tokens) {
      if (tokenRecord.lockedUntil && new Date(tokenRecord.lockedUntil) > new Date()) {
        return NextResponse.json({ error: 'Too many attempts. Try again later.' }, { status: 429 });
      }
      if (await verifyToken(normalizedToken, tokenRecord.tokenHash)) {
        tokenValid = true;
        break;
      }
    }

    if (!tokenValid) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    return NextResponse.json({
      galleryId: gallery.id,
      title: gallery.title,
      files: gallery.files,
    });
  } catch (error) {
    console.error('GET /api/gallery/[id]/files error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
