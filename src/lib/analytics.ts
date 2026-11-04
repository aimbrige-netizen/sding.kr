import type { CtaMode } from './launch';

// GA4 이벤트 8개(PLAN '분석 이벤트'). 매개변수는 아래의 정해진 값만 받는다. 번호와 입력값은 어떤 매개변수에도 넣지 않는다.
// 이름은 GA의 예약 이벤트(form_submit, video_progress 등)를 피한다.
// ID가 없거나 gtag가 없으면 아무것도 보내지 않는다. 함수는 브라우저에서만 부른다
export const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? '';

type MediaId = 'hero' | 'zone1' | 'zone2' | 'zone3' | 'zone4';
export type FormResult = 'success' | 'phone' | 'consent' | 'challenge' | 'invalid' | 'server';
export type CtaLocation = 'header' | 'hero' | 'final' | 'dialog';

type Events = {
  cta_click: { location: CtaLocation; mode: CtaMode };
  sound_toggle: { state: 'on' | 'off' };
  video_play: { media_id: MediaId };
  video_milestone: { media_id: MediaId; mark: '3s' | '25%' | '50%' | '75%' | '100%' };
  video_fallback: { reason: 'reduced_motion' | 'save_data' | 'low_power' | 'rejected' };
  zone_view: { zone_id: string };
  faq_open: { faq_id: string };
  waitlist_submit: { result: FormResult };
};

type GtagWindow = Window & { gtag?: (command: 'event', name: string, params: object) => void };

export function track<Name extends keyof Events>(name: Name, params: Events[Name]) {
  if (GA_ID) (window as GtagWindow).gtag?.('event', name, params);
}

// 페이지를 다시 불러올 때까지 한 번만 보낸다. 다른 페이지에 갔다가 홈으로 돌아와 컴포넌트가 새로 생겨도 그대로다
const sent = new Set<string>();

export function trackOnce<Name extends keyof Events>(name: Name, params: Events[Name]) {
  const key = name + JSON.stringify(params);
  if (sent.has(key)) return;
  sent.add(key);
  track(name, params);
}

// 처음 재생될 때와 3초, 25·50·75·100%를 지날 때 보낸다.
// 영상은 반복 재생이라 ended가 없다. 끝에서 처음으로 되돌아가는 순간을 100%로 잡는다
export function trackVideo(video: HTMLVideoElement, media_id: MediaId) {
  if (!GA_ID) return () => {};
  let last = 0;
  const onPlaying = () => trackOnce('video_play', { media_id });
  const onEmptied = () => { last = 0; };   // 모바일 컷과 데스크톱 컷을 바꿀 때
  const onTime = () => {
    const { currentTime: now, duration } = video;
    if (!Number.isFinite(duration) || duration <= 0) return;
    const looped = now < last && last > duration * 0.9;
    last = now;
    if (looped || now >= 3) trackOnce('video_milestone', { media_id, mark: '3s' });
    for (const mark of ['25%', '50%', '75%'] as const) {
      if (looped || now / duration * 100 >= parseInt(mark)) trackOnce('video_milestone', { media_id, mark });
    }
    if (looped) trackOnce('video_milestone', { media_id, mark: '100%' });
  };
  video.addEventListener('playing', onPlaying);
  video.addEventListener('emptied', onEmptied);
  video.addEventListener('timeupdate', onTime);
  return () => {
    video.removeEventListener('playing', onPlaying);
    video.removeEventListener('emptied', onEmptied);
    video.removeEventListener('timeupdate', onTime);
  };
}
