import type { Metadata, Viewport } from 'next';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { assertCompany } from '@/content/company';
import { COPY, SITE } from '@/content/site';
import { FONT_SUBSET, preloadFontSubset } from '@/lib/fonts';
import './globals.css';

// 헤더 CTA가 모든 페이지에 있으므로 재생성 주기는 레이아웃에 둔다.
// 오픈일 0시(KST) 이후 첫 재생성에서 CTA가 'live'로 바뀐다(PLAN 'CTA 전환')
export const revalidate = 3600;

// 운영 빌드에서만 연락처 빈 값을 막는다(PLAN '푸터 회사 정보')
if (process.env.NEXT_PUBLIC_SITE_ENV === 'production') assertCompany();

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

// 등장 효과의 처음 상태는 JS가 켜졌을 때만 건다(PLAN 'JS 없이 보기'). 첫 페인트 전에 실행되도록 head에 둔다
const JS_FLAG = "document.documentElement.classList.add('js')";

export default function RootLayout({ children }: LayoutProps<'/'>) {
  preloadFontSubset(FONT_SUBSET.latin);
  return (
    // 'js' 클래스는 위 스크립트가 붙이므로 서버 HTML과 다르다
    <html lang="ko" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: JS_FLAG }} />
      </head>
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
