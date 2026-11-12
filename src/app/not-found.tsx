import type { Metadata } from 'next';
import Link from 'next/link';
import { COPY } from '@/content/site';

// 없는 주소에는 대표 주소도 공유 이미지도 없다. 레이아웃의 값을 물려받으면 canonical이 /_not-found가 된다.
// noindex는 Next가 404에 직접 넣는다. og:title과 twitter:card는 opengraph-image 파일이 남겨 지울 수 없지만 404라 공유되지 않는다
export const metadata: Metadata = {
  title: COPY.notFound.metaTitle,
  description: null,
  alternates: null,
  robots: null,
  openGraph: { images: [] },
  twitter: null,
};

// 없는 주소(PLAN '법적 페이지'). 제목, 한 줄 설명, 홈으로 가는 주 버튼만 둔다
export default function NotFound() {
  return (
    <main id="main" tabIndex={-1} className="nf outline-none">
      <div className="wrap nf-in">
        <h1 className="nf-title">{COPY.notFound.title}</h1>
        <p className="nf-lead">{COPY.notFound.lead}</p>
        <Link href="/" className="btn nf-home">{COPY.notFound.home}</Link>
      </div>
    </main>
  );
}
