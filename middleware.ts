import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/middleware-helper';
import { isAdmin } from '@/lib/auth/roles';

// Paths exempt from admin auth checks
const PUBLIC_ADMIN_PATHS = new Set(['/admin/login']);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only guard /admin routes
  if (!pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  // Allow public admin routes (login)
  if (PUBLIC_ADMIN_PATHS.has(pathname)) {
    return NextResponse.next();
  }

  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const csrfHeader = request.headers.get('x-csrf-token');
  const csrfCookie = request.cookies.get('csrfToken')?.value;
  const lastActivity = request.cookies.get('lastActivity')?.value;

  // Session idle timeout - default 1 minute (60000ms) for admin security
  // Can be overridden via SESSION_TIMEOUT environment variable
  const sessionTimeoutMs = parseInt(process.env.SESSION_TIMEOUT || '60000');

  const { user: userProfile, error: authError } = await getAuthenticatedUser(request);

  // If no verified user, redirect to login
  if (authError || !userProfile) {
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('reason', 'unauthenticated');
    return NextResponse.redirect(loginUrl);
  }

  // Check lastActivity for idle timeout - only if lastActivity exists
  // If no lastActivity cookie, set it (first request after login)
  if (!lastActivity) {
    response.cookies.set('lastActivity', Date.now().toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });
  } else if (Date.now() - Number(lastActivity) > sessionTimeoutMs) {
    // Session has been idle too long
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('reason', 'session_expired');
    return NextResponse.redirect(loginUrl);
  }

  // For state-changing requests, enforce CSRF header matches cookie
  const method = request.method.toUpperCase();
  const isMutating = method === 'POST' || method === 'PUT' || method === 'PATCH' || method === 'DELETE';
  if (isMutating) {
    if (!csrfHeader || !csrfCookie || csrfHeader !== csrfCookie) {
      const forbiddenUrl = new URL('/403', request.url);
      return NextResponse.redirect(forbiddenUrl);
    }
  }

  // Check if user has admin role (case-insensitive)
  const role = userProfile.role;
  if (!isAdmin(role)) {
    const forbiddenUrl = new URL('/403', request.url);
    return NextResponse.redirect(forbiddenUrl);
  }

  // Enforce stricter RBAC for certain paths
  if (pathname.startsWith('/admin/settings') && 
      role.toLowerCase() !== 'superadmin') {
    const forbiddenUrl = new URL('/403', request.url);
    return NextResponse.redirect(forbiddenUrl);
  }

  // Update last activity (we'll use a custom cookie for this)
  response.cookies.set('lastActivity', Date.now().toString(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
  });
  
  return response;
}

export const config = {
  matcher: ['/admin/:path*'],
};
