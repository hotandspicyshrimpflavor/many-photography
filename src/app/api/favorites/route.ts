import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

/**
 * POST /api/favorites — Add a favorite (with optional note)
 * DELETE /api/favorites — Remove a favorite
 * 
 * Both require a gallery token via Authorization header.
 * Token format: "NAME-YYYY-MM-DD"
 */
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Authorization header required' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { fileId, note } = await req.json();

    if (!fileId) {
      return NextResponse.json({ error: 'fileId is required' }, { status: 400 });
    }

    // Find client by token
    const gallery = await prisma.gallery.findFirst({
      where: {
        tokens: {
          some: {
            tokenHash: token, // In production: hash and compare
            isActive: true,
          },
        },
      },
      include: {
        client: true,
        files: { where: { id: fileId } },
      },
    });

    if (!gallery) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    // Verify file belongs to this gallery
    if (!gallery.files.find(f => f.id === fileId)) {
      return NextResponse.json({ error: 'File not found in this gallery' }, { status: 404 });
    }

    // Upsert favorite (add or update note)
    const favorite = await prisma.favorite.upsert({
      where: {
        clientId_fileId: {
          clientId: gallery.clientId,
          fileId,
        },
      },
      update: { note: note || '' },
      create: {
        clientId: gallery.clientId,
        fileId,
        note: note || '',
      },
    });

    // Get count for response
    const count = await prisma.favorite.count({
      where: { clientId: gallery.clientId },
    });

    return NextResponse.json({ success: true, favoriteId: favorite.id, favoritesCount: count });
  } catch (error) {
    console.error('POST /api/favorites error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Authorization header required' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { fileId } = await req.json();

    if (!fileId) {
      return NextResponse.json({ error: 'fileId is required' }, { status: 400 });
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
      include: { client: true },
    });

    if (!gallery) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    // Delete favorite
    await prisma.favorite.deleteMany({
      where: {
        clientId: gallery.clientId,
        fileId,
      },
    });

    // Get updated count
    const count = await prisma.favorite.count({
      where: { clientId: gallery.clientId },
    });

    return NextResponse.json({ success: true, favoritesCount: count });
  } catch (error) {
    console.error('DELETE /api/favorites error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Authorization header required' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');

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
      include: { client: true },
    });

    if (!gallery) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    // Get all favorites for this client
    const favorites = await prisma.favorite.findMany({
      where: { clientId: gallery.clientId },
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