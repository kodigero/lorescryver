import Link from 'next/link';

function QuillIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 19l7-7 3 3-7 7-3-3z" />
      <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
      <path d="M2 2l7.586 7.586" />
      <circle cx="11" cy="11" r="2" />
    </svg>
  );
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen">
      {/* Left panel — branding */}
      <div className="hidden w-1/2 flex-col justify-between bg-brand-900 p-12 lg:flex">
        <Link href="/" className="flex items-center gap-2">
          <QuillIcon className="h-7 w-7 text-brand-400" />
          <span className="text-xl font-bold tracking-tight text-white">
            Lore<span className="text-brand-400">Scryver</span>
          </span>
        </Link>

        <div className="max-w-md">
          <blockquote className="font-serif text-2xl font-light leading-relaxed text-white/90">
            &ldquo;Every great story begins with a single spark. LoreScryver
            gave me the forge to turn mine into a blaze.&rdquo;
          </blockquote>
          <p className="mt-4 text-sm text-brand-300">
            — LoreScryver editorial team
          </p>
        </div>

        <p className="text-xs text-brand-400/60">
          &copy; 2026 LoreScryver. All rights reserved.
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex w-full flex-col items-center justify-center px-6 py-12 lg:w-1/2">
        {/* Mobile logo */}
        <div className="mb-8 lg:hidden">
          <Link href="/" className="flex items-center gap-2">
            <QuillIcon className="h-7 w-7 text-brand-500" />
            <span className="text-xl font-bold tracking-tight">
              Lore<span className="text-brand-500">Scryver</span>
            </span>
          </Link>
        </div>

        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
