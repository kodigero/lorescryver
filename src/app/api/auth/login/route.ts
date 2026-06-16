import { NextResponse } from 'next/server';
import { setSessionCookie, verifyPassword } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { authLoginSchema, validationError } from '@/lib/validation';
import { rateLimits } from '@/lib/rate-limit';

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const { allowed, remaining } = await rateLimits.login(ip);
  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many login attempts. Please try again later.' },
      { status: 429, headers: { 'Retry-After': '900', 'X-RateLimit-Remaining': String(remaining) } }
    );
  }

  const parsed = authLoginSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(validationError(), { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
    select: { id: true, email: true, name: true, plan: true, passwordHash: true },
  });

  if (!user || !verifyPassword(parsed.data.password, user.passwordHash)) {
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
  }

  const response = NextResponse.json({
    user: { id: user.id, email: user.email, name: user.name, plan: user.plan },
  });
  await setSessionCookie(response, user.id);
  return response;
}
