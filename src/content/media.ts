// 슬롯 사양은 docs/PLAN.md '미디어 슬롯 사양'(v2.0)을 따른다. 파일이 없으면 MediaSlot이 브랜드 포스터 카드를 그린다.
// 이미지는 scripts/media.mjs가 미리 줄인 AVIF와 WebP다. 파일 이름은 `${file}-${width}.${avif|webp}`이고,
// 원본을 바꾸면 버전(v1 → v2)을 올린다. /media/*는 1년 immutable 캐시다(next.config.ts). 미리보기 파일도 버전을 붙인다.
// 파일이 있는지는 src/lib/media-files.ts가 빌드할 때 정한다. 이 파일은 값만 두고 fs를 읽지 않는다(클라이언트의 타입 import와 jiti 스크립트가 읽는다)
export type Ratio = '16/9' | '4/3' | '9/10' | '4/5' | '3/4';
// 한 크롭의 파일 묶음. ratio는 파일의 비율이고 상자의 비율은 CSS가 정한다
export type Art = { file: string; widths: readonly number[]; ratio: Ratio; sizes: string };
// preview: 상업적으로 쓸 수 없는 무료 요금제 사진. public/media/preview/(git 제외)에만 있어 git에서 만든 빌드는 포스터 카드를 그린다
export type ImageSpec = { kind: 'image'; alt: string; ai: boolean; preview?: true; desktop: Art; phone?: Art };   // phone은 899px 이하의 다른 크롭
export type VideoSpec = {
  kind: 'video'; src: string; srcMobile?: string; poster: string; alt: string; ai: boolean;
  captions?: string; transcript?: string; description?: string; uploadDate?: string; duration?: string; youtube?: string;   // 뒤 네 개는 구조화 데이터용
};
export type PairSpec = { kind: 'pair'; before: ImageSpec; after: ImageSpec };   // 둘 다 있어야 비교가 나온다
export type MediaSpec = ImageSpec | VideoSpec | PairSpec;

const M = process.env.NEXT_PUBLIC_MEDIA_BASE || '/media';
export const mediaUrl = (file: string) => `${M}/${file}`;
export const previewUrl = (file: string) => `/media/preview/${file}`;   // 이 PC에서만 쓴다. NEXT_PUBLIC_MEDIA_BASE를 따르지 않는다

// 비교 사진 한 장의 폭: 1320px 이상 612px, 900px 이상 (100vw - 80 - 16) / 2, 폰 (100vw - 40 - 10) / 2
const PAIR_SIZES = '(min-width: 1320px) 612px, (min-width: 900px) calc(50vw - 48px), calc(50vw - 25px)';

export const MEDIA = {
  // AI 예시 사진(Fish Audio 무료 요금제, Seedream). TODO(ai-image-rights): 상업적으로 쓸 수 없어 커밋하지 않는다(public/media/preview/만).
  // 유료 요금제로 다시 만들면 media.mjs --licensed로 v2 이름을 public/media/에 넣어 커밋하고 preview를 지운다
  hero: { kind: 'image', ai: true, preview: true, alt: '흰 스튜디오에서 주황색 꽃다발을 들고 웃는 신랑과 신부',
    desktop: { file: 'hero-d.v1', widths: [1280, 1920, 2560], ratio: '16/9', sizes: '100vw' },
    phone: { file: 'hero-m.v1', widths: [640, 960, 1152], ratio: '4/5', sizes: '100vw' } },
  price: { kind: 'image', ai: true, preview: true, alt: '드레스, 반지, 부케, 청첩장, 턱시도에 같은 모양의 빈 가격표가 걸린 흰 쇼룸',
    desktop: { file: 'price-d.v1', widths: [1280, 1920, 2560], ratio: '16/9', sizes: '100vw' },
    phone: { file: 'price-m.v1', widths: [640, 960, 1280], ratio: '4/3', sizes: '100vw' } },
  planner: { kind: 'image', ai: true, preview: true, alt: '소파에 앉아 휴대폰 하나를 함께 보며 웃는 커플',
    desktop: { file: 'planner-d.v1', widths: [960, 1296], ratio: '9/10', sizes: '58.34vw' },
    phone: { file: 'planner-m.v1', widths: [640, 960, 1152], ratio: '4/5', sizes: '100vw' } },
  // TODO(dress-media): 라이선스가 있는 요금제(힉스필드 유료 또는 Fish Plus)로 만든 뒤 넣는다. 무료 요금제로는 만들지 않는다.
  // 같은 사람, 같은 자세, 옷만 바뀐 3:4 두 장. alt는 실제 사진을 보고 쓴다
  // TODO(zone3-rights): AI 인물이 실존 인물과 닮지 않았는지, 드레스 브랜드가 보이지 않는지 확인하기 전에는 파일을 넣지 않는다
  dress: { kind: 'pair',
    before: { kind: 'image', ai: true, alt: '', desktop: { file: '', widths: [480, 720, 960, 1224], ratio: '3/4', sizes: PAIR_SIZES } },
    after: { kind: 'image', ai: true, alt: '', desktop: { file: '', widths: [480, 720, 960, 1224], ratio: '3/4', sizes: PAIR_SIZES } } },
  // TODO(hall-media): 라이선스가 있는 요금제로 만든 16:9 이미지, 나중에 영상(kind: 'video'). 무료 요금제로는 만들지 않는다. 영상으로 바꾸면 features.ts의 hall.notice도 바꾼다
  // TODO(zone4-hall): 실존 웨딩홀로 보이지 않는지 확인하기 전에는 파일을 넣지 않는다
  hall: { kind: 'image', ai: true, alt: '', desktop: { file: '', widths: [960, 1280, 1920, 2560], ratio: '16/9', sizes: '100vw' } },
} satisfies Record<string, MediaSpec>;

export type MediaId = keyof typeof MEDIA;   // 'hero' | 'price' | 'planner' | 'dress' | 'hall'. 분석 이벤트의 media_id와 같다
