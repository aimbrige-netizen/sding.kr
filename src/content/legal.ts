import { ADDRESS, COMPANY } from './company';
import { COPY, SITE } from './site';
import { ZONES } from './zones';
import { launchFull } from '@/lib/launch';

// /privacy와 /terms의 문구. 변호사 검토 전 초안이다. TODO(legal-review): 검토가 끝나면 문구를 확정하고 LEGAL_DATE를 넣는다.
// 처리방침은 실제 처리와 같아야 하므로 동의 고지의 값을 그대로 읽고, GA와 Cloudflare 미디어 항목은 켰을 때만 나온다.
// 값이 빈 줄은 화면에 나오지 않는다. 운영 빌드는 assertCompany()와 assertLegal()이 빈 값을 막는다
export type LegalRow = { label: string; value: string; href?: string; note?: string };
export type LegalBlock =
  | { p: string; strong?: boolean; link?: { label: string; href: string } }
  | { list: string[] }
  | { rows: LegalRow[] }
  | { groups: { name: string; rows: LegalRow[] }[] };
export type LegalSection = { id: string; title: string; blocks: LegalBlock[] };
export type LegalDoc = { title: string; metaTitle: string; description: string; lead: string; sections: LegalSection[] };

// 아래 값은 변호사 검토 뒤에 넣는다. 비어 있으면 운영 빌드가 멈춘다
const LEGAL_DATE = '';       // 시행일(예: 2026년 11월 13일)
const TRANSFER_BASIS = '';   // TODO(transfer-basis): 국외 이전의 법적 근거
const RECORD_BASIS = '';     // TODO(processing-basis): 신청을 처리하며 만들어지는 기록의 처리 근거
const AUTO_BASIS = '';       // TODO(processing-basis): 자동으로 처리되는 정보의 처리 근거. 쿠키에 동의가 필요한지도 함께 정한다
const TRANSFER_TYPE = { vercel: '', supabase: '', cloudflare: '', google: '' };   // TODO(transfer-table): 제공, 조회, 처리위탁, 보관 가운데 무엇인지

const GA_ON = Boolean(process.env.NEXT_PUBLIC_GA_ID);
// 사이트와 같은 도메인의 미디어는 Vercel이 전송한다. R2의 다른 도메인으로 옮겨야 Cloudflare 항목이 나온다
const MEDIA_ON = new URL(process.env.NEXT_PUBLIC_MEDIA_BASE || '/', SITE.url).hostname !== new URL(SITE.url).hostname;

export const LEGAL_COPY = { toc: '목차' };

const rows = (...items: LegalRow[]): LegalRow[] => items.filter((row) => row.value);
const group = (name: string, ...items: LegalRow[]) => ({ name, rows: rows(...items) });
const mail = (address: string): LegalRow => ({ label: '연락처', value: address, href: `mailto:${address}` });
const subprocessors = (href: string): LegalRow => ({ label: '다시 맡긴 업체', value: '업체 목록 보기', href });

const { labels } = COPY.footer;
const contactRows = rows(
  { label: labels.phone, value: COMPANY.phone, href: `tel:${COMPANY.phone.replace(/\D/g, '')}` },
  { label: labels.email, value: COMPANY.email, href: `mailto:${COMPANY.email}` },
);
const effectiveRows = rows({ label: '시행일', value: LEGAL_DATE });

const [item, purpose, retention] = COPY.waitlist.notice;   // 동의 고지와 글자까지 같아야 한다
const [, planner, dress, hall] = ZONES;
const aiFeatures = [planner, dress, hall].map((zone) => zone.feature).join(', ');

const TLS = 'TLS 지문(브라우저의 연결 방식 정보)';
const USAGE = '쿠키 식별자, IP 주소, 대략적인 위치, 기기와 브라우저 정보, 페이지 방문과 버튼 누름 같은 이용 기록';

