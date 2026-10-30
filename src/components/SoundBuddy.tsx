'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { useSound } from './VideoProvider';

type Copy = { label: string; turnOn: string; turnOff: string; waiting: string; stopped: string; bubble: string };

const BUBBLE_KEY = 'sding-bubble';   // 말풍선을 이번 세션에 보였는지만 기록한다. 소리 상태는 저장하지 않는다
const BUBBLE_DELAY_MS = 2000;
const BUBBLE_SHOW_MS = 6000;
const TIP_FLASH_MS = 2400;           // 터치로 누른 뒤 툴팁을 보이는 시간

// 사운드 버디: 화면 오른쪽 아래에 고정된 소리 켜기·끄기 버튼. 방문마다 꺼진 상태로 시작한다(PLAN '소리와 사운드 버디')
export function SoundBuddy({ copy }: { copy: Copy }) {
  const { soundOn, state, stopped, toggle } = useSound();
  const tipId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const flashTimer = useRef(0);
  const [bubble, setBubble] = useState(false);
  const [tipClosed, setTipClosed] = useState(false);   // Esc로 닫은 툴팁(WCAG 1.4.13)
  const [tipFlash, setTipFlash] = useState(false);     // 터치 기기에서 누른 뒤 잠깐 보이는 툴팁

  // 첫 방문 2초 뒤 '소리 켜 볼까요?'를 6초 동안 보인다. 같은 세션에서는 다시 띄우지 않는다.
  // 2초는 탭이 보이는 동안만 잰다. 뒤쪽 탭에서 열면 아무도 못 본 채 말풍선이 지나간다
  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem(BUBBLE_KEY) === '1';
    } catch {
      // 저장소를 쓸 수 없으면 이번 방문에만 보인다
    }
    if (seen) return;
    let show = 0;
    let hide = 0;
    const wait = () => {
      window.clearTimeout(show);
      if (document.hidden) return;
      show = window.setTimeout(() => {
        document.removeEventListener('visibilitychange', wait);
        setBubble(true);
        try {
          sessionStorage.setItem(BUBBLE_KEY, '1');
        } catch {
          // 위와 같다
        }
        hide = window.setTimeout(() => setBubble(false), BUBBLE_SHOW_MS);
      }, BUBBLE_DELAY_MS);
    };
    wait();
    document.addEventListener('visibilitychange', wait);
    return () => {
      window.clearTimeout(show);
      window.clearTimeout(hide);
      document.removeEventListener('visibilitychange', wait);
    };
  }, []);

  // Esc로 툴팁을 닫는다. hover로 열린 툴팁도 닫히도록 문서에서 듣되, 툴팁이 열려 있을 때만 반응한다.
  // 마우스로 눌러 포커스만 남은 버튼에서 Esc를 누르면 브라우저가 :focus-visible을 켜므로 그때도 닫는다.
  // 닫힌 툴팁은 다음 hover나 포커스에서 다시 열린다
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const root = rootRef.current;
      if (e.key !== 'Escape' || !root) return;
      if (root.matches(':hover') || root.querySelector('.buddy-btn:focus-visible') || root.hasAttribute('data-tip-flash')) setTipClosed(true);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => () => window.clearTimeout(flashTimer.current), []);

  const onClick = () => {
    toggle();
    setBubble(false);
    // 터치 기기에는 hover가 없으므로 누른 뒤 툴팁을 잠깐 보여 지금 상태를 알린다
    if (!matchMedia('(hover: hover)').matches) {
      setTipClosed(false);
      setTipFlash(true);
      window.clearTimeout(flashTimer.current);
      flashTimer.current = window.setTimeout(() => setTipFlash(false), TIP_FLASH_MS);
    }
    // 누르면 0.92배로 눌렸다가 통통 튄다. 같은 애니메이션을 다시 시작하려고 속성을 지웠다 붙인다
    const root = rootRef.current;
    if (!root) return;
    root.removeAttribute('data-boing');
    void root.offsetWidth;
    root.setAttribute('data-boing', '');
  };

  // 켜짐·대기에서 소리 영상이 화면에 있는데 멈춰 있으면(방문자가 멈춤, 동작 줄이기, 저전력 모드) 재생을 눌러야 소리가 난다
  const tip = state === 'off' ? copy.turnOn : state === 'playing' ? copy.turnOff : stopped ? copy.stopped : copy.waiting;

  return (
    <div
      ref={rootRef}
      className="buddy"
      data-sound={state}
      data-bubble={(bubble && !soundOn) || undefined}
      data-tip-closed={tipClosed || undefined}
      data-tip-flash={tipFlash || undefined}
      onPointerEnter={() => setTipClosed(false)}
      onAnimationEnd={(e) => { if (e.target === e.currentTarget.querySelector('.buddy-body')) rootRef.current?.removeAttribute('data-boing'); }}
    >
      <p className="buddy-bubble" aria-hidden="true">{copy.bubble}</p>
      <button
        type="button"
        id="sound-buddy"
        className="buddy-btn"
        aria-label={copy.label}
        aria-pressed={soundOn}
        aria-describedby={tipId}
        onClick={onClick}
        onFocus={() => setTipClosed(false)}
      >
        <svg className="buddy-zz" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M3 15h5l-5 6h5" />
          <path d="M11 3h7l-7 8h7" />
        </svg>
        <span className="buddy-body">
          <svg className="buddy-svg" viewBox="0 0 64 64" aria-hidden="true" focusable="false">
            <circle className="b-body" cx="32" cy="32" r="32" />
            <ellipse className="b-gloss" cx="19" cy="14.5" rx="8.5" ry="4.6" transform="rotate(-30 19 14.5)" />
            <ellipse className="b-face" cx="32" cy="36" rx="20" ry="17" />
            <g className="b-eyes b-eyes-off">
              <path d="M22.6 33.4q3.1 3 6.2 0" />
              <path d="M35.2 33.4q3.1 3 6.2 0" />
            </g>
            <g className="b-eyes b-eyes-on">
              <path d="M22.6 35q3.1-3.6 6.2 0" />
              <path d="M35.2 35q3.1-3.6 6.2 0" />
            </g>
            <g className="b-eyes-wait">
              <circle cx="25.7" cy="34" r="2.7" />
              <circle cx="38.3" cy="34" r="2.7" />
              <circle className="b-glint" cx="26.7" cy="33" r="1" />
              <circle className="b-glint" cx="39.3" cy="33" r="1" />
            </g>
            <ellipse className="b-cheek" cx="20.6" cy="40.2" rx="3" ry="1.8" />
            <ellipse className="b-cheek" cx="43.4" cy="40.2" rx="3" ry="1.8" />
            <path className="b-mouth" d="M29.4 41.6h1.6l3.6-2.8v9.6l-3.6-2.8h-1.6a.8.8 0 0 1-.8-.8v-2.4a.8.8 0 0 1 .8-.8z" />
            <g className="b-waves">
              <path d="M37.2 41.4q1.7 1.8 0 3.6" />
              <path d="M39.8 39.6q3.4 3.6 0 7.2" />
            </g>
          </svg>
        </span>
        <svg className="buddy-notes" viewBox="0 0 32 40" aria-hidden="true" focusable="false">
          <g>
            <ellipse cx="9" cy="32" rx="3.4" ry="2.6" transform="rotate(-20 9 32)" />
            <path d="M11.6 31.2V21l5.4 1.8" />
          </g>
          <g>
            <ellipse cx="20" cy="18" rx="2.8" ry="2.2" transform="rotate(-20 20 18)" />
            <path d="M22.2 17.3V8.6" />
          </g>
        </svg>
      </button>
      <span id={tipId} role="tooltip" className="buddy-tip">{tip}</span>
    </div>
  );
}
