import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
      },
      {
        protocol: 'https',
        hostname: 'pub-883bddd7b835432581437fc880cb8220.r2.dev',
      },
    ],
  },
  async headers() {
    const securityHeaders = [
      { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
      { key: 'Permissions-Policy', value: 'geolocation=(), microphone=(), camera=(), interest-cohort=()' },
      { key: 'X-XSS-Protection', value: '0' },
      {
        key: 'Content-Security-Policy',
        value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com https://vercel.live https://js.stripe.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' blob: data: https://images.unsplash.com https://api.dicebear.com https://*.r2.dev https://pub-883bddd7b835432581437fc880cb8220.r2.dev; font-src 'self' data: https://fonts.gstatic.com https://vercel.live; connect-src 'self' http://127.0.0.1:8000 http://localhost:8000 https://lttg-website-production.up.railway.app https://*.r2.dev https://*.r2.cloudflarestorage.com https://api.stripe.com https://m.stripe.network; frame-src 'self' https://js.stripe.com https://hooks.stripe.com https://vercel.live https://www.youtube.com https://*.vercel.app https://www.upperhandzim.com https://www.moversklub.co.za https://www.preciagro.com https://www.nexnetcyberlab.com https://zimcelebsofficial.com https://www.zimcelebsofficial.com; media-src 'self' blob: https://*.r2.dev https://pub-883bddd7b835432581437fc880cb8220.r2.dev; object-src 'none';"
      },
    ];

    const assetCaching = [
      {
        key: 'Cache-Control',
        value: 'public, max-age=0, s-maxage=31536000, stale-while-revalidate=86400',
      },
    ];

    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
      {
        source: '/:all*(js|css|svg|png|jpg|jpeg|gif|webp|ico|ttf|woff|woff2)',
        headers: [...securityHeaders, ...assetCaching],
      },
    ];
  },
};

export default nextConfig;
