import type { Metadata } from 'next';
import Link from 'next/link';
import { Sparkle, ZONE_ICONS } from '@/components/Icons';
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

// 파크 지도의 길이 끊긴 그림. 길 모양은 ParkMap의 .road를 그대로 쓴다
const ROADS = [
  { kind: 'wide', view: '0 0 1600 300', path: 'M-60 232C170 120 340 276 560 214S880 58 1040 132' },
  { kind: 'tall', view: '0 0 800 400', path: 'M-60 306C90 176 230 346 400 276S520 150 600 150' },
];

export default function NotFound() {
  const MapIcon = ZONE_ICONS.map;
  return (
    <main id="main" tabIndex={-1} className="nf outline-none">
      <div className="nf-in">
        <span className="intro-ico nf-mark" aria-hidden="true"><MapIcon /></span>
        <h1 className="nf-title">{COPY.notFound.title}</h1>
        <p className="nf-lead">{COPY.notFound.lead}</p>
        <Link href="/" className="btn-primary nf-home">
          {COPY.notFound.home}
          <span className="btn-orb" aria-hidden="true"><Sparkle /></span>
        </Link>
      </div>
      <div className="nf-road" aria-hidden="true">
        {ROADS.map((road) => (
          <svg key={road.kind} className={`road road-${road.kind}`} viewBox={road.view} preserveAspectRatio="none" focusable="false">
            <path className="road-edge" d={road.path} />
            <path className="road-lane" d={road.path} />
            <path className="road-dots" d={road.path} />
          </svg>
        ))}
        <Sparkle className="nf-spark" />
      </div>
    </main>
  );
}
