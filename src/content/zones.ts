// 영상 쪽 존 이름이 바뀌면 이 파일만 고친다.
// definition은 고정 용어의 한 줄 정의다. FAQ 답변, DefinedTermSet, llms.txt가 같은 값을 읽는다.
export type Zone = {
  id: 'zone-1' | 'zone-2' | 'zone-3' | 'zone-4';
  no: string;
  name: string;
  feature: string;
  definition: string;
  headline: string;
  hl: string;                 // headline의 뒤쪽 구절. 형광펜을 칠하고, 한 줄에 안 들어가면 여기서 줄을 바꾼다
  body: string;               // body와 notice의 \u00A0은 줄바꿈으로 가르지 않는 띄어쓰기다(text-wrap: balance가 구절 가운데서 끊지 않게)
  media: 'zone1' | 'zone2' | 'zone3' | 'zone4';
  icon: 'ticket' | 'map' | 'dress' | 'arch';   // components/Icons.tsx의 존 아이콘
  badge?: string;
  notice?: string;
};

export const zoneLabel = (zone: Zone) => `ZONE ${zone.no} · ${zone.name}`;

export const ZONES: Zone[] = [
  { id: 'zone-1', no: '01', name: '매표소', feature: '웨딩 가격 정찰제',
    definition: '웨딩 가격 정찰제는 상담을 받기 전에 가격을 공개하고, 같은 기준으로 보여 주는 방식이에요.',   // TODO(price-rule): 적용 범위가 정해지면 정의를 확정한다
    headline: '가격은 한눈에, 정찰제로', hl: '정찰제로',
    body: '상담을 받아야 알 수 있던 웨딩 가격을 처음부터 보여드려요. 같은 기준으로 놓고 비교해 보세요.', media: 'zone1', icon: 'ticket' },
  { id: 'zone-2', no: '02', name: '파크 맵', feature: '웨딩 AI 플래너',
    definition: 'AI 웨딩 플래너는 결혼식 날짜와 예산에 맞춰 준비 순서와 일정을 짜 주는 기능이에요.',   // TODO(term-name): 고정 용어 '웨딩 AI 플래너'와 어순이 다르다
    headline: '준비 순서는 AI가 짜 드려요', hl: 'AI가 짜 드려요',
    body: '결혼식 날짜와 예산만 알려 주세요. 해야\u00A0할\u00A0일을 코스처럼 이어서 정리해 드려요.', media: 'zone2', icon: 'map',   // TODO(zone2-input): 날짜와 예산 외의 입력 항목과 결과 형태가 정해지면 고친다
    badge: 'AI 생성' },   // TODO(ai-badge): 존 표는 'AI', AI 서비스 고지 표는 'AI 생성'. 고지 표를 따랐다
  { id: 'zone-3', no: '03', name: '의상실', feature: '드레스 AI 합성',
    definition: '드레스 AI 합성은 내 사진에 드레스를 합성해 어울리는 스타일을 미리 보는 가상 피팅 기능이에요.',
    headline: '입기 전에, 먼저 입어 봐요', hl: '먼저 입어 봐요',
    body: '내 사진에 드레스를 입혀 어울리는 스타일을 미리 확인해요. 피팅 전에 후보를 좁힐 수 있어요.', media: 'zone3', icon: 'dress',
    badge: 'AI 합성', notice: 'AI로 합성한 이미지예요. 실제\u00A0착용 모습과 다를 수 있어요.' },
  { id: 'zone-4', no: '04', name: '시뮬레이터', feature: 'AI 웨딩홀 시뮬레이션',
    definition: 'AI 웨딩홀 시뮬레이션은 웨딩홀의 입장부터 버진로드까지를 방문 전에 1인칭으로 걸어 보는 AI 시뮬레이션이에요.',   // TODO(term-def): 기획서에 정의 문장이 없어 존 설명에서 만든 제안값
    headline: '웨딩홀을 걸어 본 것처럼', hl: '걸어 본 것처럼',
    body: '입장부터 버진로드까지, 방문 전에 분위기와 동선을 먼저 걸어 봐요.', media: 'zone4', icon: 'arch',
    badge: 'AI 시뮬레이션', notice: 'AI가 만든 시뮬레이션이에요. 실제 웨딩홀과 다를 수 있어요.' },
];
