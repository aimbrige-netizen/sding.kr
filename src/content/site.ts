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
  store: { ios: '', android: '' },             // TODO(store): 오픈에 맞춰 채운다
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
  faq: { title: '자주 묻는 질문' },
  final: {
    title: [',', '스딩이 문을 열어요'],                  // 첫 칸 앞에 launchLabel(). 날짜가 혼자 한 줄을 쓴다
    titleLive: '지금 스딩을 시작해 보세요',
    lead: ['전화번호를 남기면 오픈하는 날 문자로 알려 드려요.', '로그인은 필요 없어요.'],   // 문장마다 나눈다. 넓은 화면은 문장마다 한 줄이다
    partner: ['웨딩 업체이신가요?', '제휴 문의'],
  },
  // 동의 문구는 변호사 검토 전 임시안이다. 바꾸면 api/waitlist/route.ts의 CONSENT_VERSION을 올린다
  waitlist: {
    phone: '휴대폰 번호',
    // TODO(consent-copy): 변호사 검토 뒤 확정한다. TODO(retention): 보관 기간 확정
    notice: [
      { label: '수집 항목', value: '휴대폰 번호' },
      { label: '이용 목적', value: '정식 오픈 안내 문자 발송' },
      { label: '보유 기간', value: '안내 문자를 보낸 뒤 30일 안에 파기', strong: true },   // 법이 눈에 띄게 표시하라고 정한 항목이다
    ],
    refuse: ['동의를 거부할 수 있어요.', '거부하면 출시 알림을 받을 수 없어요.'],
    age: '만 14세 미만은 신청할 수 없어요.',            // TODO(age-14): 변호사 검토
    consent: ['개인정보 수집·이용에', '동의해요 (필수)'],   // 줄바꿈으로 가르지 않는 구절
    more: '자세히 보기',
    moreSr: ' 새 창에서 열려요',
    sending: '보내는 중이에요',
    interact: '확인을 마치면 신청이 끝나요.',
    done: ['신청이 완료됐어요.', '오픈하는 날 문자로 알려 드릴게요.'],
    noJs: 'JavaScript를 켜야 신청할 수 있어요.',
    close: '닫기',
    errors: {
      phone: '휴대폰 번호를 다시 확인해 주세요.',
      consent: '개인정보 수집·이용에 동의해 주세요.',
      challenge: '확인에 실패했어요. 다시 시도해 주세요.',
      server: '잠시 후 다시 시도해 주세요.',
    },
  },
  store: {
    ios: 'App Store에서 받기',                           // TODO(store-badge-art): 공식 배지를 받으면 바꾼다
    android: 'Google Play에서 받기',
    qr: '휴대폰 카메라로 찍으면 스딩을 받는 화면이 열려요',
    qrLabel: 'QR 코드',
  },
  terms: '스딩 기능 용어',   // 구조화 데이터의 DefinedTermSet 이름
  llms: { launch: '정식 오픈일', features: '기능', company: '회사 정보', legalName: '법인명', address: '주소', links: '링크', home: '홈' },
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
