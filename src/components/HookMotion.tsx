'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { useSound } from './VideoProvider';
import { FONT_PROBE, FONT_WAIT_MS, HOOK_READY } from '@/lib/fonts';
import { daysToLaunch } from '@/lib/launch';

const LOOK_MS = 1600;       // 사운드 버디를 쳐다보는 시간
const PUPIL_MAX = 0.056;    // em. 눈동자가 흰자 안에 머무는 거리

type Look = { at: (target: Element) => void; home: () => void; pointer: () => boolean };
type Props = { className: string; sample: string; children: ReactNode };

// 후킹의 움직임. 글자는 서버가 그리고, 여기서는 반복 모션, 눈동자, D-day를 맡는다.
// 등장 신호(html.hook-ready)는 Hero가 HTML에 넣은 스크립트가 건다(lib/fonts.ts)
export function HookMotion({ className, sample, children }: Props) {
  const ref = useRef<HTMLParagraphElement>(null);
  const look = useRef<Look | null>(null);
  const { soundOn } = useSound();

  // 다른 페이지에서 이동해 히어로가 브라우저에서 새로 그려지면 HTML의 스크립트가 실행되지 않는다. 같은 대기를 여기서 한다.
  // 웹폰트가 준비되면(최대 700ms) 글자가 올라온다. 대체 글꼴에서는 눈과 반짝임 위치가 글자와 어긋난다
  useEffect(() => {
    const html = document.documentElement;
    if (html.classList.contains(HOOK_READY)) return;
    let frame = 0;
    const ready = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => html.classList.add(HOOK_READY));
    };
    const timer = window.setTimeout(ready, FONT_WAIT_MS);
    document.fonts.load(FONT_PROBE, sample).then(ready, ready);
    return () => {
      window.clearTimeout(timer);
      cancelAnimationFrame(frame);
    };
  }, [sample]);

  // 정적 HTML의 D-day는 생성 시점 값이다. 브라우저에서 다시 계산한다. 오픈일이 지나면 다음 재생성에서 날짜로 바뀐다
  useEffect(() => {
    const days = daysToLaunch();
    if (days <= 0) return;
    ref.current?.querySelectorAll('[data-dday-n]').forEach((node) => {
      node.textContent = String(days);
    });
  }, []);

  // 반복 모션은 후킹이 화면에 있을 때만 돌고, 다시 보이면 처음부터 시작한다
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => {
      el.removeAttribute('data-idle');
      if (!entry.isIntersecting) return;
      void el.offsetWidth;
      el.setAttribute('data-idle', '');
    }, { threshold: 0.25 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // 눈동자: 기본은 아래 영상을 본다. 마우스를 따라보고, 키보드 포커스를 받은 CTA를 쳐다본다
  useEffect(() => {
    const el = ref.current;
    const eyes = el ? [...el.querySelectorAll<HTMLElement>('.eye')] : [];
    if (!eyes.length) return;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)');
    const fine = matchMedia('(hover: hover) and (pointer: fine)');
    let pointer = false;
    let frame = 0;
    let px = 0;
    let py = 0;

    const aim = (x: number, y: number) => {
      if (reduce.matches) return;
      for (const eye of eyes) {
        const r = eye.getBoundingClientRect();
        const dx = x - (r.left + r.width / 2);
        const dy = y - (r.top + r.height / 2);
        const dist = Math.hypot(dx, dy) || 1;
        const k = Math.min(1, dist / 240) * PUPIL_MAX;
        eye.style.setProperty('--px', `${((dx / dist) * k).toFixed(4)}em`);
        eye.style.setProperty('--py', `${((dy / dist) * k).toFixed(4)}em`);
      }
    };
    const home = () => {
      for (const eye of eyes) {
        eye.style.removeProperty('--px');
        eye.style.removeProperty('--py');
      }
    };
    const at = (target: Element) => {
      const r = target.getBoundingClientRect();
      aim(r.left + r.width / 2, r.top + r.height / 2);
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' || !fine.matches) return;
      pointer = true;
      px = e.clientX;
      py = e.clientY;
      if (!frame) frame = requestAnimationFrame(() => { frame = 0; aim(px, py); });
    };
    const onLeave = () => {
      pointer = false;
      home();
    };
    const onFocus = (e: FocusEvent) => {
      if (e.target instanceof HTMLElement && e.target.matches('[data-cta]:focus-visible')) at(e.target);
    };
    const onBlur = (e: FocusEvent) => {
      if (e.target instanceof HTMLElement && e.target.matches('[data-cta]') && !pointer) home();
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    document.documentElement.addEventListener('mouseleave', onLeave);
    document.addEventListener('focusin', onFocus);
    document.addEventListener('focusout', onBlur);
    look.current = { at, home, pointer: () => pointer };
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('mouseleave', onLeave);
      document.removeEventListener('focusin', onFocus);
      document.removeEventListener('focusout', onBlur);
      look.current = null;
    };
  }, []);

  // 사운드 버디를 켜면 잠깐 버디를 쳐다본다
  useEffect(() => {
    const eyes = look.current;
    const buddy = document.getElementById('sound-buddy');
    if (!soundOn || !eyes || !buddy) return;
    eyes.at(buddy);
    const timer = window.setTimeout(() => { if (!eyes.pointer()) eyes.home(); }, LOOK_MS);
    return () => window.clearTimeout(timer);
  }, [soundOn]);

  return (
    <p ref={ref} className={className} lang="en">
      {children}
    </p>
  );
}
