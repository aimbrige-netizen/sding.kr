import { PosterCard } from './PosterCard';
import { VideoPlayer } from './VideoPlayer';
import { FEATURES } from '@/content/features';
import { MEDIA, mediaUrl, previewUrl, type Art, type ImageSpec, type MediaId, type MediaSpec } from '@/content/media';
import { COPY } from '@/content/site';
import { present } from '@/lib/media-files';

type Props = { id: MediaId; part?: 'before' | 'after'; priority?: boolean };

// 빌드할 때 멈춘다. 파일만 넣고 대체 텍스트를 빠뜨리거나, 폰 크롭을 반만 채우는 실수를 배포 전에 잡는다
function check(spec: MediaSpec, id: MediaId) {
  if (spec.kind === 'pair') {
    check(spec.before, id);
    check(spec.after, id);
    return;
  }
  if (spec.kind === 'video') {
    // 포스터 이미지가 없으면 재생 전 영상 자리에 보일 그림이 없다
    if (spec.src && !spec.poster) throw new Error(`MEDIA.${id}: 영상 주소가 있으면 poster도 있어야 한다`);
    return;
  }
  if (spec.desktop.file && !spec.alt.trim()) throw new Error(`MEDIA.${id}: 이미지 파일이 있으면 alt를 써야 한다`);
  if (spec.desktop.file && spec.phone && !spec.phone.file) throw new Error(`MEDIA.${id}: phone 크롭의 file이 비어 있다`);
}

// 파일 이름은 `${file}-${너비}.${avif|webp}`(scripts/media.mjs). 무료 요금제 사진은 /media/preview/에서 읽는다
function Picture({ spec, priority = false }: { spec: ImageSpec; priority?: boolean }) {
  const url = (art: Art, w: number, ext: 'avif' | 'webp') => {
    const name = `${art.file}-${w}.${ext}`;
    return spec.preview ? previewUrl(name) : mediaUrl(name);
  };
  const srcSet = (art: Art, ext: 'avif' | 'webp') => art.widths.map((w) => `${url(art, w, ext)} ${w}w`).join(', ');
  const { desktop, phone } = spec;
  const width = desktop.widths[desktop.widths.length - 1];
  const [rw, rh] = desktop.ratio.split('/').map(Number);
  const height = Math.round((width * rh) / rw);
  // 첫 화면 사진(LCP)은 먼저 받고, 나머지는 화면에 가까워질 때 받는다
  const load = priority
    ? ({ fetchPriority: 'high', decoding: 'auto' } as const)
    : ({ loading: 'lazy', decoding: 'async' } as const);
  return (
    <picture>
      {phone ? <source media="(max-width: 899px)" type="image/avif" srcSet={srcSet(phone, 'avif')} sizes={phone.sizes} /> : null}
      {phone ? <source media="(max-width: 899px)" type="image/webp" srcSet={srcSet(phone, 'webp')} sizes={phone.sizes} /> : null}
      <source type="image/avif" srcSet={srcSet(desktop, 'avif')} sizes={desktop.sizes} />
      {/* next/image를 쓰지 않는다: scripts/media.mjs가 미리 줄인 AVIF와 WebP를 picture로 고르고, 이미지 최적화 서버를 쓰지 않는다.
          @next/next/no-img-element는 picture 안의 img를 검사하지 않으므로 eslint-disable 주석을 두지 않는다 */}
      <img
        className="media-fill"
        src={url(desktop, width, 'webp')}
        srcSet={srcSet(desktop, 'webp')}
        sizes={desktop.sizes}
        width={width}
        height={height}
        alt={spec.alt}
        {...load}
      />
    </picture>
  );
}

// 영상과 이미지는 이 컴포넌트로만 넣는다(CLAUDE.md). 그릴 파일이 없으면 브랜드 포스터 카드를 그린다.
// 파일이 있는지는 present()만 정한다. file 문자열이 비었는지로 정하지 않는다(무료 요금제 사진은 이 PC에만 있다).
// 비율은 부모 프레임이 정하고, 슬롯은 프레임을 가득 채운다
export function MediaSlot({ id, part, priority = false }: Props) {
  const spec = MEDIA[id] as MediaSpec;   // satisfies가 좁힌 유니온을 넓힌다. 지금 없는 종류(video)도 다룬다
  check(spec, id);

  switch (spec.kind) {
    case 'pair':
      // 두 장이 모두 있어야 비교가 된다. 그 전에는 묶음 전체에 카드 하나를 그린다
      if (!part || !present(spec)) return <PosterCard />;
      return <Picture spec={spec[part]} />;
    case 'image':
      if (!present(spec)) return <PosterCard />;
      return <Picture spec={spec} priority={priority} />;
    case 'video': {
      if (!present(spec)) return <PosterCard />;
      // 재생 버튼이 페이지에 여럿이면 스크린리더 목록에서 구별되게 기능 이름을 붙인다
      const name = FEATURES.find((f) => f.id === id)?.feature ?? COPY.film.title;
      return (
        <VideoPlayer
          mediaId={id}
          src={spec.src}
          srcMobile={spec.srcMobile || undefined}
          poster={spec.poster}
          alt={spec.alt}
          captions={spec.captions || undefined}
          captionsLabel={COPY.film.captions}
          labels={{ play: `${name} ${COPY.film.play}`, pause: `${name} ${COPY.film.pause}` }}
          preload="none"
        />
      );
    }
  }
}
