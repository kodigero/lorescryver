import Link from 'next/link';
import { ScryveIcon as QuillIcon } from '@/components/icons';

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
