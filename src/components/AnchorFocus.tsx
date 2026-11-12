'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

// 다른 페이지(/privacy, /terms, 404)에서 누른 '/#id' 링크의 id. 홈이 그려진 뒤 한 번 읽고 비운다.
// 페이지를 새로 열면 비어 있으므로, 주소로 바로 들어온 경우(QR의 /#waitlist)에는 포커스를 브라우저에 맡긴다
let pending = '';

// 앵커로 이동한 뒤 키보드 포커스가 섹션 제목을 따라가게 한다(PLAN '페이지 구조').
// id는 섹션에, tabindex='-1'은 제목에 있어 브라우저가 스스로 옮기지 않는다.
// 브라우저는 앵커 이동을 처리하며 포커스를 푼다. Firefox는 클릭 처리가 끝난 뒤에 따로 이동하므로 두 프레임 뒤에 옮긴다.
// Next는 페이지를 옮긴 뒤 포커스를 건드리지 않으므로, 다른 페이지에서 누른 머리글 링크는 새 페이지가 그려진 뒤 옮긴다.
// 레이아웃에 두어 모든 페이지에서 듣는다
export function AnchorFocus() {
  const pathname = usePathname();

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;   // 새 탭으로 여는 클릭
      const link = (event.target as Element).closest<HTMLAnchorElement>('a[href*="#"]');
      if (!link) return;
      if (link.pathname !== location.pathname) {
        if (link.hash) pending = decodeURIComponent(link.hash.slice(1));   // 다른 페이지로 간다. 그려진 뒤 아래 효과가 옮긴다
        return;
      }
      const section = document.getElementById(decodeURIComponent(link.hash.slice(1)));
      if (!section || section.hasAttribute('tabindex')) return;   // #main처럼 스스로 포커스를 받는 곳
      const heading = section.querySelector<HTMLElement>('h1[tabindex], h2[tabindex]');
      if (heading) requestAnimationFrame(() => requestAnimationFrame(() => heading.focus({ preventScroll: true })));
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  // 페이지가 바뀌면 남은 id를 한 번 읽고 비운다. 주소의 해시가 그 id일 때만 옮긴다.
  // 다른 페이지의 CTA는 이동 대신 신청 창을 열 수 있어, 그때 남은 id가 나중의 뒤로 가기에서 포커스를 옮기지 않게 한다
  useEffect(() => {
    const id = pending;
    pending = '';
    if (!id || decodeURIComponent(location.hash.slice(1)) !== id) return;
    const heading = document.getElementById(id)?.querySelector<HTMLElement>('h1[tabindex], h2[tabindex]');
    if (heading) requestAnimationFrame(() => requestAnimationFrame(() => heading.focus({ preventScroll: true })));
  }, [pathname]);

  return null;
}
