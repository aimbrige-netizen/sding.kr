import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { assertCompany } from '@/content/company';
import { COPY, SITE } from '@/content/site';
import './globals.css';

// 헤더 CTA가 모든 페이지에 있으므로 재생성 주기는 레이아웃에 둔다.
// 오픈일 0시(KST) 이후 첫 재생성에서 CTA가 'live'로 바뀐다(PLAN 'CTA 전환')
export const revalidate = 3600;

// 운영 빌드에서만 연락처 빈 값을 막는다(PLAN '푸터 회사 정보')
if (process.env.NEXT_PUBLIC_SITE_ENV === 'production') assertCompany();

const pretendard = localFont({
  src: '../../public/fonts/PretendardVariable.woff2',
  weight: '45 920',
  display: 'swap',
  preload: false,   // 2MB 전체 파일이라 첫 화면 요청과 대역폭을 다투지 않게 한다. TODO(font-subset)
  variable: '--font-pretendard',
});

// 공유·검색 메타 태그는 4단계에서 채운다
export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: SITE.title,
  description: SITE.description,
};

export const viewport: Viewport = {
  width: 'device-width', initialScale: 1, themeColor: '#FFFAF6',
  // maximumScale, userScalable은 지정하지 않는다(확대 허용)
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="ko" data-scroll-behavior="smooth" className={pretendard.variable}>
      <body>
        <a
          href="#main"
          className="sr-only z-50 rounded-pill bg-ink-900 font-bold text-white focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:px-5 focus:py-3"
        >
          {COPY.skipLink}
        </a>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
