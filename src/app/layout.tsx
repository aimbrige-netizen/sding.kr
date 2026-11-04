import type { Metadata, Viewport } from 'next';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { StoreChoice } from '@/components/StoreChoice';
import { WaitlistDialog } from '@/components/WaitlistDialog';
import { WaitlistForm } from '@/components/WaitlistForm';
import { assertCompany, COMPANY } from '@/content/company';
import { STORE_LINE } from '@/content/faq';
import { assertLegal } from '@/content/legal';
import { COPY, SITE } from '@/content/site';
import { FONT_SUBSET, preloadFontSubset } from '@/lib/fonts';
import { ctaMode } from '@/lib/launch';
import './globals.css';

// 헤더 CTA가 모든 페이지에 있으므로 재생성 주기는 레이아웃에 둔다.
// 오픈일 0시(KST) 이후 첫 재생성에서 CTA가 'live'로 바뀐다(PLAN 'CTA 전환')
export const revalidate = 3600;

const production = process.env.NEXT_PUBLIC_SITE_ENV === 'production';

// 운영 빌드에서만 빈 값을 막는다. 연락처(PLAN '푸터 회사 정보')와 변호사 검토 뒤에 넣는 법적 페이지의 값(PLAN '법적 페이지')이다
if (production) {
  assertCompany();
  assertLegal();
}

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: SITE.title,
  description: SITE.description,
  // './'는 페이지마다 제 주소가 된다. '/'로 쓰면 /privacy, /terms의 대표 주소도 홈이 된다
  alternates: { canonical: './' },
  // 스테이징과 프리뷰는 색인하지 않는다. robots.ts도 같은 조건으로 막는다(PLAN '측정과 출시 점검')
  robots: production
    ? { index: true, follow: true, googleBot: { 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 } }
    : { index: false, follow: false },
  openGraph: {
    type: 'website', locale: 'ko_KR', siteName: COMPANY.brandName, url: './',
    // og:title과 og:description은 페이지의 title, description을 따른다. og:image는 src/app/opengraph-image.tsx가 만든다
  },
  twitter: { card: 'summary_large_image' },
  verification: {   // 값이 비어 있으면 태그를 넣지 않는다
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION || undefined,
    other: process.env.NEXT_PUBLIC_NAVER_VERIFICATION
      ? { 'naver-site-verification': process.env.NEXT_PUBLIC_NAVER_VERIFICATION }
      : undefined,
  },
};

export const viewport: Viewport = {
  width: 'device-width', initialScale: 1, themeColor: '#FFFAF6',
  // maximumScale, userScalable은 지정하지 않는다(확대 허용)
};

// 등장 효과의 처음 상태는 JS가 켜졌을 때만 건다(PLAN 'JS 없이 보기'). 첫 페인트 전에 실행되도록 head에 둔다.
// 해시 주소로 바로 들어오면 글꼴이 바뀌며 위쪽 높이가 줄어 부드러운 스크롤의 목적지가 어긋난다. 로드가 끝날 때까지는 바로 이동한다
const JS_FLAG = "(function(d){d.classList.add('js');"
  + "if(location.hash){d.style.scrollBehavior='auto';addEventListener('load',function(){d.style.scrollBehavior=''})}"
  + "})(document.documentElement)";

export default function RootLayout({ children }: LayoutProps<'/'>) {
  preloadFontSubset(FONT_SUBSET.latin);
  const mode = ctaMode();
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
        <WaitlistDialog title={COPY.cta[mode]} description={mode === 'live' ? [STORE_LINE] : COPY.final.lead}>
          {mode === 'live' ? <StoreChoice /> : <WaitlistForm />}
        </WaitlistDialog>
      </body>
    </html>
  );
}
