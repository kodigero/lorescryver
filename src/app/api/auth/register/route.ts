import { NextResponse } from 'next/server';
import { hashPassword, setSessionCookie } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { authRegisterSchema, validationError } from '@/lib/validation';

export async function POST(request: Request) {
  const parsed = authRegisterSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(validationError(), { status: 400 });
  }

  try {
    const user = await prisma.user.create({
      data: {
        email: parsed.data.email,
        name: parsed.data.name || null,
        passwordHash: hashPassword(parsed.data.password),
      },
      select: { id: true, email: true, name: true, plan: true },
    });

    const response = NextResponse.json({ user }, { status: 201 });
    setSessionCookie(response, user.id);
    return response;
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002') {
      return NextResponse.json({ error: 'Email is already registered' }, { status: 409 });
    }

    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}
