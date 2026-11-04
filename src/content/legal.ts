import { ADDRESS, COMPANY } from './company';
import { COPY, SITE } from './site';
import { ZONES } from './zones';
import { GA_ID } from '@/lib/analytics';
import { launchFull } from '@/lib/launch';

// /privacy와 /terms의 문구. 2026-11-04 법령 검토(변호사 의견 아님)를 반영했다. TODO(legal-review): 첫 공개 전에 할 일을 마치면 LEGAL_DATE를 넣는다.
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

// 아래 값이 비어 있으면 운영 빌드가 멈춘다. 시행일은 검토 전 초안이 공개되지 않게 막는 마지막 장치라 맨 나중에 넣는다
const LEGAL_DATE = '';       // 시행일(예: 2026년 11월 13일). 첫 공개 전에 할 일을 모두 마친 뒤 실제 첫 공개일로 넣는다
// 국외 이전은 제28조의8제1항제3호가목으로 둔다. 업체마다 이전 사항 다섯 가지를 빠짐없이 공개해야 성립한다. GA는 이 근거에 들지 않는다
const TRANSFER_BASIS = '출시 알림 신청은 정식 오픈 안내 문자 1회를 보내 달라는 요청이고, 스딩은 이 요청을 받아 문자를 보내 드려요. 이 신청을 받고 문자를 보내 드리려면 신청 전에 사이트를 보여 드리는 일부터 신청 폼의 봇 확인, 신청 정보 저장까지 Vercel, Supabase, Cloudflare에 맡겨야 해요. 그래서 이 이전은 정보주체와의 계약을 맺고 이행하는 데 필요한 처리위탁·보관이에요. 위에 적은 이전 사항을 이 방침에 공개하고 이전해요(「개인정보 보호법」 제28조의8제1항제3호가목).';
const RECORD_BASIS = '동의한 사실을 확인하고 안내 문자 발송을 관리하기 위한 스딩의 정당한 이익(「개인정보 보호법」 제15조제1항제6호)';
// GA 없이 공개할 때의 문장이다. GA를 켜려면 방문 통계 동의를 먼저 받고 그 근거를 따로 적는다
const AUTO_BASIS = '사이트 접속 기록과 봇 확인 정보는 동의 없이 처리해요. 근거는 스딩의 정당한 이익이에요(「개인정보 보호법」 제15조제1항제6호). 사이트를 보여 주고 지키는 일과 자동 신청을 막는 일에 필요한 만큼만 처리해요. 스딩은 이 정보를 휴대폰 번호와 연결하지 않고, 광고에 쓰지 않아요.';
const TRANSFER_TYPE = { vercel: '처리위탁, 보관', supabase: '처리위탁, 보관', cloudflare: '처리위탁, 보관', google: '처리위탁, 보관' };

const GA_ON = Boolean(GA_ID);
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
const USAGE = '쿠키 식별자, IP 주소, 대략적인 위치, 기기와 브라우저 정보, 유입 경로, 페이지 방문과 버튼 누름 같은 이용 기록, 신청 결과(성공, 또는 번호 형식 오류·동의 누락·봇 확인 실패·서버 오류 같은 실패 이유)';