// TODO(transfer-table): 업체별 지위(수탁자, 제3자)와 나라, 보유 기간의 표기는 변호사가 정한다.
// 값은 각 업체의 공개 문서를 따랐다. 업체가 약관이나 처리 위치를 바꾸면 다시 맞춘다
const VENDORS = [
  group('Vercel Inc.',
    { label: '이용 목적', value: '사이트 서버 운영, 신청 처리' },
    { label: '이전 유형', value: TRANSFER_TYPE.vercel },
    { label: '이전되는 항목', value: '휴대폰 번호, 동의 시각, 동의 버전, 접속 기록(IP 주소, 브라우저 정보, 접속한 페이지 주소, 접속 시각)' },
    { label: '이전되는 나라', value: '미국. Vercel은 자신이나 다시 맡긴 업체가 시설을 둔 다른 나라로 옮겨 처리할 수 있다고 밝혀요.' },
    { label: '이전되는 때와 방법', value: '사이트에 접속하거나 신청할 때 인터넷으로 전송해요.' },
    { label: '보유 기간', value: '스딩은 번호를 Vercel에 저장하지 않아요. 접속 기록은 Vercel이 정한 기간 동안 남고, Vercel은 이 기록을 서비스 운영과 개선에 쓸 수 있어요. 계약이 끝나면 Vercel은 고객 데이터를 합리적인 기간 안에 지운다고 밝히고, 일수는 적지 않아요.' },
    mail('privacy@vercel.com'),
    subprocessors('https://security.vercel.com/subprocessors'),
  ),
  group('Supabase Pte. Ltd.',
    { label: '이용 목적', value: '신청 정보 저장' },
    { label: '이전 유형', value: TRANSFER_TYPE.supabase },
    { label: '이전되는 항목', value: '휴대폰 번호, 신청 시각, 동의 시각, 동의 버전, 안내 문자 발송 시각, 로그와 사용 정보' },
    { label: '이전되는 나라', value: '번호는 대한민국 서울에 있는 서버에 저장해요. 로그와 사용 정보는 유럽연합의 데이터센터에 저장돼요. 싱가포르의 Supabase Pte. Ltd., 미국의 Supabase, Inc., 세계 곳곳의 지원 인력은 고객 지원이나 보안 사고 대응을 위해 로그와 설정, 때로는 저장된 데이터의 일부에 접근할 수 있어요.' },
    { label: '이전되는 때와 방법', value: '신청할 때 인터넷으로 전송해 저장해요.' },
    { label: '보유 기간', value: '스딩이 지울 때까지예요. Supabase는 프로젝트를 삭제하면 30일 안에 데이터를 지우고, 계약이 끝나면 30일의 반환 기간 뒤에 지운다고 밝혀요.' },
    mail('privacy@supabase.io'),
    subprocessors('https://supabase.com/legal/customer-resources/subprocessor-list'),
  ),
  group('Cloudflare, Inc.',
    { label: '이용 목적', value: MEDIA_ON ? '신청 폼 보호(봇 확인), 영상과 이미지 파일 전송' : '신청 폼 보호(봇 확인)' },
    { label: 'Cloudflare가 직접 쓰는 목적', value: '봇을 가려내는 기능 개선' },
    { label: '이전 유형', value: TRANSFER_TYPE.cloudflare },
    { label: '이전되는 항목', value: `IP 주소, ${TLS}, 브라우저 정보(User-Agent), 사이트 주소${MEDIA_ON ? ', 요청한 파일 주소' : ''}` },
    { label: '이전되는 나라', value: '미국, 영국, 싱가포르, 호주, 독일, 포르투갈, 프랑스, 일본, 캐나다, 네덜란드, 아랍에미리트, 인도, 멕시코, 말레이시아, 스웨덴. Cloudflare가 한국 이용자에게 안내한 나라예요.' },
    { label: '이전되는 때와 방법', value: `신청 폼에 입력을 시작하거나 신청할 때${MEDIA_ON ? ', 영상과 이미지 파일을 받을 때' : ''} 브라우저가 Cloudflare로 직접 전송해요.` },
    { label: '보유 기간', value: '봇 확인과 기능 개선에 필요한 동안이에요. Cloudflare는 일수를 밝히지 않아요.' },
    mail('dpo@cloudflare.com'),
    subprocessors('https://www.cloudflare.com/gdpr/subprocessors/cloudflare-services/'),
  ),
  ...(GA_ON ? [group('Google LLC',
    { label: '이용 목적', value: '사이트 방문 통계' },
    { label: '이전 유형', value: TRANSFER_TYPE.google },
    { label: '이전되는 항목', value: USAGE },
    { label: '이전되는 나라', value: 'Google은 자신이나 다시 맡긴 업체가 시설을 둔 나라에서 처리할 수 있다고 밝히고, 나라를 특정하지 않아요.' },
    { label: '이전되는 때와 방법', value: '페이지를 볼 때 브라우저가 Google로 직접 전송해요.' },
    { label: '보유 기간', value: '이용 기록은 2개월 보관해요.' },   // TODO(ga-settings): 7단계에서 GA 관리 화면의 값과 맞춘다
    mail('googlekrsupport@google.com'),
    subprocessors('https://business.safety.google/adssubprocessors/'),
  )] : []),
];

