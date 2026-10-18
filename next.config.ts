import { withSentryConfig } from '@sentry/nextjs';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
        port: '',
        pathname: '**',
      },
    ],
  },
};

export default withSentryConfig(nextConfig, {
  silent: true,
  org: 'myd-71',
  project: 'javascript-nextjs',
  widenClientFileUpload: true,
  disableLogger: true,
});
