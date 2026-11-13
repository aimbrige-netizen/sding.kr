// 슬롯 사양은 docs/PLAN.md '미디어 슬롯 사양'(v2.1)을 따른다. 파일이 없으면 MediaSlot이 브랜드 포스터 카드를 그린다.
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
  // AI 예시 사진. 힉스필드 Ultra 요금제로 2026-11-12(UTC)에 만들었다. 약관은 상업적 이용을 제한하지 않고 보이는 워터마크가 없다.
  // 남은 질문 둘은 TODO(ai-image-rights)에 있다. 원본, job id, 해시는 git 밖의 docs/private/media-masters/higgsfield/manifest.json에 있고,
  // 사이트 파일은 media.mjs --licensed로 만든다. alt 여섯 개는 승인 전 초안이다. TODO(hero-copy)
  // 히어로 상자가 16:9보다 좁으면 사진은 상자 높이에 맞춰 화면 폭보다 넓게 그려지므로 sizes가 그 폭을 따른다.
  // 상자 높이는 화면 높이이고, 가로세로 비가 50/39(약 1.28)보다 좁은 창에서는 폭의 78%다(hero.css). 0.78 × 16/9 = 138.67vw
  hero: { kind: 'image', ai: true, alt: '흰 스튜디오에서 함께 웃는 신랑과 주황색 꽃다발을 든 신부',
    desktop: { file: 'hero-d.v2', widths: [1280, 1920, 2560], ratio: '16/9', sizes: '(max-aspect-ratio: 50/39) 138.67vw, (max-aspect-ratio: 16/9) calc(100vh * 16 / 9), 100vw' },
    phone: { file: 'hero-m.v2', widths: [640, 960, 1152], ratio: '4/5', sizes: '100vw' } },
  price: { kind: 'image', ai: true, alt: '드레스와 턱시도, 부케에 주황 끈으로 빈 가격표를 단 흰 쇼룸',
    desktop: { file: 'price-d.v2', widths: [1280, 1920, 2560], ratio: '16/9', sizes: '100vw' },
    phone: { file: 'price-m.v2', widths: [640, 960, 1280], ratio: '4/3', sizes: '100vw' } },
  planner: { kind: 'image', ai: true, alt: '소파에 앉아 휴대폰 하나를 함께 보며 웃는 커플',
    desktop: { file: 'planner-d.v2', widths: [960, 1296], ratio: '9/10', sizes: '58.34vw' },
    phone: { file: 'planner-m.v2', widths: [640, 960, 1152], ratio: '4/5', sizes: '100vw' } },
  // 같은 사람, 같은 자세, 옷만 바뀐 3:4 두 장(쌍 A). 드레스 브랜드는 보이지 않는다(2026-11-13 검토).
  // 대표가 2026-11-13에 이 쌍으로 커밋을 승인했다(실존 인물과 닮았는지 확인을 요청한 뒤). 합성 사진 파일 안에는 'AI 합성'을 새기지 않는다
  dress: { kind: 'pair',
    before: { kind: 'image', ai: true, alt: '회색 스튜디오에서 흰 티셔츠와 연한 청바지 차림으로 웃으며 서 있는 여성',
      desktop: { file: 'dress-before.v1', widths: [480, 720, 960, 1224], ratio: '3/4', sizes: PAIR_SIZES } },
    after: { kind: 'image', ai: true, alt: '옷만 긴 아이보리 레이스 웨딩드레스로 바뀐 같은 여성',
      desktop: { file: 'dress-after.v1', widths: [480, 720, 960, 1224], ratio: '3/4', sizes: PAIR_SIZES } } },
  // 16:9 사진. 표지판과 글자는 없다(2026-11-13 검토). 대표가 2026-11-13에 이 사진으로 커밋을 승인했다.
  // TODO(hall-media): 걷는 영상(kind: 'video')은 원본의 C2PA를 지키는 방법을 정한 뒤 넣는다. 영상으로 바꾸면 features.ts의 hall.notice도 바꾼다
  hall: { kind: 'image', ai: true, alt: '양옆에 흰 꽃과 주황 꽃 장식이 놓인 흰 버진로드와 크리스털 샹들리에가 켜진 빈 웨딩홀',
    desktop: { file: 'hall.v1', widths: [960, 1280, 1920, 2560], ratio: '16/9', sizes: '100vw' } },
} satisfies Record<string, MediaSpec>;

export type MediaId = keyof typeof MEDIA;   // 'hero' | 'price' | 'planner' | 'dress' | 'hall'. 분석 이벤트의 media_id와 같다
