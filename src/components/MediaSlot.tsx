import type { ReactNode } from 'react';
import { preload } from 'react-dom';
import { ParkMap } from './ParkMap';
import { RidePreview } from './RidePreview';
import { VideoPlayer } from './VideoPlayer';
import { ZonePoster } from './ZonePoster';
import { MEDIA, type MediaSpec } from '@/content/media';
import { COPY } from '@/content/site';
import { ZONES } from '@/content/zones';

type VideoSpec = Extract<MediaSpec, { kind: 'video' }>;
type ImageSpec = Extract<MediaSpec, { kind: 'image' }>;

const labels = { play: COPY.film.play, pause: COPY.film.pause };

function VideoSlot({ spec, hero, art }: { spec: VideoSpec; hero: boolean; art: ReactNode }) {
  // 소개 영상은 파일이 오기 전에도 같은 재생 버튼으로 포스터 카드의 라이드를 보여 준다
  if (!spec.src) return hero ? <RidePreview labels={labels}>{art}</RidePreview> : art;
  // 포스터 윗부분이 첫 화면에 보이므로 지연 로드하지 않고 먼저 받는다(PLAN '성능과 접근성 기준'의 LCP)
  if (hero && spec.poster) preload(spec.poster, { as: 'image', fetchPriority: 'high' });
  return (
    <VideoPlayer
      src={spec.src}
      srcMobile={spec.srcMobile || undefined}
      poster={spec.poster || undefined}
      alt={spec.alt}
      hasAudio={spec.hasAudio}
      captions={spec.captions || undefined}
      captionsLabel={COPY.film.captions}
      labels={labels}
      preload={hero ? 'auto' : 'none'}
      priority={hero}
    >
      {spec.poster ? null : art}
    </VideoPlayer>
  );
}

function ImageSlot({ spec, art }: { spec: ImageSpec; art: ReactNode }) {
  if (!spec.src) return art;
  // eslint-disable-next-line @next/next/no-img-element -- 존 이미지는 슬롯 사양의 크기로 미리 줄여 올린다
  return <img className="media-fill" src={spec.src} alt={spec.alt} loading="lazy" decoding="async" />;
}

// 영상과 이미지는 이 컴포넌트로만 넣는다. 주소가 비어 있으면 브랜드 포스터 카드를 그린다.
// 비율(aspect-ratio)은 부모가 정하고, 슬롯은 부모를 가득 채운다
export function MediaSlot({ id }: { id: keyof typeof MEDIA }) {
  const spec = MEDIA[id] as MediaSpec;   // 지금 없는 종류(image)도 다루도록 넓혀 둔다
  const zone = ZONES.find((z) => z.media === id);
  const art = zone ? <ZonePoster zone={zone} /> : <ParkMap label={MEDIA.hero.alt} />;

  switch (spec.kind) {
    case 'video':
      return <VideoSlot spec={spec} hero={id === 'hero'} art={art} />;
    case 'image':
      return <ImageSlot spec={spec} art={art} />;
    case 'phone':
      return (
        <div className="phone">
          <div className="phone-screen">
            {spec.screen.kind === 'video'
              ? <VideoSlot spec={spec.screen} hero={false} art={art} />
              : <ImageSlot spec={spec.screen} art={art} />}
          </div>
        </div>
      );
    case 'compare':
      // 비교 화면의 조작과 'AI 합성' 라벨은 3단계 Zone에서 정한다
      if (!spec.before || !spec.after) return art;
      return (
        <div className="compare" role="img" aria-label={spec.alt}>
          {/* eslint-disable-next-line @next/next/no-img-element -- 비교 이미지는 슬롯 사양의 크기로 올린다 */}
          <img src={spec.before} alt="" loading="lazy" decoding="async" />
          {/* eslint-disable-next-line @next/next/no-img-element -- 위와 같다 */}
          <img src={spec.after} alt="" loading="lazy" decoding="async" />
        </div>
      );
  }
}
