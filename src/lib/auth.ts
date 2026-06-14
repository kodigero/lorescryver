// NextAuth configuration — to be implemented
import crypto from 'crypto';
import { cookies } from 'next/headers';
import { prisma } from './prisma';

const SESSION_COOKIE = 'lorescryver_session';
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;
const PASSWORD_ITERATIONS = 210000;
const PASSWORD_KEY_LENGTH = 32;
const PASSWORD_DIGEST = 'sha256';

type SessionPayload = {
  userId: string;
  exp: number;
};

function getAuthSecret() {
  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
  if (secret) return secret;
  if (process.env.NODE_ENV === 'production') {
    throw new Error('AUTH_SECRET is required in production');
  }
  return 'local-development-auth-secret-change-before-production';
}

function base64UrlEncode(value: Buffer | string) {
  return Buffer.from(value).toString('base64url');
}

function base64UrlDecode(value: string) {
  return Buffer.from(value, 'base64url').toString('utf8');
}

function sign(value: string) {
  return crypto.createHmac('sha256', getAuthSecret()).update(value).digest('base64url');
}

export function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString('base64url');
  const hash = crypto
    .pbkdf2Sync(password, salt, PASSWORD_ITERATIONS, PASSWORD_KEY_LENGTH, PASSWORD_DIGEST)
    .toString('base64url');
  return `pbkdf2$${PASSWORD_ITERATIONS}$${salt}$${hash}`;
}

export function verifyPassword(password: string, storedHash: string | null) {
  if (!storedHash) return false;

  const [scheme, iterationsValue, salt, hash] = storedHash.split('$');
  const iterations = Number(iterationsValue);
  if (scheme !== 'pbkdf2' || !iterations || !salt || !hash) return false;

  const expected = Buffer.from(hash, 'base64url');
  const actual = crypto.pbkdf2Sync(password, salt, iterations, expected.length, PASSWORD_DIGEST);

  return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
}

export function createSessionToken(userId: string) {
  const payload: SessionPayload = {
    userId,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  };
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  return `${encodedPayload}.${sign(encodedPayload)}`;
}

export function verifySessionToken(token: string | undefined) {
  if (!token) return null;
  const [encodedPayload, signature] = token.split('.');
  if (!encodedPayload || !signature || sign(encodedPayload) !== signature) return null;

  try {
    const payload = JSON.parse(base64UrlDecode(encodedPayload)) as SessionPayload;
    if (!payload.userId || payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const session = verifySessionToken(token);
  if (!session) return null;

  return prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      email: true,
      name: true,
      plan: true,
      avatarUrl: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export function setSessionCookie(response: Response, userId: string) {
  response.headers.append(
    'Set-Cookie',
    [
      `${SESSION_COOKIE}=${createSessionToken(userId)}`,
      'Path=/',
      `Max-Age=${SESSION_TTL_SECONDS}`,
      'HttpOnly',
      'SameSite=Lax',
      process.env.NODE_ENV === 'production' ? 'Secure' : '',
    ].filter(Boolean).join('; ')
  );
}

export function clearSessionCookie(response: Response) {
  response.headers.append(
    'Set-Cookie',
    `${SESSION_COOKIE}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax`
  );
}
