import type { MetadataRoute } from 'next';
import { COMPANY } from '@/content/company';

// theme_color는 오렌지, 주소창 색(viewport.themeColor)은 크림이다. 의도한 차이다(PLAN '아이콘과 공유 이미지')
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: COMPANY.brandName, short_name: COMPANY.brandName, start_url: '/', display: 'browser',
    theme_color: '#FF5416', background_color: '#FFFAF6',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
