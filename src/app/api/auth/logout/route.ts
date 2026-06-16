import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { clearSessionCookie, verifySessionToken } from '@/lib/auth';
import { SESSION_COOKIE } from '@/lib/auth-shared';
import { redis } from '@/lib/redis';

export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const session = verifySessionToken(token);
  
  if (session?.sessionId) {
    await redis.del(`session:${session.sessionId}`);
  }

  const response = NextResponse.json({ data: { success: true } });
  clearSessionCookie(response);
  return response;
}
