'use client';

import { useEffect } from 'react';

// 스크롤 등장. 숨김 상태는 방문자가 스크롤을 시작할 때 첫 화면 아래에 있는 [data-reveal]에만 건다.
// 첫 화면에 보이는 요소와 JS가 없는 경우, 스크롤 없이 페이지 전체를 읽는 도구에는 글이 그대로 보인다
export function RevealArmer() {
  useEffect(() => {
    const items = [...document.querySelectorAll<HTMLElement>('[data-reveal]')];
    if (!items.length) return;
    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      }
    }, { threshold: 0.12 });
    const arm = () => {
      for (const item of items) {
        if (item.getBoundingClientRect().top <= window.innerHeight) continue;
        item.classList.add('is-armed');
        io.observe(item);
      }
    };
    window.addEventListener('scroll', arm, { once: true, passive: true });
    return () => {
      window.removeEventListener('scroll', arm);
      io.disconnect();
    };
  }, []);
  return null;
}
