/**
 * Shared auth utilities — Edge-compatible (Web Crypto API only).
 *
 * Both src/middleware.ts (Edge runtime) and src/lib/auth.ts (Node runtime)
 * import from here to avoid duplicating secret-loading and cookie-name logic.
 */

/** Cookie name used for session tokens across the app. */
export const SESSION_COOKIE = 'lorescryver_session';

/**
 * Return the auth signing secret, preferring AUTH_SECRET then NEXTAUTH_SECRET.
 * Falls back to a hard-coded dev secret in non-production environments.
 */
export function getAuthSecret(): string {
  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
  if (secret) return secret;
  if (process.env.NODE_ENV === 'production') {
    throw new Error('AUTH_SECRET is required in production');
  }
  console.warn(
    '[auth] No AUTH_SECRET set — using insecure dev fallback. Set AUTH_SECRET before deploying.'
  );
  return 'local-development-auth-secret-change-before-production';
}

/**
 * Decode a base64url string back to raw bytes.
 * Works in Edge runtimes (no Buffer dependency).
 */
function base64urlToBytes(b64url: string): Uint8Array {
  const b64 = b64url.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

/**
 * Verify a session token using the Web Crypto API (Edge-compatible).
 *
 * Uses `crypto.subtle.verify()` for **constant-time** signature comparison,
 * avoiding timing side-channels that a plain string `===` would introduce.
 *
 * @returns Decoded payload `{ userId, exp }` on success, or `null`.
 */
export async function verifyTokenEdge(
  token: string
): Promise<{ userId: string; exp: number } | null> {
  const dotIndex = token.indexOf('.');
  if (dotIndex < 0) return null;

  const encodedPayload = token.slice(0, dotIndex);
  const signatureB64url = token.slice(dotIndex + 1);
  if (!encodedPayload || !signatureB64url) return null;

  try {
    const secret = getAuthSecret();
    const encoder = new TextEncoder();

    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const signatureBytes = base64urlToBytes(signatureB64url);

    // crypto.subtle.verify performs constant-time comparison internally
    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      signatureBytes as BufferSource,
      encoder.encode(encodedPayload)
    );
    if (!isValid) return null;

    // Decode base64url payload and check expiry
    const jsonStr = atob(encodedPayload.replace(/-/g, '+').replace(/_/g, '/'));
    const payload = JSON.parse(jsonStr) as { userId: string; exp: number };

    if (!payload.userId || payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}
