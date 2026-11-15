// 슬롯 사양은 docs/PLAN.md '미디어 슬롯 사양'(v2.2)을 따른다. 파일이 없으면 MediaSlot이 브랜드 포스터 카드를 그린다.
// 이미지는 scripts/media.mjs가 미리 줄인 AVIF와 WebP다. 파일 이름은 `${file}-${width}.${avif|webp}`이고,
// 원본을 바꾸면 버전(v1 → v2)을 올린다. /media/*는 1년 immutable 캐시다(next.config.ts). 미리보기 파일도 버전을 붙인다.
// 파일이 있는지는 src/lib/media-files.ts가 빌드할 때 정한다. 이 파일은 값만 두고 fs를 읽지 않는다(클라이언트의 타입 import와 jiti 스크립트가 읽는다)
export type Ratio = `${number}/${number}`;   // 파일의 정확한 비율. 크롭 상자를 이 비율로 맞춰 자른다(scripts/media.mjs)
// 한 크롭의 파일 묶음. ratio는 파일의 비율이고 상자의 비율은 CSS가 정한다
export type Art = { file: string; widths: readonly number[]; ratio: Ratio; sizes: string };
// preview: 상업적으로 쓸 수 없는 무료 요금제 사진. public/media/preview/(git 제외)에만 있어 git에서 만든 빌드는 포스터 카드를 그린다
export type ImageSpec = { kind: 'image'; alt: string; ai: boolean; preview?: true; desktop: Art; phone?: Art };   // phone은 899px 이하의 다른 크롭
export type VideoSpec = {
  kind: 'video'; src: string; srcMobile?: string; poster: string; posterSize?: readonly [number, number]; alt: string; ai: boolean;
  captions?: string; transcript?: string; description?: string; uploadDate?: string; duration?: string; youtube?: string;   // 뒤 네 개는 구조화 데이터용
};
export type PairSpec = { kind: 'pair'; before: ImageSpec; after: ImageSpec };   // 둘 다 있어야 비교가 나온다
export type MediaSpec = ImageSpec | VideoSpec | PairSpec;

const M = process.env.NEXT_PUBLIC_MEDIA_BASE || '/media';
export const mediaUrl = (file: string) => `${M}/${file}`;
export const previewUrl = (file: string) => `/media/preview/${file}`;   // 이 PC에서만 쓴다. NEXT_PUBLIC_MEDIA_BASE를 따르지 않는다

// 데스크톱 장면 사진은 머리글 아래 화면 높이(100vh - 머리글 - 흰 막 줄 40px)를 채운다. 1440x900은 100vw를 넘지 않는다.
// 세로로 긴 창(가로세로 비 5/4 이하)은 사진 높이가 폭의 60%로 묶여(scene.css) 16:9 사진이 60vw x 16/9 = 106.67vw로 그려진다
const SHOT_SIZES = '(max-aspect-ratio: 5/4) 107vw, 100vw';
// 첫 화면 무대의 높이는 폭의 78%를 넘지 않는다(hero.css). 가로세로 비 50/39 미만의 창에서는 16:9 사진이 0.78 x 16/9 = 138.67vw로 그려진다
const HERO_SIZES = '(max-aspect-ratio: 50/39) 138.67vw, 100vw';
// 드레스 비교 한 장: 데스크톱은 고정 장면 높이에 3/4을 곱한 폭으로 그려지고(양옆이 잘린다), 세로로 긴 창은 그 높이가 60vw라 45vw, 폰은 화면 폭의 절반이다
const PAIR_SIZES = '(min-width: 900px) and (max-aspect-ratio: 5/4) 45vw, (min-width: 900px) calc((100vh - 112px) * 3 / 4), 50vw';

