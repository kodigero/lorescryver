import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE, verifyTokenEdge } from '@/lib/auth-shared';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const hasValidSession = token ? (await verifyTokenEdge(token)) !== null : false;
  const isAuthPage = pathname === '/login' || pathname === '/register';
  const isProtectedPage = pathname === '/dashboard' || pathname.startsWith('/dashboard/') || pathname.startsWith('/projects');
  const isProtectedApi = pathname.startsWith('/api/projects') || pathname.startsWith('/api/scryve');

  if (!hasValidSession && isProtectedPage) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  if (!hasValidSession && isProtectedApi) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (hasValidSession && isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

/**
 * Middleware matcher — intentionally scoped to protected routes only.
 *
 * Routes NOT matched (by design):
 *   /api/auth/me     — must return { user: null } for unauthenticated visitors
 *                       (used by the client for auth-state detection).
 *   /api/auth/logout — simply clears the session cookie; harmless when
 *                       called by an unauthenticated user.
 */
export const config = {
  matcher: ['/dashboard/:path*', '/projects/:path*', '/login', '/register', '/api/projects/:path*', '/api/scryve/:path*'],
};
