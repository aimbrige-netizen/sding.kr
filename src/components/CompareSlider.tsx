'use client';

import { useRef, type MouseEvent, type PointerEvent } from 'react';
import { Chevrons } from './Icons';

type Props = {
  before: string;
  after: string;
  alt: string;
  labels: { label: string; before: string; after: string };
};

const START = 50;
const MIN = 10;     // 양쪽 이미지가 늘 조금은 보이게 끝을 막는다
const MAX = 90;
const STEP = 5;     // 방향키 한 번
const SWIPE = 8;    // 손가락이 옆으로 이만큼(px) 가고 세로보다 많이 움직여야 드래그로 본다. 스크롤에는 경계가 튀지 않는다

// 원본과 AI 합성을 좌우로 비교한다. 경계는 프레임 어디서나 끌고, 손가락은 톡 눌러도 옮긴다(WCAG 2.5.7).
// 키보드와 스크린리더는 숨은 range를 쓰고, 방향키는 브라우저 기본 동작이다. 이미지 설명은 range와 따로 둔다
export function CompareSlider({ before, after, alt, labels }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const rangeRef = useRef<HTMLInputElement>(null);
  const drag = useRef<{ id: number; x: number; y: number; live: boolean } | null>(null);

  const valueText = (value: number) => `${labels.before} ${value}%, ${labels.after} ${100 - value}%`;

  const set = (value: number) => {
    const next = Math.min(MAX, Math.max(MIN, value));
    rootRef.current?.style.setProperty('--pos', `${next}%`);
    const range = rangeRef.current;
    if (!range) return;
    range.value = String(next);
    range.setAttribute('aria-valuetext', valueText(Math.round(next)));
  };

  const moveTo = (event: MouseEvent<HTMLDivElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    set(((event.clientX - box.left) / box.width) * 100);
  };

  const onDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!event.isPrimary) {   // 두 번째 손가락은 확대일 수 있다. 아직 드래그가 아닌 첫 손가락을 놓아 준다
      if (!drag.current?.live) drag.current = null;
      return;
    }
    if (event.button !== 0 || event.ctrlKey) return;   // macOS의 Ctrl+클릭은 메뉴가 열려 pointerup이 오지 않는다
    event.currentTarget.setPointerCapture(event.pointerId);
    const live = event.pointerType === 'mouse';
    drag.current = { id: event.pointerId, x: event.clientX, y: event.clientY, live };
    if (live) moveTo(event);
  };

  const onMove = (event: PointerEvent<HTMLDivElement>) => {
    const now = drag.current;
    if (now?.id !== event.pointerId) return;
    if (event.pointerType === 'mouse' && !(event.buttons & 1)) {   // 창 전환이나 메뉴로 pointerup을 놓쳤다. 붙들어 두면 다음 클릭이 다른 곳에 가지 못한다
      drag.current = null;
      event.currentTarget.releasePointerCapture(event.pointerId);
      return;
    }
    if (!now.live) {
      const dx = Math.abs(event.clientX - now.x);
      if (dx < SWIPE || dx <= Math.abs(event.clientY - now.y)) return;
      now.live = true;
    }
    moveTo(event);
  };

  // 세로 스크롤이 시작되면 브라우저가 포인터를 거둔다(pointercancel). 경계는 그대로 둔다
  const onEnd = (event: PointerEvent<HTMLDivElement>) => {
    if (drag.current?.id === event.pointerId) drag.current = null;
  };

  // 톡 누른 자리로 옮긴다. 스크롤을 멈추려고 누른 손가락에는 브라우저가 click을 보내지 않는다.
  // 키보드와 스크린리더의 click(detail 0)에는 좌표가 없다
  const onClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.detail > 0) moveTo(event);
  };

  return (
    <div ref={rootRef} className="compare" onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onEnd} onPointerCancel={onEnd} onClick={onClick}>
      <div className="cmp-stack" role="img" aria-label={alt}>
        {/* eslint-disable-next-line @next/next/no-img-element -- 비교 이미지는 슬롯 사양의 크기로 올린다 */}
        <img src={after} alt="" draggable={false} loading="lazy" decoding="async" />
        <div className="cmp-before">
          {/* eslint-disable-next-line @next/next/no-img-element -- 위와 같다 */}
          <img src={before} alt="" draggable={false} loading="lazy" decoding="async" />
          <span className="cmp-tag">{labels.before}</span>
        </div>
      </div>
      <span className="cmp-line" />
      <input
        ref={rangeRef}
        className="cmp-range"
        type="range"
        min={MIN}
        max={MAX}
        step={STEP}
        defaultValue={START}
        autoComplete="off"   // Firefox가 새로고침 때 값을 되살리면 경계 위치와 어긋난다
        aria-label={labels.label}
        aria-valuetext={valueText(START)}
        onChange={(event) => set(event.currentTarget.valueAsNumber)}
      />
      <span className="cmp-knob"><Chevrons /></span>
    </div>
  );
}