export const MEDIA = {
  // AI 예시 사진. 힉스필드 Ultra 요금제로 2026-11-12(UTC)에 만들었다. 약관은 상업적 이용을 제한하지 않고 보이는 워터마크가 없다.
  // 남은 질문 둘은 TODO(ai-image-rights)에 있다. 원본, job id, 해시는 git 밖의 docs/private/media-masters/higgsfield/manifest.json에 있고,
  // 사이트 파일은 media.mjs --licensed로 만든다. alt는 승인 전 초안이다. TODO(hero-copy)
  // 폰 첫 화면은 사진이 먼저 오고 아래쪽이 흰 바탕으로 녹아든 자리에 날짜와 제목이 앉는다(2/3, hero-m.v3).
  // 가로로 든 폰(가로세로 비 4/3 이상)은 사진이 머리글 아래 화면 높이로 오른쪽에 서서 (100vh - 60px) x 2/3 폭이다(hero.css)
  hero: { kind: 'image', ai: true, alt: '흰 스튜디오에서 함께 웃는 신랑과 주황색 꽃다발을 든 신부',
    desktop: { file: 'hero-d.v2', widths: [1280, 1920, 2560], ratio: '16/9', sizes: HERO_SIZES },
    phone: { file: 'hero-m.v3', widths: [640, 960, 1024], ratio: '2/3', sizes: '(min-aspect-ratio: 4/3) calc((100vh - 60px) * 2 / 3), 100vw' } },
  // 폰 크롭(4/5)은 옷걸이의 드레스와 턱시도만 보인다. alt는 두 크롭에 모두 맞는 말만 쓴다(데스크톱의 부케는 디테일 컷이 따로 말한다)
  price: { kind: 'image', ai: true, alt: '드레스와 턱시도에 주황 끈으로 빈 가격표를 단 흰 쇼룸',
    desktop: { file: 'price-d.v2', widths: [1280, 1920, 2560], ratio: '16/9', sizes: SHOT_SIZES },
    phone: { file: 'price-m.v3', widths: [640, 960, 1080], ratio: '4/5', sizes: '100vw' } },
  planner: { kind: 'image', ai: true, alt: '소파에 앉아 휴대폰 하나를 함께 보며 웃는 커플',
    desktop: { file: 'planner-d.v3', widths: [1280, 1920, 2560], ratio: '16/9', sizes: SHOT_SIZES },
    phone: { file: 'planner-m.v3', widths: [640, 960, 1152], ratio: '4/5', sizes: '100vw' } },
  // 같은 사람, 같은 자세, 옷만 바뀐 두 장(쌍 A). 데스크톱은 전신 3:4, 폰은 같은 상자로 머리부터 무릎 아래까지 자른 3:5다.
  // 대표가 2026-11-13에 이 쌍으로 커밋을 승인했다(실존 인물과 닮았는지 확인을 요청한 뒤). 합성 사진 파일 안에는 'AI 합성'을 새기지 않는다
  dress: { kind: 'pair',
    before: { kind: 'image', ai: true, alt: '회색 스튜디오에서 흰 티셔츠와 연한 청바지 차림으로 웃으며 서 있는 여성',
      desktop: { file: 'dress-before.v1', widths: [480, 720, 960, 1224], ratio: '3/4', sizes: PAIR_SIZES },
      phone: { file: 'dress-before-m.v1', widths: [480, 720, 960], ratio: '3/5', sizes: PAIR_SIZES } },
    after: { kind: 'image', ai: true, alt: '옷만 긴 아이보리 레이스 웨딩드레스로 바뀐 같은 여성',
      desktop: { file: 'dress-after.v1', widths: [480, 720, 960, 1224], ratio: '3/4', sizes: PAIR_SIZES },
      phone: { file: 'dress-after-m.v1', widths: [480, 720, 960], ratio: '3/5', sizes: PAIR_SIZES } } },
  // 걷는 영상(v2.2). 힉스필드 원본 바이트 그대로다(1280x720, 5.04초, 소리 없음, C2PA 매니페스트 포함, faststart 아님). 다시 인코딩하지 않는다.
  // 포스터는 첫 프레임이고 동작 줄이기의 정지 화면이다. 웨딩홀 A(hall-a)의 입구에서 시작한다. TODO(hall-media): 1080p, 10~15초, faststart로 다시 만들지
  // 포스터 v2는 첫 프레임을 BT.709로 풀었다. 색 정보가 없는 영상을 Chrome이 BT.709로 그리므로 포스터가 걷힐 때 색이 바뀌지 않는다(v1은 BT.601)
  hall: { kind: 'video', ai: true, src: mediaUrl('hall-walk.v1.mp4'), poster: mediaUrl('hall-walk-poster.v2-1280.webp'), posterSize: [1280, 720],
    alt: '웨딩홀 입구에서 흰 버진로드를 따라 무대 쪽으로 천천히 걸어 들어가는 장면' },
  // 데스크톱 웨딩홀 장면의 고정 사진(16:9). 걷는 영상과 다른 홀(hall-c)이다. 폰에서는 그리지 않는다(영상이 장면의 첫 화면)
  hallShot: { kind: 'image', ai: true, alt: '둥근 크리스털 샹들리에 아래 흰 버진로드 양옆으로 흰 꽃과 주황 꽃이 길게 놓인 빈 웨딩홀',
    desktop: { file: 'hall-d.v1', widths: [1280, 1920, 2560], ratio: '16/9', sizes: SHOT_SIZES } },
  // 마지막 장면(출시 알림)의 사진. 데스크톱은 무대(최대 700px 높이) 위 왼쪽에 제목(1280px 미만은 무대 오른쪽 절반의 사진 옆), 폰은 6:5 상자다.
  // 폰 파일 v2는 그 6:5 상자에 보이는 자리만 자른다(v1은 4:5라 3분의 1이 보이지 않았다)
  final: { kind: 'image', ai: true, alt: '흰 스튜디오에서 마주 보고 웃는 신랑과 주황색 꽃다발을 든 신부',
    desktop: { file: 'final-d.v1', widths: [1280, 1920, 2560], ratio: '16/9', sizes: '100vw' },
    phone: { file: 'final-m.v2', widths: [640, 960, 1152], ratio: '6/5', sizes: '100vw' } },
} satisfies Record<string, MediaSpec>;

