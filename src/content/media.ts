// 슬롯 사양은 docs/PLAN.md '미디어 슬롯 사양' 표를 따른다.
// 주소가 비어 있으면 MediaSlot이 브랜드 포스터 카드를 그린다.
type Aspect = '16/9' | '4/5' | '9/16' | '9/19.5';
type Video = { kind: 'video'; src: string; srcMobile?: string; poster: string; alt: string; aspect: Aspect;
  hasAudio?: boolean; captions?: string; transcript?: string;
  description?: string; uploadDate?: string; duration?: string; youtube?: string };   // 뒤 네 개는 구조화 데이터용
type Image = { kind: 'image'; src: string; alt: string; aspect: Aspect };
export type MediaSpec =
  | Video | Image
  | { kind: 'phone'; screen: Video | Image }
  | { kind: 'compare'; before: string; after: string; alt: string; aspect: Aspect };

const M = process.env.NEXT_PUBLIC_MEDIA_BASE || '/media';
// 파일이 오면 mediaUrl('hero-film.v1.mp4')처럼 버전이 든 파일명으로 주소를 만든다
export const mediaUrl = (file: string) => `${M}/${file}`;

export const MEDIA = {
  // TODO(hero-film): 영상 파일(데스크톱 16:9, 모바일 4:5), 포스터, 자막, 대본, 설명, 업로드일, 길이, 유튜브 주소
  hero: { kind: 'video', src: '', srcMobile: '', poster: '', alt: '스딩 소개 영상', aspect: '16/9', hasAudio: true },
  // TODO(zone-media): 존 영상과 이미지
  zone1: { kind: 'phone', screen: { kind: 'video', src: '', poster: '', alt: '스딩 앱의 웨딩 가격표 화면. 상품별 가격이 목록으로 보인다', aspect: '9/19.5' } },
  zone2: { kind: 'phone', screen: { kind: 'video', src: '', poster: '', alt: '스딩 앱의 AI 플래너 화면. 결혼 준비 일정이 시간순으로 이어진다', aspect: '9/19.5' } },
  // TODO(zone3-rights): 모델 초상권 동의와 드레스 브랜드 사용 허락을 확인하기 전에는 파일을 넣지 않는다
  zone3: { kind: 'compare', before: '', after: '', alt: '같은 인물의 원본 사진과 드레스를 합성한 사진을 좌우로 비교하는 화면', aspect: '4/5' },
  // TODO(zone4-hall): 대상 웨딩홀의 실존 여부, 촬영·사용 허락, 재현 방식을 확인하기 전에는 파일을 넣지 않는다
  zone4: { kind: 'video', src: '', srcMobile: '', poster: '', alt: '웨딩홀 입구에서 버진로드까지 1인칭으로 걸어가는 AI 시뮬레이션 영상', aspect: '16/9' },
} satisfies Record<string, MediaSpec>;

// 켤 소리가 있는지. 소리는 소개 영상에만 넣으므로(PLAN '소리와 사운드 버디') 그 파일이 올 때까지 사운드 버디를 그리지 않는다
export const HAS_SOUND = Boolean(MEDIA.hero.src && MEDIA.hero.hasAudio);
