'use client';

import Link from 'next/link';
import { useRef, type ReactNode } from 'react';
import { openWaitlist } from './WaitlistDialog';

// 헤더와 히어로의 CTA(PLAN 'CTA 전환'). 문구와 신청 창의 내용은 ctaMode()를 부르는 서버 쪽이 정한다.
// onNavigate는 일반 클릭에서만 불린다. Ctrl·Cmd 클릭, 하이드레이션 전 클릭, dialog가 없는 브라우저와 JS 끔은 링크대로 마지막 섹션으로 간다.
// data-cta는 cta_click 이벤트가 누른 자리(header, hero)를 읽을 때만 쓴다
export function CtaButton({ className, location, children }: { className: string; location: 'header' | 'hero'; children: ReactNode }) {
  const ref = useRef<HTMLAnchorElement>(null);
  return (
    <Link
      ref={ref}
      href="/#waitlist"
      data-cta={location}
      className={className}
      onNavigate={(event) => {
        if (openWaitlist(ref.current)) event.preventDefault();
      }}
    >
      {children}
    </Link>
  );
}