export type MediaId = keyof typeof MEDIA;   // 'hero' | 'price' | 'planner' | 'dress' | 'hall' | 'hallShot' | 'final'. 분석 이벤트의 media_id와 같다

// 디테일 컷(v2.2). 장면의 흰 막에 한 줄로 놓이는 작은 사진들이다. 포스터 카드를 그리지 않는다(PLAN '미디어 슬롯 사양').
// 줄을 그리지 않는 것은 MEDIA_PREVIEW=off(포스터 상태)뿐이다. 라이선스 파일은 디스크를 보지 않으므로(media-files.ts) 커밋에서 빠진 파일은
// 깨진 그림이 된다. git add 뒤 node scripts/media.mjs --verify가 그 파일을 잡는다. 거의 원본 크기(1x)라 더 선명한 원본이 오면 바꾼다(OPEN_ITEMS detail-crops).
// 장면 목차의 작은 사진은 이름이 있는 링크 안에 있어 alt를 비운다(같은 말을 두 번 읽지 않게)
const img = (file: string, widths: readonly number[], ratio: Ratio, sizes: string, alt: string): ImageSpec =>
  ({ kind: 'image', ai: true, alt, desktop: { file, widths, ratio, sizes } });
// 데스크톱 너비는 1440px의 12칸 격자(칸 사이 24px)에서 잰 값이고, 900~1439px는 화면 폭을 따른다.
// 600~899px(태블릿)는 정찰제 컷이 40% 폭, 정사각 컷 한 칸이 --crop-cap(224px), 노트와 튤립이 2:1로 한 줄이다
const INDEX = '112px';
const QUARTER = '(min-width: 1440px) 302px, (min-width: 900px) calc(25vw - 42px), (min-width: 600px) 36vw, 60vw';   // 정찰제 컷 4장(폰은 가로로 넘긴다)
const NOTE = '(min-width: 1440px) 845px, (min-width: 900px) calc(66.7vw - 100px), (min-width: 600px) 59vw, 100vw';   // 폰은 화면 폭 22:9
const THIRD = '(min-width: 1440px) 411px, (min-width: 900px) calc(33.3vw - 70px), 30vw';   // 599px 이하에서는 그리지 않는다
const HALF = '(min-width: 1440px) 628px, (min-width: 900px) calc(50vw - 92px), (min-width: 600px) 573px, calc((100vw - 48px) * 23 / 18)';   // 폰은 정사각 상자
const SQUARE_11_6 = '(min-width: 1440px) 411px, (min-width: 900px) calc(33.3vw - 70px), (min-width: 600px) 411px, calc((100vw - 48px) * 11 / 12)';

