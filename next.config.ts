import type { NextConfig } from 'next';

const immutable = [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }];

const nextConfig: NextConfig = {
  // Cache Components는 켜지 않는다. 켜면 page.tsx의 revalidate를 쓸 수 없어 CTA 전환(PLAN 'CTA 전환')이 막힌다
  turbopack: {
    rules: {
      '*.css': {
        loaders: ['@tailwindcss/turbopack'],
        as: '*.css',
      },
    },
  },
  async headers() {
    return [
      { source: '/media/:path*', headers: immutable },   // 파일명에 버전을 넣어 교체한다
      { source: '/fonts/:path*', headers: immutable },
      { source: '/:path*', headers: [
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      ] },
    ];
  },
};

export default nextConfig;
