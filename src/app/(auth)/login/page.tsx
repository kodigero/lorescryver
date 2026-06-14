'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        setError(body?.error || 'Sign in failed');
        return;
      }

      router.push('/dashboard');
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sign in to continue your story.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-white/10 dark:bg-white/5"
          />
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
          </div>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Password"
              autoComplete="current-password"
              className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-white/10 dark:bg-white/5"
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground"
            >
              <EyeIcon className="h-4 w-4" />
            </button>
          </div>
        </div>

        {error && (
          <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-500 dark:text-red-300">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading || !email || !password}
          className="flex h-10 w-full items-center justify-center rounded-lg bg-brand-600 text-sm font-semibold text-white shadow-lg shadow-brand-600/25 transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{' '}
        <Link
          href="/register"
          className="font-medium text-brand-500 transition hover:text-brand-400"
        >
          Create one
        </Link>
      </p>
    </>
  );
}
