/**
 * AI rate limit check — plan-based rate limiting for Scryve endpoints.
 * Returns a NextResponse if rate limited, null if allowed.
 */
import { NextResponse } from 'next/server';
import { rateLimits } from './rate-limit';

export async function checkAiRateLimit(user: { id: string; plan: string }): Promise<NextResponse | null> {
  const limitFn =
    user.plan === 'team' ? rateLimits.aiTeam
    : user.plan === 'pro' ? rateLimits.aiPro
    : rateLimits.aiFree;

  const { allowed, remaining, resetInSeconds } = await limitFn(user.id);

  if (!allowed) {
    return NextResponse.json(
      { error: 'AI rate limit exceeded. Please upgrade your plan or try again later.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(resetInSeconds),
          'X-RateLimit-Remaining': String(remaining),
        },
      }
    );
  }

  return null;
}