const privacy: LegalDoc = {
  title: `${COMPANY.legalName} 개인정보 처리방침`,
  metaTitle: `개인정보 처리방침 | ${COMPANY.brandName}`,
  description: `${COMPANY.legalName}이 출시 알림 신청 정보를 어떻게 처리하는지 안내해요.`,
  lead: `${COMPANY.legalName}(이하 '스딩')은 「개인정보 보호법」에 따라 개인정보를 보호하고 고충을 빠르게 처리하기 위해 이 방침을 공개해요. 이 방침은 sding.kr에 적용돼요.`,
  sections: [
    { id: 'purpose', title: '처리 목적과 항목', blocks: [
      { groups: [
        group('신청할 때 받는 정보',
          { label: purpose.label, value: purpose.value },
          { label: item.label, value: item.value },
          { label: '처리 근거', value: '신청한 분의 동의(「개인정보 보호법」 제15조제1항제1호)' },
        ),
        group('신청을 처리하며 만들어지는 정보',
          { label: '항목', value: '신청 시각, 동의 시각, 동의 문구 버전, 안내 문자 발송 시각' },
          { label: '목적', value: '동의한 사실을 확인하고 안내 문자를 보냈는지 관리해요.' },
          { label: '처리 근거', value: RECORD_BASIS },
        ),
      ] },
      { p: '문자를 보내는 데 필요한 번호만 받아요. 이름과 이메일은 받지 않아요.' },
      { p: "스딩이 저장하는 신청 정보에 IP 주소는 들어가지 않아요. 사이트에 접속할 때 자동으로 처리되는 정보는 '자동으로 수집하는 정보와 쿠키' 항목에 따로 적었어요." },
    ] },
    { id: 'retention', title: '보유 기간', blocks: [
      { p: `번호는 ${retention.value}해요.`, strong: true },   // TODO(retention): 변호사 답에 따라 동의 고지와 함께 바뀐다
      { p: '번호와 함께 저장한 신청 시각과 동의 기록도 같이 지워요. 동의를 철회하면 지체 없이 파기해요.' },
      { p: "업체가 처리하는 정보의 보유 기간은 '처리 위탁과 국외 이전' 항목에 적었어요." },
    ] },
    { id: 'children', title: '만 14세 미만 아동', blocks: [
      { p: `${COPY.waitlist.age} 스딩은 법정대리인 동의 절차를 두지 않아요. 만 14세 미만 아동의 번호로 신청된 사실을 알게 되면 지체 없이 파기해요.` },
    ] },
    { id: 'destruction', title: '파기 절차와 방법', blocks: [
      { p: '보유 기간이 지나거나 처리 목적을 이루어 필요 없어진 개인정보는 지체 없이 파기해요.' },
      // TODO(export-file): 문자를 보내려고 내려받는 파일의 삭제 절차를 정하면 파기 방법에 더한다
      { rows: rows(
        { label: '파기 절차', value: '파기할 정보를 고르고 개인정보 보호책임자가 확인한 뒤 파기해요.' },
        { label: '파기 방법', value: '데이터베이스의 정보는 복구할 수 없게 삭제해요. 백업에 남은 정보는 백업 보관 기간이 끝나면 함께 지워져요.' },
      ) },
    ] },
    { id: 'transfer', title: '처리 위탁과 국외 이전', blocks: [
      { p: '스딩은 사이트를 운영하고 신청을 처리하는 데 아래 업체의 서비스를 써요. 해외 사업자이거나 해외에서 처리할 수 있는 곳이라 처리 위탁과 국외 이전 내용을 업체마다 함께 적었어요.' },
      { groups: [...VENDORS, group('국외 이전의 근거와 거부 방법',
        { label: '근거', value: TRANSFER_BASIS },
        { label: '거부 방법과 효과', value: '출시 알림을 신청하지 않으면 번호가 이전되지 않아요. 이미 신청했다면 개인정보 보호책임자에게 동의 철회를 요청해 주세요. 이전을 거부하면 출시 알림을 받을 수 없어요.' },
      )] },
      // TODO(sms-vendor): 업체가 정해지면 VENDORS에 더하고 이 문장을 지운다
      { p: '정식 오픈 안내 문자는 문자 발송 업체에 맡겨 보낼 예정이에요. 업체를 정하면 번호를 넘기기 전에 이 방침에 이름과 맡기는 일을 적어 알려 드려요.' },
    ] },
    // TODO(security-measures): 공개일에 실제로 켜 둔 조치만 남긴다. 업체의 조치를 스딩의 조치처럼 쓰지 않는다
    { id: 'security', title: '안전성 확보 조치', blocks: [
      { list: [
        '전송 구간 암호화: 사이트와 신청 정보를 HTTPS로 주고받아요.',
        '접근 제한: 신청 정보는 서버에서만 저장할 수 있고, 브라우저에서 바로 읽거나 쓸 수 없어요.',
        '기록 남기지 않기: 신청을 처리하는 서버 코드는 번호를 로그에 남기지 않아요.',
        '자동 신청 방지: 봇 확인으로 자동 신청을 막아요.',
      ] },
    ] },
    { id: 'cookies', title: '자동으로 수집하는 정보와 쿠키', blocks: [
      { p: '쿠키는 웹사이트가 브라우저에 저장하는 작은 파일로, 다시 접속할 때 서버로 전송돼요. 스딩이 직접 만드는 쿠키는 없어요. 소리 안내 말풍선을 다시 보이지 않으려고 브라우저에 임시 표시를 하나 남길 수 있는데, 이 표시는 서버로 보내지 않고 탭을 닫으면 지워져요.' },
      { rows: rows({ label: '처리 근거', value: AUTO_BASIS }) },
      { groups: [
        group('사이트 접속 기록',
          { label: '언제', value: '사이트에 접속할 때' },
          { label: '목적', value: '사이트를 보여 주고 서버를 운영해요.' },
          { label: '처리 항목', value: 'IP 주소, 브라우저 정보, 접속한 페이지 주소, 접속 시각' },
          { label: '처리하는 곳', value: 'Vercel Inc.' },
        ),
        group('Cloudflare Turnstile(봇 확인)',
          { label: '언제', value: '신청 폼에 입력을 시작하면 브라우저가 Cloudflare의 봇 확인 프로그램을 받고, 신청 버튼을 누르면 확인이 시작돼요.' },
          { label: '목적', value: '자동 신청을 막아 신청 폼을 보호해요. Cloudflare는 봇을 가려내는 기능을 개선하는 데도 이 정보를 써요.' },
          { label: '처리 항목', value: `IP 주소, ${TLS}, 브라우저 정보(User-Agent), 사이트 주소. 휴대폰 번호는 Cloudflare로 보내지 않아요.` },
          { label: '쿠키', value: 'Cloudflare는 상태를 유지하고 방문자의 행동을 추적하기 위해 쿠키와 브라우저 저장소를 쓸 수 있어요.' },
          { label: '권리 요구', value: '이 정보에 관한 요구는 스딩의 개인정보 보호책임자에게 해 주세요.' },
          { label: '자세히 보기', value: 'Turnstile 개인정보 안내', href: 'https://www.cloudflare.com/turnstile-privacy-policy/' },
        ),
        ...(MEDIA_ON ? [group('영상과 이미지 파일',
          { label: '언제', value: '영상과 이미지 파일을 받을 때' },
          { label: '목적', value: '영상과 이미지 파일을 전송해요.' },
          { label: '처리 항목', value: 'IP 주소, 브라우저 정보, 요청한 파일 주소' },
          { label: '처리하는 곳', value: 'Cloudflare, Inc.' },
        )] : []),
        ...(GA_ON ? [group('Google 애널리틱스(방문 통계)',
          { label: '목적', value: '어떤 화면과 버튼이 쓰이는지 통계를 내어 사이트를 고쳐요.' },
          { label: '쿠키', value: '_ga(사용자 구분), _ga_로 시작하는 쿠키(세션 유지). 기간은 기본 2년이고, 브라우저에 따라 더 짧을 수 있어요.' },
          { label: '처리 항목', value: `${USAGE}. 번호는 보내지 않아요.` },
          { label: '자세히 보기', value: 'Google의 정보 처리 안내', href: 'https://policies.google.com/technologies/partner-sites?hl=ko' },
        )] : []),
        group('쿠키를 거부하는 방법',
          { label: '쿠키 차단', value: 'iPhone Safari는 설정 > 앱 > Safari > 고급 > 모든 쿠키 차단에서 막을 수 있어요. 다른 브라우저도 설정에서 쿠키를 차단하거나 지울 수 있어요.' },
          { label: '남기지 않고 보기', value: 'Chrome의 새 시크릿 창, Edge의 새 InPrivate 창, 삼성 인터넷의 비밀 모드는 기기에 쿠키를 남기지 않아요.' },
          { label: '차단하면', value: '봇 확인이 끝나지 않아 신청이 되지 않을 수 있어요.' },
          ...(GA_ON ? [{ label: 'Google 애널리틱스', value: '차단 부가 기능 받기', href: 'https://tools.google.com/dlpage/gaoptout' }] : []),
        ),
      ] },
    ] },
    { id: 'rights', title: '정보주체의 권리와 행사 방법', blocks: [
      { list: [
        '개인정보의 주인인 정보주체는 언제든 자신의 개인정보를 열람하거나, 고치거나 지우도록 요구할 수 있어요. 처리를 멈추도록 요구하거나 동의를 철회할 수도 있어요.',
        "'개인정보 보호책임자' 항목의 이메일이나 전화로 요구해 주세요.",
        '법정대리인이나 위임받은 사람을 통해서도 요구할 수 있어요. 이때는 「개인정보 처리 방법에 관한 고시」 별지 제11호서식의 위임장을 내 주세요.',
        '법률에 따라 금지되거나 다른 사람의 생명, 신체, 재산 같은 이익을 해칠 우려가 있는 경우처럼 법이 정한 때에는 요구가 제한될 수 있어요. 이때는 그 이유와 이의를 제기하는 방법을 알려 드려요.',
        '요구한 분이 본인이거나 정당한 대리인인지 확인해요. 본인이 요구할 때는 신청할 때 없던 서류나 절차를 더 요구하지 않아요.',
        '열람, 정정·삭제, 처리정지 요구는 받은 날부터 10일 안에 결과를 알려 드려요. 동의를 철회하면 지체 없이 파기해요.',
      ] },
    ] },
    { id: 'officer', title: '개인정보 보호책임자', blocks: [
      { p: '개인정보 처리에 관한 문의, 불만 처리, 피해 구제는 아래 책임자에게 연락해 주세요. 열람, 정정·삭제, 처리정지, 동의 철회 요구도 같은 곳에서 받아요.' },
      // TODO(contact): 성명과 전화번호, 이메일을 전달받으면 company.ts를 채운다. 운영 빌드는 빈 값이면 멈춘다
      { rows: rows({ label: '성명', value: COMPANY.privacyOfficer }, ...contactRows) },
    ] },
    { id: 'remedy', title: '권익 침해 구제 방법', blocks: [
      { p: '개인정보 침해에 관한 상담이나 신고가 필요하면 아래 기관에 문의할 수 있어요.' },
      { rows: [   // 공개 직전에 번호와 주소를 다시 확인한다
        { label: '개인정보 분쟁조정위원회', value: 'www.kopico.go.kr', href: 'https://www.kopico.go.kr', note: '국번 없이 1833-6972' },
        { label: '개인정보침해 신고센터', value: 'privacy.kisa.or.kr', href: 'https://privacy.kisa.or.kr', note: '국번 없이 118' },
        { label: '경찰청 사이버범죄 신고시스템', value: 'ecrm.police.go.kr', href: 'https://ecrm.police.go.kr', note: '국번 없이 182' },
      ] },
    ] },
    { id: 'changes', title: '방침의 시행과 변경', blocks: [
      { rows: effectiveRows },
      { p: '이 방침을 바꾸면 바뀐 내용과 시행일을 이 페이지에서 알리고, 변경 전과 후를 비교할 수 있게 공개해요.' },
    ] },
  ],
};