// 맡긴 일에서는 수탁자로 적고, 업체가 스스로 정해 쓰는 일은 '직접 쓰는 목적'으로 따로 적는다(2026-11-04 검토).
// 국외 이전 근거가 성립하려면 업체마다 이전 사항 다섯 가지가 빠짐없이 있어야 한다. 값은 각 업체의 공개 문서를 따랐다.
// TODO(vendor-docs): 업체가 약관, 소프로세서, 처리 위치를 바꾸면 다시 맞춘다. 공개 직전에 다시 본다
const VENDORS = [
  group('Vercel Inc.',
    { label: '이용 목적', value: '사이트 서버 운영, 신청 처리, 공격과 지나치게 많은 요청 막기' },
    { label: 'Vercel이 직접 쓰는 목적', value: '접속 기록 같은 서비스 이용 기록을 서비스 운영과 개선, 지원, 마케팅, 분석처럼 자신이 정하는 사업 목적에도 쓸 수 있다고 밝혀요. 밖에 알릴 때는 모으거나 누구인지 알 수 없게 한 형태로만 알린다고 밝혀요.' },
    { label: '이전 유형', value: TRANSFER_TYPE.vercel },
    { label: '이전되는 항목', value: `휴대폰 번호, 동의 시각, 동의 문구 버전, 접속 기록(Vercel이 공개 문서에 적은 IP 주소, ${TLS}, 브라우저 정보, 접속한 페이지 주소, 접속 시각)${GA_ON ? ', 브라우저가 요청에 함께 싣는 Google 애널리틱스 쿠키' : ''}` },
    { label: '이전되는 나라', value: '미국. 신청을 처리하는 서버 함수는 서울 리전에서 실행되도록 정해 두었어요. 다만 Vercel은 주된 처리 시설이 미국에 있고, 자신이나 다시 맡긴 업체가 시설을 둔 다른 나라로 옮겨 처리할 수 있다고 밝혀요. 이 방침을 쓴 때 다시 맡긴 업체 목록에는 미국, 스페인, 영국의 업체가 있어요.' },
    { label: '이전되는 때와 방법', value: '사이트에 접속하거나 신청할 때 인터넷으로 전송해요. 스딩이 기술 지원을 요청하면 Vercel이 스딩의 계정에 접근할 수 있어요.' },
    { label: '보유 기간', value: '스딩은 번호를 Vercel에 저장하지 않아요. 접속 기록은 Vercel이 정한 기간 동안 남아요. Vercel이 직접 쓰는 기록은 그 목적에 더는 필요하지 않으면 기록 속 개인정보를 익명으로 만들거나 지운다고 밝혀요. 계약이 끝나면 Vercel은 고객 데이터를 합리적인 기간 안에 지운다고 밝히고, 일수는 적지 않아요.' },
    mail('privacy@vercel.com'),
    subprocessors('https://security.vercel.com/subprocessors'),
  ),
  group('Supabase Pte. Ltd.',
    { label: '이용 목적', value: '신청 정보 저장' },
    { label: '이전 유형', value: TRANSFER_TYPE.supabase },
    { label: '이전되는 항목', value: '휴대폰 번호, 신청 시각, 동의 시각, 동의 문구 버전, 안내 문자 발송 시각, 로그와 사용 정보' },
    { label: '이전되는 나라', value: '번호는 대한민국 서울에 있는 서버에 저장해요. Supabase는 이 지역에 저장하고 주로 이곳에서 처리한다고 약속하지만, 이 지역 밖으로 데이터가 나가지 않는다고 보장하지는 않고 시설을 둔 곳 어디서든 처리할 수 있다고 밝혀요. 로그와 사용 정보는 유럽연합의 데이터센터에 저장돼요. 기술 지원과 운영을 맡은 미국의 Supabase, Inc.에는 필요할 때 데이터가 전달될 수 있어요. 싱가포르의 Supabase Pte. Ltd.와 다른 나라에 있는 지원 인력은 고객 지원이나 보안 사고 대응을 위해 로그와 설정, 때로는 저장된 데이터의 일부에 접근할 수 있어요. Supabase는 로그를 저장하는 유럽연합 안의 나라와 지원 인력이 있는 나라를 밝히지 않아요. 이 방침을 쓴 때 다시 맡긴 업체 목록에는 미국, 싱가포르, 헝가리의 업체가 있어요.' },
    { label: '이전되는 때와 방법', value: '번호는 신청할 때 인터넷으로 전송해 서울의 서버에 저장해요. 로그와 사용 정보는 Supabase를 쓰는 동안 인터넷으로 유럽연합의 데이터센터에 보내져 저장돼요. 기술 지원과 운영에 필요할 때는 미국의 Supabase, Inc.로도 전달될 수 있어요. 스딩이 도움을 요청하면 Supabase 지원 인력이 원격으로 접속할 수 있어요. Supabase는 스딩의 데이터나 자신의 서비스에 위협을 발견하면 스딩의 요청 없이도 조사할 수 있고, 그때는 스딩에게 알린다고 밝혀요.' },
    { label: '보유 기간', value: '번호와 신청 기록은 스딩이 지울 때까지예요. 로그와 사용 정보는 Supabase가 정한 기간 동안 남고, 백업은 요금제에 정해진 기간 동안 남아요. Supabase는 프로젝트를 삭제하면 30일 안에 데이터를 지우고, 계약이 끝나면 30일의 반환 기간 뒤에 지운다고 밝혀요.' },
    mail('privacy@supabase.io'),
    subprocessors('https://supabase.com/legal/customer-resources/subprocessor-list'),
  ),
  group('Cloudflare, Inc.',
    { label: '이용 목적', value: MEDIA_ON ? '신청 폼 보호(봇 확인), 영상과 이미지 파일 전송' : '신청 폼 보호(봇 확인)' },
    { label: 'Cloudflare가 직접 쓰는 목적', value: '봇을 가려내는 기능 개선' },
    { label: '이전 유형', value: TRANSFER_TYPE.cloudflare },
    { label: '이전되는 항목', value: `IP 주소, ${TLS}, 브라우저 정보(User-Agent), 사이트 주소, 봇 확인 프로그램이 브라우저에서 모으는 신호. Cloudflare의 공개 문서는 이런 신호를 예로 들 뿐 전체 목록을 적지 않아요.${MEDIA_ON ? ' 영상과 이미지 파일을 받을 때는 IP 주소, 브라우저 정보, 요청한 파일 주소가 가요.' : ''}` },
    { label: '이전되는 나라', value: '미국, 영국, 싱가포르, 호주, 독일, 포르투갈, 프랑스, 일본, 캐나다, 네덜란드, 아랍에미리트, 인도, 멕시코, 말레이시아, 스웨덴. Cloudflare가 한국 이용자에게 안내한 나라예요.' },
    { label: '이전되는 때와 방법', value: `신청 폼에 입력을 시작하거나 신청할 때${MEDIA_ON ? ', 영상과 이미지 파일을 받을 때' : ''} 브라우저가 Cloudflare로 직접 전송해요.` },
    { label: '보유 기간', value: '봇 확인과 기능 개선에 필요한 동안이에요. Cloudflare는 일수를 밝히지 않아요.' },
    mail('dpo@cloudflare.com'),
    subprocessors('https://www.cloudflare.com/gdpr/subprocessors/cloudflare-services/'),
  ),
  ...(GA_ON ? [group('Google LLC',
    { label: '이용 목적', value: '사이트 방문 통계' },
    { label: 'Google이 직접 쓰는 목적', value: "Google은 데이터 공유 설정을 모두 끄면 이 정보를 애널리틱스 서비스의 제공과 유지, 보호에만 쓴다고 밝혀요. '자동으로 수집하는 정보와 쿠키' 항목에 연결한 'Google의 정보 처리 안내'는 Google 서비스 전반에 관한 설명이에요." },   // TODO(ga-settings): 관리 화면에서 공유 설정 4개와 Google 신호, 광고 개인화를 끈 화면을 남긴 뒤 값 맨 앞에 '스딩은 Google 애널리틱스의 데이터 공유 설정을 모두 끄고 Google 신호와 광고 개인화도 껐어요. '를 넣는다
    { label: '이전 유형', value: TRANSFER_TYPE.google },
    { label: '이전되는 항목', value: USAGE },
    { label: '이전되는 나라', value: '미국(이전받는 Google LLC가 있는 나라). Google은 자신이나 다시 맡긴 업체가 시설을 둔 다른 나라에서도 처리할 수 있다고 밝혀요. 데이터센터가 있는 나라는 공개하지만, Google 애널리틱스 데이터를 그 가운데 어느 나라에서 처리하는지는 공개 문서에 적지 않아요.' },
    { label: 'Google 데이터센터', value: '위치 보기', href: 'https://datacenters.google/locations/' },
    { label: '이전되는 때와 방법', value: '페이지를 열 때와, 버튼을 누르거나 자주 묻는 질문을 펼칠 때처럼 사이트를 이용하는 동안 브라우저가 Google로 직접 전송해요.' },
    { label: '보유 기간', value: '쿠키 식별자와 연결된 사용자·이벤트 단위의 이용 기록은 2개월 보관해요. 기간이 지난 기록은 Google이 매달 한 번 지워요. 방문 수처럼 모아 낸 통계 보고서는 이 기간과 상관없이 남아요.' },   // TODO(ga-settings): 관리 화면에서 보관 2개월과 '새 활동 시 사용자 데이터 재설정' 끔을 확인한 뒤 지운다
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
      { p: '출시 알림 신청에는 문자를 보내는 데 필요한 번호만 받아요. 이름과 이메일은 받지 않아요.' },
      { p: "스딩이 저장하는 신청 정보에 IP 주소는 들어가지 않아요. 사이트에 접속할 때 자동으로 처리되는 정보는 '자동으로 수집하는 정보와 쿠키' 항목에 따로 적었어요." },
    ] },
    { id: 'children', title: '만 14세 미만 아동', blocks: [
      { p: `${COPY.waitlist.age} 스딩은 나이를 따로 묻지 않고, 법정대리인 동의 절차도 두지 않아요. 만 14세 미만 아동이 신청했거나 아동의 번호로 신청된 사실을 알게 되면 안내 문자를 보내지 않고 그 번호를 지체 없이 파기해요. 법정대리인은 '개인정보 보호책임자' 항목의 연락처로 삭제를 요구할 수 있어요.` },
    ] },
    { id: 'retention', title: '처리 및 보유 기간', blocks: [
      { p: `번호는 ${retention.value}해요.`, strong: true },   // 동의 고지의 값을 그대로 읽는다
      { p: '안내 문자를 보내지 못한 번호도 정식 오픈 안내 문자를 보낸 날을 기준으로 같은 기간 안에 함께 파기해요. 번호와 함께 저장한 신청 시각, 동의 시각, 동의 문구 버전, 안내 문자 발송 시각도 같이 지워요. 동의를 철회하면 지체 없이 파기해요.' },
      { p: "업체가 처리하는 정보의 보유 기간은 '처리 위탁과 국외 이전' 항목에 적었어요." },
    ] },
    { id: 'destruction', title: '파기 절차와 방법', blocks: [
      { p: '보유 기간이 지나거나 처리 목적을 이루어 필요 없어진 개인정보는 지체 없이 파기해요.' },
      // TODO(export-file): 문자를 보내려고 내려받는 파일의 삭제 절차를 정하면 파기 방법에 더한다
      { rows: rows(
        { label: '파기 절차', value: '파기할 정보를 고르고 개인정보 보호책임자의 승인을 받아 파기해요. 파기한 뒤에는 책임자가 결과를 확인하고, 파기한 날짜와 건수를 기록으로 남겨요.' },
        { label: '파기 방법', value: '데이터베이스에서 지운 뒤 되살리지 않도록 관리해요. 백업에 남은 정보는 백업 보관 기간이 끝나면 함께 지워져요.' },
      ) },
    ] },
    { id: 'transfer', title: '처리 위탁과 국외 이전', blocks: [
      { p: "스딩은 사이트 운영과 신청 처리를 아래 업체에 맡겨요. 해외 사업자이거나 해외에서 처리할 수 있는 곳이라 처리 위탁과 국외 이전 내용을 업체마다 함께 적었어요. 이전 유형의 처리위탁은 스딩이 맡긴 일을 업체가 대신 처리한다는 뜻이고, 보관은 국외에 있는 서버에 저장한다는 뜻이에요. '직접 쓰는 목적'은 스딩이 맡긴 일이 아니라 업체가 스스로 정해 쓰는 목적이에요. 스딩은 신청 정보를 업체에 맡겨 처리할 뿐 다른 곳에 제공하지 않아요. 다만 법률에 특별한 규정이 있으면 그에 따라 제공할 수 있어요." },
      { groups: [...VENDORS, group('국외 이전의 근거와 거부 방법',
        { label: '근거', value: TRANSFER_BASIS },
        { label: '거부 방법과 효과', value: `출시 알림을 신청하지 않으면 번호는 이전되지 않아요. 이미 신청했다면 개인정보 보호책임자에게 동의 철회를 요청해 주세요. 번호의 이전을 거부하면 출시 알림을 받을 수 없어요. 봇 확인 정보는 신청 폼에 입력하지 않으면 Cloudflare로 가지 않지만, 그러면 신청할 수 없어요. 사이트 접속 기록은 사이트를 보여 주는 데 필요해서 사이트를 열면 Vercel로 이전돼요. 사이트를 이용하지 않는 방법으로만 거부할 수 있고, 거부하면 사이트를 볼 수 없어요.${MEDIA_ON ? ' 영상과 이미지 파일을 받을 때 Cloudflare로 가는 접속 기록도 같아요.' : ''}${GA_ON ? " Google로 가는 이용 기록은 '자동으로 수집하는 정보와 쿠키' 항목의 Google 애널리틱스 차단 부가 기능을 설치할 수 있는 브라우저에서 막을 수 있고, 막아도 사이트는 그대로 쓸 수 있어요. 쿠키를 막는 것만으로는 이 전송이 멈추지 않아요." : ''}` },
      )] },
      // TODO(sms-vendor): 업체가 정해지면 국내 위탁 묶음으로 더하고(국외에서 저장하거나 처리하면 VENDORS에 더한다) 이 문장을 지운다
      { p: '정식 오픈 안내 문자는 문자 발송 업체에 맡겨 보낼 예정이에요. 업체를 정하면 번호를 넘기기 전에 업체 이름, 맡기는 일, 업체가 번호를 갖고 있는 기간을 이 방침에 적고, 바뀐 내용과 시행일을 이 페이지에서 알려 드려요.' },
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
      { p: `쿠키는 웹사이트가 브라우저에 저장하는 작은 파일로, 다시 접속할 때 서버로 전송돼요. ${GA_ON ? '스딩이 설치한 Google 애널리틱스 태그가 sding.kr에 쿠키를 만들어요.' : '스딩이 직접 만드는 쿠키는 없어요.'} 소리 안내 말풍선을 다시 보이지 않으려고 브라우저에 임시 표시를 하나 남길 수 있는데, 이 표시는 서버로 보내지 않고 탭을 닫으면 지워져요.` },
      { rows: rows({ label: '처리 근거', value: AUTO_BASIS }) },
      { groups: [
        group('사이트 접속 기록',
          { label: '언제', value: '사이트에 접속할 때' },
          { label: '목적', value: '사이트를 보여 주고, 서버를 운영하고, 공격과 지나치게 많은 요청을 막아요.' },
          { label: '처리 항목', value: `IP 주소, ${TLS}, 브라우저 정보, 접속한 페이지 주소, 접속 시각. Vercel의 공개 문서에 적힌 항목이에요.` },
          { label: '처리하는 곳', value: 'Vercel Inc.' },
        ),
        group('Cloudflare Turnstile(봇 확인)',
          { label: '언제', value: '신청 폼에 입력을 시작하면 브라우저가 Cloudflare의 봇 확인 프로그램을 받고, 신청 버튼을 누르면 확인이 시작돼요.' },
          { label: '종류', value: '자바스크립트 프로그램(Cloudflare Turnstile)' },
          { label: '목적', value: '자동 신청을 막아 신청 폼을 보호해요. Cloudflare는 봇을 가려내는 기능을 개선하는 데도 이 정보를 써요.' },
          { label: '처리 항목', value: `IP 주소, ${TLS}, 브라우저 정보(User-Agent), 사이트 주소 같은 봇 확인 신호예요. 봇 확인 프로그램은 브라우저가 지원하는 기능과 특징, 사람이 쓰는지 알아보는 동작 같은 신호도 브라우저에서 모아요. Cloudflare의 공개 문서는 이런 신호를 예로 들 뿐 전체 목록을 적지 않아요. IP 주소는 브라우저가 Cloudflare에 직접 접속하면서 전달돼요. Cloudflare는 Turnstile이 폼에 입력한 값에 접근하거나 저장하거나 보내지 않는다고 밝혀요. 스딩 서버가 확인 결과를 물을 때도 확인 토큰과 키만 보내고, 번호와 IP 주소는 보내지 않아요.` },
          { label: '쿠키', value: 'Cloudflare는 상태를 유지하고 방문자의 행동을 추적하기 위해 쿠키와 브라우저 저장소를 써요. 이름과 보관 기간은 Cloudflare의 공개 문서에 없어요.' },
          { label: '처리하는 곳', value: 'Cloudflare, Inc.' },
          { label: '권리 요구', value: '봇 확인에 관한 요구는 스딩의 개인정보 보호책임자에게 해 주세요. Cloudflare가 기능 개선에 쓰는 정보에 관한 요구는 Cloudflare(dpo@cloudflare.com)에도 할 수 있어요.' },
          { label: '자세히 보기', value: 'Turnstile 개인정보 안내', href: 'https://www.cloudflare.com/turnstile-privacy-policy/' },
        ),
        ...(MEDIA_ON ? [group('영상과 이미지 파일',
          { label: '언제', value: '영상과 이미지 파일을 받을 때' },
          { label: '목적', value: '영상과 이미지 파일을 전송해요.' },
          { label: '처리 항목', value: 'IP 주소, 브라우저 정보, 요청한 파일 주소' },
          { label: '처리하는 곳', value: 'Cloudflare, Inc.' },
        )] : []),
        ...(GA_ON ? [group('Google 애널리틱스(방문 통계)',
          { label: '언제', value: '페이지를 열 때와 이용하는 동안이에요. 화면을 끝까지 내리거나, 기능 소개 구역이 화면에 보이거나, 버튼이나 다른 사이트로 가는 링크를 누르거나, 영상이 재생되거나, 자주 묻는 질문을 펼칠 때 보내요.' },   // 향상된 측정에서 스크롤과 이탈 클릭을 끄면 '화면을 끝까지 내리거나'와 '다른 사이트로 가는 링크'를 뺀다
          { label: '종류', value: '자바스크립트 태그(Google 태그)' },
          { label: '목적', value: '어떤 화면과 버튼이 쓰이는지 통계를 내어 사이트를 고쳐요.' },
          { label: '쿠키', value: '_ga(사용자 구분), _ga_로 시작하는 쿠키(세션 유지). sding.kr에 저장되는 쿠키라 서드 파티 쿠키를 막아도 막히지 않아요. 기간은 기본으로 마지막 방문부터 2년이고, 브라우저에 따라 더 짧을 수 있어요.' },
          { label: '처리 항목', value: `${USAGE}. 번호는 보내지 않아요.` },
          { label: '처리하는 곳', value: 'Google LLC' },
          { label: '자세히 보기', value: 'Google의 정보 처리 안내', href: 'https://policies.google.com/technologies/partner-sites?hl=ko' },
        )] : []),
        group('쿠키를 거부하는 방법',
          { label: '쿠키 차단', value: 'iPhone Safari는 설정 > 앱 > Safari > 고급 > 모든 쿠키 차단에서 막을 수 있어요. 다른 브라우저도 설정에서 쿠키를 차단하거나 지울 수 있어요.' },
          { label: '남기지 않고 보기', value: `Chrome의 새 시크릿 창, Edge의 새 InPrivate 창, 삼성 인터넷의 비밀 모드에서 생긴 쿠키는 그 창이나 탭을 모두 닫으면 지워져요. ${GA_ON ? '창이 열려 있는 동안에는 쿠키가 생기고 방문 통계도 Google로 보내질 수 있어요.' : '창이 열려 있는 동안에는 쿠키가 생길 수 있어요.'}` },
          { label: '차단하면', value: `봇 확인이 끝나지 않아 신청이 되지 않을 수 있어요.${GA_ON ? ' 쿠키를 막아도 방문 통계는 Google로 보내질 수 있어요. 방문 통계까지 막으려면 아래 차단 부가 기능을 써 주세요.' : ''}` },
          ...(GA_ON ? [{ label: 'Google 애널리틱스', value: '차단 부가 기능 받기', href: 'https://tools.google.com/dlpage/gaoptout', note: '(Google은 Chrome, Edge, Firefox, Safari용으로 안내해요. 휴대폰 브라우저에는 설치하지 못할 수 있어요.)' }] : []),
        ),
      ] },
    ] },
    { id: 'rights', title: '정보주체와 법정대리인의 권리·의무와 행사 방법', blocks: [
      { list: [
        '개인정보의 주인인 정보주체는 언제든 자신의 개인정보를 열람하거나, 고치거나 지우도록 요구할 수 있어요. 처리를 멈추도록 요구하거나 동의를 철회할 수도 있어요.',
        "'개인정보 보호책임자' 항목의 이메일이나 전화로 요구해 주세요. 출시 알림 신청에 관해서는 신청한 휴대폰 번호와 원하는 요구만 알려 주시면 돼요. 요구하는 데 드는 비용은 받지 않아요.",
        '법정대리인이나 위임받은 사람을 통해서도 요구할 수 있어요. 이때는 「개인정보 처리 방법에 관한 고시」 별지 제11호서식의 위임장을 내 주세요.',
        '요구한 분이 본인이거나 정당한 대리인인지 확인해요. 본인이 요구할 때는 신청할 때 없던 서류나 절차를 더 요구하지 않아요.',
        '번호가 바뀌었으면 새 번호로 다시 신청해 주세요. 전에 신청한 번호는 지워 달라고 하면 지워 드려요.',
        '법률에 따라 금지되거나 다른 사람의 생명, 신체, 재산 같은 이익을 해칠 우려가 있는 경우처럼 법이 정한 때에는 요구가 제한될 수 있어요. 이때는 그 이유와 이의를 제기하는 방법을 알려 드려요.',
        '열람을 요구하면 받은 날부터 10일 안에 열람할 수 있게 해 드려요. 정정·삭제와 처리정지는 지체 없이 조치하고, 요구를 받은 날부터 10일 안에 결과를 알려 드려요. 동의를 철회하면 지체 없이 파기해요.',
        '결과에 동의하지 않으면 같은 연락처로 이의를 제기할 수 있어요. 개인정보 보호책임자가 다시 살펴보고 결과를 알려 드려요.',
        '다른 사람의 번호로 신청하지 말아 주세요. 그 번호를 쓰는 분이 원하지 않는 문자를 받게 될 수 있어요.',
      ] },
    ] },
    { id: 'officer', title: '개인정보 보호책임자', blocks: [
      { p: '개인정보 처리에 관한 문의, 불만 처리, 피해 구제는 아래 책임자에게 연락해 주세요. 열람, 정정·삭제, 처리정지, 동의 철회 요구도 같은 곳에서 받아요.' },
      // TODO(contact): 성명과 전화번호, 이메일을 전달받으면 company.ts를 채운다. 운영 빌드는 빈 값이면 멈춘다
      { rows: rows({ label: '성명', value: COMPANY.privacyOfficer }, ...contactRows) },
    ] },
    { id: 'remedy', title: '권익 침해 구제 방법', blocks: [
      { p: '개인정보 침해로 피해를 입었거나 상담이 필요하면 아래 기관에 분쟁 조정이나 상담을 신청하거나 신고할 수 있어요.' },
      { rows: [   // 공개 직전에 번호와 주소를 다시 확인한다
        { label: '개인정보 분쟁조정위원회', value: 'www.kopico.go.kr', href: 'https://www.kopico.go.kr', note: '국번 없이 1833-6972' },
        { label: '개인정보침해 신고센터(한국인터넷진흥원 운영)', value: 'privacy.kisa.or.kr', href: 'https://privacy.kisa.or.kr', note: '국번 없이 118' },
        { label: '경찰청 사이버범죄 신고시스템', value: 'ecrm.police.go.kr', href: 'https://ecrm.police.go.kr', note: '국번 없이 182' },
      ] },
    ] },
    { id: 'changes', title: '개인정보 처리방침의 시행과 변경', blocks: [
      { rows: effectiveRows },
      { p: '이 방침을 바꾸면 바뀌는 내용과 시행일을 이 페이지에서 알려 드려요. 바뀐 내용은 변경 전과 후를 나란히 비교해 보여 드려요. 이전 방침과 그 방침을 적용한 기간도 이 항목에서 계속 볼 수 있게 남겨요.' },   // 첫 변경 전에 이전 판을 담는 배열과 그리는 자리를 만든다(policy-notice)
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
      { p: '앱이 만든 결과물에는 AI로 생성했다는 사실을 표시할 예정이에요. 실제와 구분하기 어려운 이미지와 영상은 이용자가 명확하게 알아볼 수 있게 표시할 예정이에요. 앱을 출시하면 앱의 약관과 화면에서 이 내용을 다시 알려 드려요.' },
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
      { p: '이 약관을 바꾸면 바뀐 내용, 바꾼 이유, 시행일을 시행일 7일 전부터 이 사이트에서 알려 드려요. 이용자에게 불리하게 바꿀 때는 30일 전부터 알려 드려요. 바뀌기 전과 후를 비교할 수 있게 함께 보여 드려요.' },
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
