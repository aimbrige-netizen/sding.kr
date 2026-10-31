'use client';

import Link from 'next/link';
import { useRef, type ReactNode } from 'react';
import { openWaitlist } from './WaitlistDialog';

// 헤더와 히어로의 CTA(PLAN 'CTA 전환'). 문구와 신청 창의 내용은 ctaMode()를 부르는 서버 쪽이 정한다.
// onNavigate는 일반 클릭에서만 불린다. Ctrl·Cmd 클릭, 하이드레이션 전 클릭, dialog가 없는 브라우저와 JS 끔은 링크대로 마지막 섹션으로 간다.
// data-cta는 후킹의 눈이 키보드 포커스를 따라갈 때 읽는다
export function CtaButton({ className, children }: { className: string; children: ReactNode }) {
  const ref = useRef<HTMLAnchorElement>(null);
  return (
    <Link
      ref={ref}
      href="/#waitlist"
      data-cta
      className={className}
      onNavigate={(event) => {
        if (openWaitlist(ref.current)) event.preventDefault();
      }}
    >
      {children}
    </Link>
  );
}
