import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyToken, isValidTokenFormat, parseToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();

    if (!token || typeof token !== 'string') {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    // Validate token format
    if (!isValidTokenFormat(token)) {
      return NextResponse.json(
        { error: 'Invalid token format. Use: NAME-YYYY-MM-DD' },
        { status: 400 }
      );
    }

    // Parse token to get name and date
    const parsed = parseToken(token);
    if (!parsed) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 400 }
      );
    }

    const { fullName, shootDate } = parsed;
    const normalizedToken = token.toUpperCase();

    // Find the client by full name (case-insensitive)
    const clients = await prisma.client.findMany({
      where: {
        fullName: {
          equals: fullName,
          mode: 'insensitive',
        },
      },
      include: {
        galleries: {
          where: {
            tokens: {
              some: {
                isActive: true,
              },
            },
          },
          include: {
            tokens: {
              where: {
                isActive: true,
              },
            },
          },
        },
      },
    });

    if (clients.length === 0) {
      return NextResponse.json(
        { error: 'No gallery found for this token. Please check your code.' },
        { status: 404 }
      );
    }

    // Check each client's galleries for matching token
    for (const client of clients) {
      for (const gallery of client.galleries) {
        for (const tokenRecord of gallery.tokens) {
          if (!tokenRecord.isActive) continue;

          // Check lock status
          if (tokenRecord.lockedUntil && new Date(tokenRecord.lockedUntil) > new Date()) {
            return NextResponse.json(
              { error: 'Too many attempts. Please try again later.' },
              { status: 429 }
            );
          }

          // Verify token
          const isValid = await verifyToken(normalizedToken, tokenRecord.tokenHash);

          if (isValid) {
            // Check if gallery has expired
            if (gallery.expiresAt && new Date(gallery.expiresAt) < new Date()) {
              return NextResponse.json(
                { error: 'This gallery has expired. Please contact Many for a new link.' },
                { status: 410 }
              );
            }

            // Success - increment attempts (for tracking) but allow access
            await prisma.token.update({
              where: { id: tokenRecord.id },
              data: { attempts: 0 },
            });

            return NextResponse.json({
              success: true,
              galleryId: gallery.id,
              clientName: client.fullName,
              galleryTitle: gallery.title,
              expiresAt: gallery.expiresAt,
            });
          }
        }
      }
    }

    // Token didn't match - increment failed attempts
    for (const client of clients) {
      for (const gallery of client.galleries) {
        for (const tokenRecord of gallery.tokens) {
          if (tokenRecord.isActive) {
            const attempts = tokenRecord.attempts + 1;
            const lockUntil = attempts >= 5
              ? new Date(Date.now() + 15 * 60 * 1000) // 15 min lockout
              : null;

            await prisma.token.update({
              where: { id: tokenRecord.id },
              data: { attempts, lockedUntil: lockUntil },
            });
          }
        }
      }
    }

    return NextResponse.json(
      { error: 'Invalid token. Please check your code and try again.' },
      { status: 401 }
    );

  } catch (error) {
    console.error('Token verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
