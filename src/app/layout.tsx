import type { Metadata } from 'next';
import { Inter, Merriweather } from 'next/font/google';
import '@/styles/globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const merriweather = Merriweather({
  subsets: ['latin'],
  weight: ['300', '400', '700', '900'],
  variable: '--font-serif',
});

export const metadata: Metadata = {
  title: 'LoreScryver — Narrative Authoring Platform',
  description:
    'The all-in-one platform for storytellers. Write and manage narrative for books, games, animation, video, and any medium with a story — from first spark to finished product.',
  openGraph: {
    title: 'LoreScryver — Narrative Authoring Platform',
    description:
      'From first spark to finished story. The complete authoring command center for books, games, animation, video, and beyond.',
    url: 'https://lorescryver.com',
    siteName: 'LoreScryver',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${merriweather.variable} min-h-screen bg-background font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
