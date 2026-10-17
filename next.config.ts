import type { NextConfig } from 'next';

/* Static export for GitHub Pages: `npm run build` writes out/ and scripts/export-docs.mjs
   copies it to docs/, which Pages serves. trailingSlash gives every route its own
   folder/index.html, so deep links and reloads work on Pages. */
const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  // The demo starts timers (auction, valuation) when a screen mounts; StrictMode's
  // double mount in dev would run them twice.
  reactStrictMode: false,
};

export default nextConfig;
