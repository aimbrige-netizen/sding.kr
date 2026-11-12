'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import type { FeatureId } from '@/content/features';
import { track, trackOnce } from '@/lib/analytics';
import type { CtaMode } from '@/lib/launch';

const STEPS = Array.from({ length: 11 }, (_, i) => i / 10);

// 방문자가 질문(summary)을 눌러 여닫은 FAQ 항목. 첫 질문은 처음부터 펼쳐져 있고, 홈으로 돌아올 때도 펼친 채 다시 그려지며,
// 페이지 내 찾기도 항목을 연다. 이때도 toggle이 오므로 누른 표시가 있는 열림만 센다
const PRESSED = new WeakSet<HTMLDetailsElement>();

// 여러 컴포넌트에 걸친 이벤트를 문서 쪽에서 듣는다. GA ID가 있을 때만 붙고, 서버 컴포넌트를 클라이언트로 바꾸지 않아도 된다
export function AnalyticsEvents({ mode }: { mode: CtaMode }) {
  const pathname = usePathname();

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      // 키보드(Enter, Space)로 여닫아도 summary에 같은 click이 온다. 아래 CTA 확인이 먼저 돌아가기 전에 표시한다
      const item = (event.target as Element).closest('summary')?.parentElement;
      if (item instanceof HTMLDetailsElement && item.dataset.faq) PRESSED.add(item);
      const press = (event.target as Element).closest<HTMLElement>('[data-cta], .wl-submit, .store-link');
      // 신청 취소 폼의 버튼도 같은 모양(.wl-submit)이지만 세지 않는다. 취소는 번호와 이어진 행동이다
      if (!press || press.getAttribute('aria-disabled') === 'true' || press.closest('[data-withdraw]')) return;
      const location = press.dataset.cta === 'header' || press.dataset.cta === 'hero' ? press.dataset.cta : press.closest('dialog') ? 'dialog' : 'final';
      track('cta_click', { location, mode });
    };
    // toggle은 올라오지 않으므로 내려가는 쪽에서 듣는다. 표시를 먼저 지워, 닫을 때 남은 표시가 나중의 자동 열림을 세지 않게 한다
    const onToggle = (event: Event) => {
      const item = event.target;
      if (!(item instanceof HTMLDetailsElement) || !item.dataset.faq) return;
      const byUser = PRESSED.delete(item);
      if (item.open && byUser) track('faq_open', { faq_id: item.dataset.faq });
    };
    document.addEventListener('click', onClick);
    document.addEventListener('toggle', onToggle, true);
    return () => {
      document.removeEventListener('click', onClick);
      document.removeEventListener('toggle', onToggle, true);
    };
  }, [mode]);

  // 세로로 긴 섹션은 요소의 절반이 한 화면에 들어오지 않으므로, 화면의 절반을 차지해도 본 것으로 친다
  useEffect(() => {
    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        const half = Math.min(entry.boundingClientRect.height, entry.rootBounds?.height ?? innerHeight) / 2;
        if (entry.intersectionRect.height < half) continue;
        io.unobserve(entry.target);
        trackOnce('feature_view', { feature_id: (entry.target as HTMLElement).dataset.feature as FeatureId });
      }
    }, { threshold: STEPS });
    for (const section of document.querySelectorAll('section[data-feature]')) io.observe(section);
    return () => io.disconnect();
  }, [pathname]);

  return null;
}
