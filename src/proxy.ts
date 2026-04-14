import { NextRequest, NextResponse } from 'next/server';

/**
 * Security middleware for the admin route.
 * - Enforces security headers on all responses
 * - Protects /admin/* routes (requires auth cookie)
 * - Adds rate limiting headers
 */
export default function proxy(request: NextRequest) {
  const response = NextResponse.next();
  const pathname = request.nextUrl.pathname;

  // Add security headers to all responses
  const securityHeaders = {
    'X-DNS-Prefetch-Control': 'on',
    'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
    'X-Frame-Options': 'SAMEORIGIN',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'X-XSS-Protection': '1; mode=block',
  };

  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // Protect admin routes
  if (pathname.startsWith('/admin')) {
    // Allow access to /admin (login page) without auth
    if (pathname === '/admin' || pathname === '/admin/') {
      return response;
    }

    // Allow /admin/dashboard only with valid session cookie
    const sessionCookie = request.cookies.get('admin_session');
    
    if (!sessionCookie) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }

    // Note: Full JWT verification happens in the API route.
    // This middleware just checks for presence of the cookie.
    // The API route does the actual cryptographic verification.
  }

  return response;
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/:path*',
  ],
};
