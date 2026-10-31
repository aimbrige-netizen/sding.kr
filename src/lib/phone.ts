// 화면과 API가 같은 함수를 쓴다(PLAN '사전 신청 API').
// 브라우저 자동 완성은 +821023456789나 1023456789로 넣기도 하므로, 자르거나 검사하기 전에 국내 형식으로 바꾼다
function toNational(raw: string): string {
  const d = raw.normalize('NFKC').replace(/\D/g, '');
  const intl = /^(?:00)?82(\d*)$/.exec(d);            // +82 10…, 82 10…, 0082 10…, +82 010…
  const n = intl?.[1] ? (intl[1].startsWith('0') ? intl[1] : `0${intl[1]}`) : d;   // 82만 친 값은 다음 숫자가 올 때까지 둔다
  return /^10[2-9]\d{7}$/.test(n) ? `0${n}` : n;      // 국가번호와 앞의 0이 함께 빠진 값
}

// 전기통신번호관리세칙 제20조: 이동전화는 010-ABYY-YYYY(A=2~9)
export function normalizePhone(raw: string): string | null {
  if (raw.length > 32) return null;
  const d = toNational(raw);
  return /^010[2-9]\d{7}$/.test(d) ? d : null;
}

// 입력 중 표시용: 010-2345-6789. 자리가 넘쳐도 자르지 않고 그대로 보여 검증에서 막는다
export function formatPhone(raw: string): string {
  const d = toNational(raw);
  return [d.slice(0, 3), d.slice(3, 7), d.slice(7)].filter(Boolean).join('-');
}
