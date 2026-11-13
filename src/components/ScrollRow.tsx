'use client';

import { useEffect, useRef, type ReactNode } from 'react';

// 폰에서 가로로 넘기는 디테일 컷 줄(정찰제). 넘칠 때만 Tab으로 들러 화살표 키로 넘길 수 있게 한다.
// 넘치지 않는 데스크톱(네 장이 한 줄)에서는 들르지 않는다. 사진은 서버가 그린 그대로 children으로 받는다
export function ScrollRow({ label, className, children }: { label: string; className: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const sync = () => {
      if (el.scrollWidth > el.clientWidth + 1) el.tabIndex = 0;
      else el.removeAttribute('tabindex');
    };
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return <div ref={ref} role="group" aria-label={label} className={className}>{children}</div>;
}
