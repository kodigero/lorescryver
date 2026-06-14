import { NextRequest, NextResponse } from 'next/server';

const SESSION_COOKIE = 'lorescryver_session';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = Boolean(request.cookies.get(SESSION_COOKIE)?.value);
  const isAuthPage = pathname === '/login' || pathname === '/register';
  const isProtectedPage = pathname === '/dashboard' || pathname.startsWith('/dashboard/') || pathname.startsWith('/projects');
  const isProtectedApi = pathname.startsWith('/api/projects') || pathname.startsWith('/api/scryve');

  if (!hasSession && isProtectedPage) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  if (!hasSession && isProtectedApi) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (hasSession && isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/projects/:path*', '/login', '/register', '/api/projects/:path*', '/api/scryve/:path*'],
};
