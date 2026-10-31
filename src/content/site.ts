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
    ddayPrefix: 'D-',                                  // 실링의 'D-58'. 숫자는 daysToLaunch()
    ddaySr: ['오픈까지 ', '일'],                         // 스크린리더용 '오픈까지 58일'. 숫자 앞뒤 문구
    h1: '웨딩 준비, 스딩에서 놀듯이',                     // 모바일은 쉼표 뒤에서 두 줄로 나눈다
    sub: '가격은 한눈에, 드레스는 미리, 웨딩홀은 걸어본 듯이.',   // 쉼표로 나눈 구절은 줄바꿈으로 가르지 않는다
  },
  film: {
    title: '스딩 소개 영상',
    play: '영상 재생',
    pause: '영상 일시정지',
    transcript: '영상 내용 글로 보기',
    captions: '한국어',
  },
  intro: {
    kicker: '스딩이란',
    keep: ['정찰제로 투명하게', '플래닝·드레스·웨딩홀을', '미리 경험하게 하는', '웨딩 플랫폼이에요.'],   // SITE.definition에서 줄바꿈으로 가르지 않는 구절
    hl: ['정찰제로 투명하게', '미리 경험하게'],   // keep 구절 안에서 형광펜을 칠하는 부분
  },
  zones: { nav: '존 바로가기' },
  compare: { label: '원본과 AI 합성 비교', before: '원본', after: 'AI 합성' },
  sound: {
    label: '영상 소리',
    turnOn: '소리 켜기',
    turnOff: '소리 끄기',
    waiting: '영상이 보이면 소리가 나요',
    stopped: '영상을 재생하면 소리가 나요',   // 켜짐·대기 중 소리 영상이 화면에 있지만 멈춰 있을 때
    bubble: '소리 켜 볼까요?',
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
