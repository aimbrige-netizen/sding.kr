import type { MetadataRoute } from 'next';
import { SITE } from '@/content/site';

// 페이지는 이 세 주소뿐이다(PLAN '크롤러와 색인 파일').
// lastmod는 넣지 않는다. 빌드 시각은 페이지가 실제로 바뀐 날이 아니다
export default function sitemap(): MetadataRoute.Sitemap {
  return ['/', '/privacy', '/terms'].map((path) => ({ url: `${SITE.url}${path}` }));
}
