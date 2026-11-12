import { SITE } from '@/content/site';

export type CtaMode = 'waitlist' | 'live';

const LAUNCH_AT = new Date(SITE.launchDate + 'T00:00:00+09:00').getTime();

export function ctaMode(now: Date = new Date()): CtaMode {
  const opened = now.getTime() >= LAUNCH_AT;
  const want = SITE.ctaOverride || (opened ? 'live' : 'waitlist');
  const hasStore = Boolean(SITE.store.ios || SITE.store.android);
  return want === 'live' && hasStore ? 'live' : 'waitlist';
}

// 날짜 문구는 SITE.launchDate 하나에서만 만든다
const ymd = () => SITE.launchDate.split('-').map(Number) as [number, number, number];
export const launchLabel = () => { const [, m, d] = ymd(); return `${m}월 ${d}일`; };        // 12월 25일
export const launchFull = () => { const [y, m, d] = ymd(); return `${y}년 ${m}월 ${d}일`; };  // 2026년 12월 25일
export const launchDotted = () => SITE.launchDate.replace(/-/g, '.');                         // 2026.12.25