export const DETAILS = {
  index: [   // 첫 화면 장면 목차(4/3, 112x84)
    img('idx-price.v1', [224, 320], '4/3', INDEX, ''),
    img('idx-planner.v1', [224, 448], '4/3', INDEX, ''),
    img('idx-dress.v1', [224, 448], '4/3', INDEX, ''),
    img('idx-hall.v1', [224, 400], '4/3', INDEX, ''),
  ],
  price: [   // 정찰제 쇼룸(price-a)의 네 가지, 4/5. TODO(hero-copy): alt 초안
    img('price-lace.v1', [320, 408], '4/5', QUARTER, '빈 가격표를 단 레이스 드레스'),
    img('price-bouquet.v1', [320, 528], '4/5', QUARTER, '주황 끈으로 빈 가격표를 단 주황과 흰 꽃 부케'),
    img('price-ring.v1', [320, 360], '4/5', QUARTER, '빈 가격표를 단 나무 반지 상자와 반지 한 쌍'),
    img('price-cards.v1', [320, 480], '4/5', QUARTER, '노끈으로 묶고 빈 가격표를 단 흰 청첩장 묶음'),
  ],
  planner: [   // 플래너 사진(planner-c)의 탁자. TODO(hero-copy): alt 초안
    img('planner-note.v1', [440, 880], '22/9', NOTE, '나무 탁자 위에 펼쳐 둔 빈 플래너 노트와 펜'),
    img('planner-tulips.v1', [420, 640], '8/7', THIRD, '창가 탁자 위 유리병에 꽂은 주황 튤립'),
  ],
  dress: [   // 같은 자리를 자른 목둘레와 밑단, 23/9. 원본 두 장, AI 합성 두 장 순서. TODO(hero-copy): alt 초안
    img('dress-top-before.v1', [600, 1196], '23/9', HALF, '원본 사진의 흰 티셔츠 목둘레와 소매'),
    img('dress-hem-before.v1', [600, 1196], '23/9', HALF, '원본 사진의 청바지 밑단과 흰 운동화'),
    img('dress-top-after.v1', [600, 1196], '23/9', HALF, 'AI 합성 사진의 레이스 드레스 목둘레와 레이스 소매'),
    img('dress-hem-after.v1', [600, 1196], '23/9', HALF, 'AI 합성 사진의 레이스 드레스 밑단'),
  ],
  hall: [   // 걷는 영상의 홀(hall-a), 11/6. TODO(hero-copy): alt 초안
    img('hall-chandelier.v1', [420, 583], '11/6', SQUARE_11_6, '웨딩홀 천장의 크리스털 샹들리에'),
    img('hall-aisle.v1', [420, 924], '11/6', SQUARE_11_6, '흰 버진로드 옆에 길게 놓인 흰 꽃과 주황 꽃'),
  ],
} satisfies Record<string, readonly ImageSpec[]>;

export type DetailRow = keyof typeof DETAILS;
