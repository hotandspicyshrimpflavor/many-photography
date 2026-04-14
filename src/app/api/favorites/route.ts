import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyToken, isValidTokenFormat, parseToken } from '@/lib/auth';

/**
 * Resolve a bearer token to a gallery + client via proper bcrypt verification.
 * Previously the code used `tokenHash: token` (comparing raw token against a hash)
 * which would never match. This implements the same pattern as /api/portal/verify.
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
        },
      },
    },
  });

  for (const client of clients) {
    for (const gallery of client.galleries) {
      for (const tokenRecord of gallery.tokens) {
        // Skip locked tokens
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
 * POST /api/favorites — Add a favorite (with optional note)
 * DELETE /api/favorites — Remove a favorite
 * GET /api/favorites — List all favorites for the authenticated client
 *
 * All require: Authorization: Bearer <NAME-YYYY-MM-DD token>
 */
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authorization header required' }, { status: 401 });
    }

    const token = authHeader.slice(7).trim();
    const { fileId, note } = await req.json();

    if (!fileId || typeof fileId !== 'string') {
      return NextResponse.json({ error: 'fileId is required' }, { status: 400 });
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

    // Verify file belongs to this gallery
    const file = await prisma.file.findFirst({
      where: { id: fileId, galleryId: gallery.id },
    });

    if (!file) {
      return NextResponse.json({ error: 'File not found in this gallery' }, { status: 404 });
    }

    // Sanitize note (max 500 chars)
    const safeNote = typeof note === 'string' ? note.slice(0, 500) : '';

    // Upsert favorite (add or update note)
    const favorite = await prisma.favorite.upsert({
      where: { clientId_fileId: { clientId: client.id, fileId } },
      update: { note: safeNote },
      create: { clientId: client.id, fileId, note: safeNote },
    });

    const count = await prisma.favorite.count({ where: { clientId: client.id } });

    return NextResponse.json({ success: true, favoriteId: favorite.id, favoritesCount: count });
  } catch (error) {
    console.error('POST /api/favorites error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authorization header required' }, { status: 401 });
    }

    const token = authHeader.slice(7).trim();
    const { fileId } = await req.json();

    if (!fileId || typeof fileId !== 'string') {
      return NextResponse.json({ error: 'fileId is required' }, { status: 400 });
    }

    const resolved = await resolveGalleryByToken(token);
    if (!resolved) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    const { client } = resolved;

    await prisma.favorite.deleteMany({
      where: { clientId: client.id, fileId },
    });

    const count = await prisma.favorite.count({ where: { clientId: client.id } });

    return NextResponse.json({ success: true, favoritesCount: count });
  } catch (error) {
    console.error('DELETE /api/favorites error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authorization header required' }, { status: 401 });
    }

    const token = authHeader.slice(7).trim();

    const resolved = await resolveGalleryByToken(token);
    if (!resolved) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    const { client } = resolved;

    const favorites = await prisma.favorite.findMany({
      where: { clientId: client.id },
      include: { file: true },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      favorites: favorites.map(f => ({
        id: f.id,
        fileId: f.fileId,
        note: f.note,
        createdAt: f.createdAt,
        file: f.file ? {
          id: f.file.id,
          thumbnailPath: f.file.thumbnailPath,
          webQualityPath: f.file.webQualityPath,
          originalFilename: f.file.originalFilename,
        } : null,
      })),
      count: favorites.length,
    });
  } catch (error) {
    console.error('GET /api/favorites error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
