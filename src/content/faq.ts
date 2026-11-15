// FAQ 화면과 FAQPage JSON-LD가 같은 배열을 읽는다. 답의 첫 문장이 곧 답이고 질문의 주제어를 되풀이한다(PLAN 'FAQ')
import { COPY, SITE } from './site';
import { FEATURES } from './features';
import { launchFull, type CtaMode } from '@/lib/launch';

export type FaqItem = { id: string; q: string; a: string; when?: CtaMode; hidden?: boolean };

const [price, planner, dress] = FEATURES;
const stores = [SITE.store.ios && 'App Store', SITE.store.android && 'Google Play'].filter(Boolean).join('와 ');
export const STORE_LINE = `스딩은 ${stores}에서 받을 수 있어요.`;

export const FAQ: FaqItem[] = [
  { id: 'what', q: '스딩은 무엇인가요?', a: SITE.definition },
  { id: 'price-rule', q: '웨딩 가격 정찰제는 무엇인가요?', a: price.definition },
  { id: 'planner', q: 'AI 웨딩 플래너는 무엇을 해 주나요?', a: planner.definition },
  { id: 'dress', q: 'AI 드레스 합성은 어떻게 쓰나요?',   // TODO(zone3-photo-policy)
    a: `${dress.definition} 결과는 AI 합성 이미지라 실제 착용 모습과 다를 수 있어요.` },
  { id: 'hall', q: '웨딩홀 시뮬레이션은 실제 웨딩홀과 같나요?',
    a: '웨딩홀 시뮬레이션은 실제 웨딩홀과 같지 않아요. AI가 만든 시뮬레이션이라 실제와 다를 수 있어요. 방문 전에 분위기와 동선을 확인하는 용도로 써 주세요.' },
  { id: 'when', q: '언제부터 쓸 수 있나요?', when: 'waitlist',
    a: `스딩은 ${launchFull()} 정식 오픈 예정이에요. 출시 알림을 신청하면 오픈하는 날 문자로 알려 드려요.` },
  { id: 'where', q: '어디서 쓸 수 있나요?', when: 'live', a: STORE_LINE },
  { id: 'fee', q: '이용 요금은 얼마인가요?', hidden: true, a: '' },   // TODO(fee)
  { id: 'phone', q: '출시 알림에 남긴 번호는 어떻게 쓰이나요?', when: 'waitlist',
    a: `출시 알림에 남긴 번호는 정식 오픈 안내 문자를 1회 보내는 데만 써요. ${COPY.waitlist.notice[2].value}해요.` },
];

export const faqFor = (mode: CtaMode): FaqItem[] => FAQ.filter((f) => !f.hidden && (!f.when || f.when === mode));
