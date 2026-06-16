import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  images: {
    remotePatterns: [
      // Add specific domains as needed (e.g., CDN, avatar service)
      // Never use hostname: '**' — it's an SSRF risk
      { protocol: 'https', hostname: 'lorescryver.com' },
      { protocol: 'https', hostname: '*.lorescryver.com' },
    ],
  },
};

export default nextConfig;
