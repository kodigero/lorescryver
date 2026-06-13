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
  title: 'LoreScryver — Fiction Authoring Platform',
  description:
    'The all-in-one platform for fiction writers. From first spark to published book — worldbuilding, drafting, editing, formatting, and publishing in one place.',
  openGraph: {
    title: 'LoreScryver — Fiction Authoring Platform',
    description:
      'From first spark to published book. The complete authoring command center for fiction writers.',
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
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${merriweather.variable} min-h-screen bg-background font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
