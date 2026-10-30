'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { PlayButtons } from './PlayButtons';

const RIDE_MS = 5200;          // 길이 존 4개를 다 잇는 시간
const HOLD_MS = 900;           // 다 그린 뒤 머무는 시간
const REDUCED_HOLD_MS = 2400;  // 동작 줄이기: 길을 한 번에 보이고 머무는 시간

type Props = { labels: { play: string; pause: string }; children: ReactNode };

// 영상 파일이 오기 전에 포스터 카드가 대신 보여 주는 '라이드'. 재생을 누르면 길이 존 순서대로 그려진다.
// 영상이 오면 MediaSlot이 VideoPlayer로 바꾸고 같은 버튼이 영상을 재생한다
export function RidePreview({ labels, children }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const ctrlRef = useRef<HTMLButtonElement>(null);
  const timer = useRef(0);
  const endAt = useRef(0);   // 라이드가 끝나는 시각(performance.now 기준)
  const left = useRef(0);    // 멈춘 동안 남은 시간
  const [riding, setRiding] = useState(false);   // 그리는 중(멈춤 포함)
  const [paused, setPaused] = useState(false);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  // 768px를 넘나들면 데스크톱·모바일 길이 바뀌어 그리던 길이 사라지므로 라이드를 끝낸다
  useEffect(() => {
    if (!riding) return;
    const wide = matchMedia('(min-width: 768px)');
    const end = () => {
      window.clearTimeout(timer.current);
      ref.current?.removeAttribute('data-ride');
      setRiding(false);
      setPaused(false);
    };
    wide.addEventListener('change', end);
    return () => wide.removeEventListener('change', end);
  }, [riding]);

  // 보이는 쪽 길(데스크톱 또는 모바일)의 구간 길이에 맞춰 구간별 시간과 존이 튀어 오를 때를 정한다
  const layout = (root: HTMLElement) => {
    const road = [...root.querySelectorAll<SVGSVGElement>('.road')].find((svg) => svg.getBoundingClientRect().width > 0);
    const legs = road ? [...road.querySelectorAll<SVGPathElement>('.leg')] : [];
    const stations = [...root.querySelectorAll<HTMLElement>('.st')];
    const lengths = legs.map((leg) => leg.getTotalLength());
    const total = lengths.reduce((a, b) => a + b, 0) || 1;
    let at = 0;
    legs.forEach((leg, i) => {
      const dur = (RIDE_MS * lengths[i]) / total;
      leg.style.setProperty('--delay', `${at}ms`);
      leg.style.setProperty('--dur', `${dur}ms`);
      at += dur;
      stations[i]?.style.setProperty('--at', `${at - 120}ms`);
    });
  };

  const finish = () => {
    ref.current?.removeAttribute('data-ride');
    setRiding(false);
    setPaused(false);
  };

  // 끝나는 시각은 타이머 하나가 정한다. 멈추면 남은 시간을 적어 두고 이을 때 다시 건다
  const schedule = (ms: number) => {
    window.clearTimeout(timer.current);
    endAt.current = performance.now() + ms;
    timer.current = window.setTimeout(finish, ms);
  };

  const start = () => {
    const root = ref.current;
    if (!root) return;
    if (riding) {
      if (!paused) return;   // 사라지는 중인 큰 버튼을 한 번 더 눌러도 라이드는 그대로 간다
      root.setAttribute('data-ride', 'on');
      setPaused(false);
      schedule(left.current);
      return;
    }
    layout(root);
    root.removeAttribute('data-ride');
    void root.offsetWidth;   // 애니메이션을 처음부터 다시 시작한다
    root.setAttribute('data-ride', 'on');
    setRiding(true);
    setPaused(false);
    schedule(matchMedia('(prefers-reduced-motion: reduce)').matches ? REDUCED_HOLD_MS : RIDE_MS + HOLD_MS);
  };

  const pause = () => {
    window.clearTimeout(timer.current);
    left.current = Math.max(0, endAt.current - performance.now());
    ref.current?.setAttribute('data-ride', 'paused');
    setPaused(true);
  };

  const playing = riding && !paused;

  return (
    <div ref={ref} className="ride">
      {children}
      <PlayButtons
        playing={playing}
        labels={labels}
        onPlay={() => {
          start();
          ctrlRef.current?.focus({ preventScroll: true });
        }}
        onToggle={() => (playing ? pause() : start())}
        ctrlRef={ctrlRef}
      />
    </div>
  );
}
