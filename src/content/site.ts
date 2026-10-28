import { COMPANY } from './company';

export const SITE = {
  url: 'https://sding.kr',
  title: '스딩 Sding | 웨딩 가격 정찰제 · AI 웨딩 플래너',   // 32자
  description: '스딩은 웨딩 가격을 정찰제로 투명하게 만들고, AI로 플래닝·드레스·웨딩홀을 미리 경험하게 하는 웨딩 플랫폼입니다.',   // 64자, 메타용
  definition: '스딩은 웨딩 가격을 정찰제로 투명하게 만들고, AI로 플래닝·드레스·웨딩홀을 미리 경험하게 하는 웨딩 플랫폼이에요.',   // 화면용
  ogAlt: '스딩: 웨딩 가격 정찰제와 AI 웨딩 플래너',
  launchDate: '2026-12-25',                    // KST 정식 오픈일
  ctaOverride: '' as '' | 'waitlist' | 'live', // 수동 전환. 비어 있으면 launchDate로 판단
  sameAs: [] as string[],                      // TODO(sns): SNS 주소가 정해지면 채운다
  store: { ios: '', android: '' },             // TODO(store): 오픈 후 채운다
};

// 화면 문구. 날짜가 들어가는 부분은 lib/launch.ts의 도우미로 만들어 붙인다.
export const COPY = {
  skipLink: '본문으로 건너뛰기',
  homeLabel: '스딩 홈',
  cta: { waitlist: '출시 알림 받기', live: '앱 시작하기' },
  hero: {
    kicker: '정식 오픈',                                 // 앞에 launchDotted()
    hook: { waitlist: 'Coming Soon', live: 'Now Open' }, // TODO(live-hook): 'Now Open'은 승인 전 제안값
    ddayLabel: '오픈까지',
    h1: '웨딩 준비, 스딩에서 놀듯이',
    sub: '가격은 한눈에, 드레스는 미리, 웨딩홀은 걸어본 듯이.',
  },
  footer: {
    labels: {
      ceo: '대표', bizRegNo: '사업자등록번호', mailOrderNo: '통신판매업신고번호',
      phone: '전화', email: '이메일', privacyOfficer: '개인정보보호책임자',
    },
    privacy: '개인정보처리방침',
    terms: '이용약관',
    partner: '제휴 문의',
    aiNotice: 'AI 기능은 생성형 AI를 활용하며 결과는 실제와 다를 수 있어요.',
    copyright: `© 2026 ${COMPANY.legalName}. All rights reserved.`,
  },
};