const terms: LegalDoc = {
  title: `${COMPANY.legalName} 이용약관`,
  metaTitle: `이용약관 | ${COMPANY.brandName}`,
  description: `${COMPANY.legalName}의 sding.kr 이용약관이에요.`,
  lead: '이 약관은 sding.kr을 이용할 때 알아 두실 내용을 담고 있어요. 정식 오픈 전의 내용이고, 앱을 출시하면 앱에 맞는 약관을 따로 알려 드려요.',
  sections: [
    { id: 'service', title: '서비스 소개와 지금 단계', blocks: [
      { p: `스딩은 ${aiFeatures} 기능을 담은 앱을 출시할 예정이에요.` },
      { p: '이 사이트는 앱을 소개하고 출시 알림 신청을 받는 페이지예요. 이 사이트에서는 아무것도 판매하지 않고, 예약과 결제, 구매 신청(청약)도 받지 않아요. AI 기능도 제공하지 않아요.', strong: true },
      { p: `정식 오픈 예정일은 ${launchFull()}이에요. 예정일이라 일정이 바뀔 수 있고, 바뀌면 이 사이트에서 새 일정을 알려 드려요.` },
    ] },
    { id: 'notify', title: '출시 알림', blocks: [
      { p: '출시 알림을 신청하면 신청 폼에서 동의한 대로 정식 오픈 안내 문자를 1회 보내 드려요.', link: { label: '개인정보 처리방침 보기', href: '/privacy' } },
    ] },
    { id: 'ai', title: '생성형 AI 사용 안내', blocks: [
      { p: `앱의 ${aiFeatures}은 생성형 AI를 활용해 운용될 예정이에요. 이 사이트에서는 아직 제공하지 않아요.` },
      { p: '앱이 만든 결과물에는 AI로 생성했다는 사실을 표시할 예정이에요. 실제와 구분하기 어려운 이미지와 영상은 이용자가 명확하게 알아볼 수 있게 표시할 예정이에요.' },
    ] },
    { id: 'limits', title: '결과물의 한계', blocks: [
      { p: 'AI 결과물은 참고용이고 실제와 다를 수 있어요.', strong: true },
      { p: `${dress.feature}의 결과는 실제 착용 모습과 다를 수 있고, ${hall.feature}은 실제 웨딩홀과 같지 않아요.` },
      { p: '이 사이트의 화면과 영상은 앱을 설명하는 데모예요. 실제 앱의 결과와 다를 수 있어요.' },
    ] },
    { id: 'ownership', title: '지식재산권', blocks: [
      { p: `이 사이트의 문구, 디자인, 로고의 권리는 ${COMPANY.legalName}이나 정당한 권리자에게 있어요. 법이 허용하는 경우를 빼고는 허락 없이 복제하거나 배포할 수 없어요.` },
    ] },
    { id: 'contact', title: '문의처', blocks: [
      { rows: rows(
        { label: '상호', value: COMPANY.legalName },
        { label: labels.ceo, value: COMPANY.ceo },
        { label: '주소', value: ADDRESS },
        { label: labels.bizRegNo, value: COMPANY.bizRegNo },
        ...contactRows,
      ) },
    ] },
    { id: 'changes', title: '시행일과 변경', blocks: [
      { rows: effectiveRows },
      { p: '이 약관을 바꾸면 시행일과 바뀐 내용을 시행일 전에 이 사이트에서 알려 드려요.' },
    ] },
  ],
};

export const LEGAL = { privacy, terms };

// 운영 빌드에서만 호출한다. 이 값들은 변호사 검토가 끝나야 넣으므로 검토 전 초안이 공개되지 않는다
export function assertLegal() {
  const required = { LEGAL_DATE, TRANSFER_BASIS, RECORD_BASIS, AUTO_BASIS, ...TRANSFER_TYPE };
  for (const [name, value] of Object.entries(required)) {
    if (!value) throw new Error(`legal.ts: ${name} is empty`);
  }
}
