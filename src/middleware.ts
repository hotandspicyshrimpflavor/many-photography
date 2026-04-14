import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

/**
 * Security middleware — the canonical Next.js entry point (was misnamed proxy.ts).
 *
 * - Enforces security headers on all matched responses
 * - Protects /admin/* routes with full JWT verification (not just cookie presence)
 */

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not configured');
  return new TextEncoder().encode(secret);
}

async function isValidAdminSession(token: string): Promise<boolean> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    return payload.role === 'admin' && !!payload.sub;
  } catch {
    return false;
  }
}

const SECURITY_HEADERS: Record<string, string> = {
  'X-DNS-Prefetch-Control': 'on',
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  'X-Frame-Options': 'SAMEORIGIN',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-XSS-Protection': '1; mode=block',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const { pathname } = request.nextUrl;

  // Apply security headers to every response
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(key, value);
  }

  // Admin route protection
  if (pathname.startsWith('/admin')) {
    // Allow the login page itself without a session
    if (pathname === '/admin' || pathname === '/admin/') {
      return response;
    }

    const sessionCookie = request.cookies.get('admin_session');

    if (!sessionCookie) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }

    // Full cryptographic JWT verification (not just presence)
    const valid = await isValidAdminSession(sessionCookie.value);
    if (!valid) {
      const res = NextResponse.redirect(new URL('/admin', request.url));
      res.cookies.delete('admin_session');
      return res;
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/:path*',
  ],
};
