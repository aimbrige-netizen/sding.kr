// 기능 4개(PLAN '콘텐츠 파일'). 이름이 바뀌면 이 파일만 고친다.
// feature는 고정 용어이고 definition은 그 한 줄 정의다. FAQ 답, DefinedTermSet, llms.txt, 이용약관(legal.ts)이 같은 값을 읽는다.
// 순서는 화면 순서다. legal.ts가 자리로 읽으므로([, planner, dress, hall]) 순서를 바꾸지 않는다.
// 문자열의 \u00A0은 줄바꿈으로 가르지 않는 띄어쓰기다.
export type FeatureId = 'price' | 'planner' | 'dress' | 'hall';

export type Feature = {
  id: FeatureId;                        // 섹션 id(#price), feature_view의 feature_id, MEDIA 키
  feature: string;                      // 고정 용어. 섹션 라벨에도 쓴다
  nav: string;                          // 머리글 바로가기의 짧은 이름. 기본 원칙 2의 예외로 머리글에서만 쓴다
  definition: string;                   // 한 줄 정의
  headline: readonly [string, string];  // h2 두 줄. 어느 폭에서나 이 자리에서 줄을 바꾼다
  body: readonly string[];              // 설명 문장들
  breakDesktop?: boolean;               // true면 900px 이상에서 문장마다 줄을 바꾼다. 폰은 이어 쓴다
  notice?: string;                      // 미디어 파일이 있을 때 미디어 바로 아래 고지. AI 예시라는 말과 기능의 한계를 함께 쓴다
  posterNotice?: string;                // 파일이 오기 전 포스터 카드 아래 고지. 포스터는 AI가 만든 그림이 아니어서 기능의 한계만 말한다
};

export const FEATURES: readonly Feature[] = [
  {
    id: 'price', feature: '웨딩 가격 정찰제', nav: '정찰제',
    definition: '웨딩 가격 정찰제는 상담을 받기 전에 가격을 공개하고, 같은 기준으로 보여 주는 방식이에요.',   // TODO(price-rule): 적용 범위가 정해지면 정의를 확정한다
    headline: ['웨딩 가격,', '묻지 않아도 보여요'],                          // TODO(hero-copy) TODO(price-rule): 승인 전 초안
    body: ['상담을 받아야 알 수 있던 웨딩 가격을 처음부터 보여\u00A0드려요.', '같은 기준으로 놓고 비교해 보세요.'],
    breakDesktop: true,
  },
  {
    id: 'planner', feature: 'AI 웨딩 플래너', nav: 'AI 플래너',
    definition: 'AI 웨딩 플래너는 결혼식 날짜와 예산에 맞춰 준비 순서와 일정을 짜 주는 기능이에요.',
    headline: ['날짜와 예산만', '알려 주세요'],                              // TODO(hero-copy)
    // 둘째 문장이 웨딩 체크리스트 한 줄이다(redesign-r2 §1.4). TODO(ai-facts) TODO(zone2-input)
    body: ['결혼식 날짜와 예산에 맞춰 준비 순서와\u00A0일정을 AI가\u00A0짜\u00A0드려요.', '투어와 피팅 일정도 한곳에서 챙길\u00A0수\u00A0있어요.'],
  },
  {
    id: 'dress', feature: 'AI 드레스 합성', nav: '드레스',
    definition: 'AI 드레스 합성은 내 사진에 드레스를 합성해 어울리는 스타일을 미리 보는 가상 피팅 기능이에요.',   // TODO(term-synonym): 임시. '가상 피팅'은 사용자가 나중에 다시 정한다
    headline: ['내 사진으로', '드레스를 입어 보세요'],                       // TODO(hero-copy)
    body: ['내 사진에 드레스를 입혀 어울리는 스타일을 미리\u00A0확인해요.', '피팅 전에 후보를 좁힐 수 있어요.'],
    breakDesktop: true,
    notice: 'AI로 만든 예시 이미지예요. 실제\u00A0착용 모습과 다를 수 있어요.',   // TODO(example-label): 승인 전 초안
    posterNotice: 'AI 드레스 합성의 결과는 AI로 합성한 이미지라 실제\u00A0착용 모습과 다를 수 있어요.',
  },
  {
    id: 'hall', feature: '웨딩홀 시뮬레이션', nav: '웨딩홀',
    definition: '웨딩홀 시뮬레이션은 입장부터 버진로드까지, 방문 전에 분위기와 동선을 먼저 걸어 보는 기능이에요.',   // TODO(term-def): 임시 문장이다. 사용자가 나중에 직접 고친다
    headline: ['버진로드를', '미리 걸어 보세요'],                            // TODO(hero-copy) TODO(zone4-hall)
    body: ['입장부터 버진로드까지, 방문 전에 분위기와 동선을 먼저 걸어 봐요.'],
    notice: 'AI로 만든 예시 이미지예요. 실제 웨딩홀과 다를 수 있어요.',         // TODO(example-label). 영상으로 바꾸면 '예시 영상이에요'
    posterNotice: '웨딩홀 시뮬레이션은 AI가 만든 장면이라 실제 웨딩홀과 다를 수 있어요.',
  },
];

export const featureById = (id: FeatureId): Feature => FEATURES.find((f) => f.id === id)!;
