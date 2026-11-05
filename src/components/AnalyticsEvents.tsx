'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { track, trackOnce } from '@/lib/analytics';
import type { CtaMode } from '@/lib/launch';

const STEPS = Array.from({ length: 11 }, (_, i) => i / 10);

// 여러 컴포넌트에 걸친 이벤트를 문서 쪽에서 듣는다. GA ID가 있을 때만 붙고, 서버 컴포넌트를 클라이언트로 바꾸지 않아도 된다
export function AnalyticsEvents({ mode }: { mode: CtaMode }) {
  const pathname = usePathname();

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const press = (event.target as Element).closest<HTMLElement>('[data-cta], .wl-submit, .store-link');
      // 신청 취소 폼의 버튼도 같은 모양(.wl-submit)이지만 세지 않는다. 취소는 번호와 이어진 행동이다
      if (!press || press.getAttribute('aria-disabled') === 'true' || press.closest('[data-withdraw]')) return;
      const location = press.dataset.cta === 'header' || press.dataset.cta === 'hero' ? press.dataset.cta : press.closest('dialog') ? 'dialog' : 'final';
      track('cta_click', { location, mode });
    };
    // toggle은 올라오지 않으므로 내려가는 쪽에서 듣는다
    const onToggle = (event: Event) => {
      const item = event.target;
      if (item instanceof HTMLDetailsElement && item.open && item.dataset.faq) track('faq_open', { faq_id: item.dataset.faq });
    };
    document.addEventListener('click', onClick);
    document.addEventListener('toggle', onToggle, true);
    return () => {
      document.removeEventListener('click', onClick);
      document.removeEventListener('toggle', onToggle, true);
    };
  }, [mode]);

  // 세로로 긴 존은 요소의 절반이 한 화면에 들어오지 않으므로, 화면의 절반을 차지해도 본 것으로 친다
  useEffect(() => {
    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        const half = Math.min(entry.boundingClientRect.height, entry.rootBounds?.height ?? innerHeight) / 2;
        if (entry.intersectionRect.height < half) continue;
        io.unobserve(entry.target);
        trackOnce('zone_view', { zone_id: entry.target.id });
      }
    }, { threshold: STEPS });
    for (const zone of document.querySelectorAll('section[id^="zone-"]')) io.observe(zone);
    return () => io.disconnect();
  }, [pathname]);

  return null;
}
