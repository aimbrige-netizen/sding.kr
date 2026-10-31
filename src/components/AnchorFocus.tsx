'use client';

import { useEffect } from 'react';

// 앵커로 이동한 뒤 키보드 포커스가 섹션 제목을 따라가게 한다(PLAN '페이지 구조').
// id는 섹션에, tabindex='-1'은 제목에 있어 브라우저가 스스로 옮기지 않는다.
// 브라우저는 앵커 이동을 처리하며 포커스를 푼다. Firefox는 클릭 처리가 끝난 뒤에 따로 이동하므로 두 프레임 뒤에 옮긴다
export function AnchorFocus() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;   // 새 탭으로 여는 클릭
      const link = (event.target as Element).closest<HTMLAnchorElement>('a[href*="#"]');
      if (!link || link.pathname !== location.pathname) return;
      const section = document.getElementById(decodeURIComponent(link.hash.slice(1)));
      if (!section || section.hasAttribute('tabindex')) return;   // #main처럼 스스로 포커스를 받는 곳
      const heading = section.querySelector<HTMLElement>('h1[tabindex], h2[tabindex]');
      if (heading) requestAnimationFrame(() => requestAnimationFrame(() => heading.focus({ preventScroll: true })));
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);
  return null;
}
