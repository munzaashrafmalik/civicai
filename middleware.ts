import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Admin routes - only admin role
    if (path.startsWith('/admin') || path.startsWith('/api/admin')) {
      if (token?.role !== 'admin') {
        return NextResponse.redirect(new URL('/unauthorized', req.url));
      }
    }

    // Protected user routes - any authenticated user
    if (path.startsWith('/profile') || path.startsWith('/my-complaints') || path.startsWith('/report')) {
      if (!token) {
        const callbackUrl = encodeURIComponent(path);
        return NextResponse.redirect(new URL(`/login?callbackUrl=${callbackUrl}`, req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;

        // Public routes
        if (path === '/' || path === '/login' || path === '/register' || path.startsWith('/api/auth')) {
          return true;
        }

        // Protected routes need token
        if (path.startsWith('/profile') || path.startsWith('/my-complaints') || path.startsWith('/report') || path.startsWith('/admin')) {
          return !!token;
        }

        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    '/profile/:path*',
    '/my-complaints/:path*',
    '/report/:path*',
    '/admin/:path*',
    '/api/admin/:path*',
  ],
};