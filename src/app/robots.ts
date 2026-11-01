import type { MetadataRoute } from 'next';
import { SITE } from '@/content/site';

// AI 크롤러는 모두 허용하고 봇마다 규칙을 따로 쓴다(PLAN '크롤러와 색인 파일')
const BOTS = ['Yeti', 'GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-SearchBot',
  'Claude-User', 'PerplexityBot', 'Perplexity-User', 'Google-Extended'];

export default function robots(): MetadataRoute.Robots {
  if (process.env.NEXT_PUBLIC_SITE_ENV !== 'production') {
    return { rules: { userAgent: '*', disallow: '/' } };   // 스테이징·프리뷰는 색인 금지
  }
  const rule = (userAgent: string) => ({ userAgent, allow: '/', disallow: '/api/' });
  return { rules: ['*', ...BOTS].map(rule), sitemap: `${SITE.url}/sitemap.xml` };
}
