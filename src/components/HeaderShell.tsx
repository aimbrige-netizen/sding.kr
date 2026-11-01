'use client';

import { useEffect, useRef, type ReactNode } from 'react';

// 8px 이상 내리면 data-scrolled를 켠다. JS가 없으면 투명한 상태로 남는다
export function HeaderShell({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => el.toggleAttribute('data-scrolled', window.scrollY >= 8);
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);

  return (
    <header
      ref={ref}
      className="fixed inset-x-0 top-0 z-30 h-(--header-h) border-b px-(--gutter) border-transparent transition-[border-color,backdrop-filter] duration-200 ease-brand before:absolute before:inset-0 before:-z-10 before:bg-cream before:opacity-0 before:transition-opacity before:duration-200 data-scrolled:border-line data-scrolled:backdrop-blur-header data-scrolled:before:opacity-85 print:static"
    >
      {children}
    </header>
  );
}
