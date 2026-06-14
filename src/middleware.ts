import { NextRequest, NextResponse } from 'next/server';

const SESSION_COOKIE = 'lorescryver_session';

function getAuthSecret(): string {
  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
  if (secret) return secret;
  if (process.env.NODE_ENV === 'production') {
    throw new Error('AUTH_SECRET is required in production');
  }
  return 'local-development-auth-secret-change-before-production';
}

async function verifyToken(token: string): Promise<boolean> {
  const dotIndex = token.indexOf('.');
  if (dotIndex < 0) return false;

  const encodedPayload = token.slice(0, dotIndex);
  const signature = token.slice(dotIndex + 1);
  if (!encodedPayload || !signature) return false;

  try {
    const secret = getAuthSecret();
    const encoder = new TextEncoder();

    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const sigBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(encodedPayload));

    // Convert to base64url to match Node's crypto.createHmac().digest('base64url')
    const bytes = new Uint8Array(sigBuffer);
    let binary = '';
    for (const byte of bytes) binary += String.fromCharCode(byte);
    const expected = btoa(binary)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    if (expected !== signature) return false;

    // Decode base64url payload and check expiry
    const jsonStr = atob(encodedPayload.replace(/-/g, '+').replace(/_/g, '/'));
    const payload = JSON.parse(jsonStr);

    if (!payload.userId || payload.exp < Math.floor(Date.now() / 1000)) return false;
    return true;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const hasValidSession = token ? await verifyToken(token) : false;
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

export const config = {
  matcher: ['/dashboard/:path*', '/projects/:path*', '/login', '/register', '/api/projects/:path*', '/api/scryve/:path*'],
};
