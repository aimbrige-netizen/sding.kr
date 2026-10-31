'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef, type ReactNode } from 'react';
import { Close } from './Icons';
import { Spans } from './Spans';
import { COPY } from '@/content/site';
import { hasTurnstileKey, loadTurnstile } from '@/lib/turnstile';

// CtaButton이 부른다. 하이드레이션 전에는 비어 있어 링크대로 이동한다
let open: ((from: HTMLElement | null) => boolean) | null = null;
export const openWaitlist = (from: HTMLElement | null) => open?.(from) ?? false;

// 키보드가 올라오면 고정 요소는 그 뒤에 가려진다. 지원 하한에서 키보드를 알 수 있는 값은 visualViewport뿐이다.
// 이 값은 창의 여백과 바깥을 눌렀을 때의 판단에만 쓰므로, 값이 틀려도 공간이 남거나 창이 닫힐 뿐 폼을 가리지 않는다
function trackViewport(dialog: HTMLDialogElement) {
  const viewport = window.visualViewport;
  if (!viewport) return () => {};
  const sync = (event?: Event) => {
    const zoomed = viewport.scale > 1.01;   // 손가락으로 확대한 동안은 배치를 바꾸지 않는다
    dialog.style.setProperty('--vv-top', `${zoomed ? 0 : Math.round(viewport.offsetTop)}px`);
    dialog.style.setProperty('--kb', `${zoomed ? 0 : Math.max(0, Math.round(dialog.clientHeight - viewport.height - viewport.offsetTop))}px`);
    // 라벨을 카드 맨 위로 올려 고지와 체크가 키보드 위에 남게 한다
    const field = document.activeElement;
    if (!zoomed && event?.type === 'resize' && field instanceof HTMLInputElement && field.type === 'tel') field.labels?.[0]?.scrollIntoView({ block: 'start' });
  };
  viewport.addEventListener('resize', sync);
  viewport.addEventListener('scroll', sync);
  sync();
  return () => {
    viewport.removeEventListener('resize', sync);
    viewport.removeEventListener('scroll', sync);
  };
}

// iOS는 주소창이 접혔거나 키보드가 떠 있으면 html의 overflow: hidden을 넘어 뒤 페이지를 움직인다.
// React의 onTouchMove는 passive라 직접 붙인다. 카드 스크롤과 두 손가락 확대, 확대한 화면의 이동은 막지 않는다
function holdPage(event: TouchEvent) {
  if (!event.cancelable || event.touches.length > 1 || (window.visualViewport?.scale ?? 1) > 1.01) return;
  const card = (event.currentTarget as HTMLElement).firstElementChild!;
  if (!card.contains(event.target as Node) || card.scrollHeight <= card.clientHeight) event.preventDefault();
}

const coarse = () => matchMedia('(pointer: coarse)').matches;
const DOUBLE_PRESS = 400;   // 창을 연 버튼의 두 번째 누름이 창에 떨어지는 시간(ms)

// 헤더와 히어로 CTA가 여는 창(PLAN '전역 요소'). 어느 페이지에서나 열리도록 레이아웃에 하나만 둔다.
// 내용은 레이아웃이 children으로 넘긴다. 닫아도 언마운트하지 않아 입력값이 남는다
export function WaitlistDialog({ title, description, children }: { title: string; description: string[]; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const stopTracking = useRef(() => {});
  const pressedOutside = useRef(false);
  const typing = useRef(false);
  const openedAt = useRef(0);
  const pathname = usePathname();

  useEffect(() => {
    const element = ref.current;
    element?.addEventListener('touchmove', holdPage, { passive: false });
    open = (from) => {
      const dialog = ref.current;
      if (!dialog || typeof dialog.showModal !== 'function') return false;
      if (dialog.open) return true;
      opener.current = from;
      dialog.showModal();
      openedAt.current = performance.now();
      cardRef.current?.scrollTo(0, 0);   // 브라우저가 지난 스크롤을 되살리면 포커스가 화면 밖에서 시작한다
      stopTracking.current = trackViewport(dialog);
      // Safari 16은 안쪽 폼에 스스로 포커스를 주지 못하므로 직접 옮긴다.
      // 터치 기기에서 입력칸을 바로 잡으면 키보드가 동의 고지와 버튼을 가리므로 제목에서 시작한다
      const field = dialog.querySelector<HTMLElement>('input[type="tel"]');
      (coarse() || !field ? titleRef.current : field)?.focus({ preventScroll: true });
      if (field && hasTurnstileKey) loadTurnstile().catch(() => {});
      return true;
    };
    return () => {
      open = null;
      element?.removeEventListener('touchmove', holdPage);
    };
  }, []);

  // 레이아웃은 페이지가 바뀌어도 남는다. 뒤로 가기로 페이지가 바뀌면 열린 창이 새 페이지를 막지 않게 닫는다
  useEffect(() => {
    if (ref.current?.open) ref.current.close();
  }, [pathname]);

  return (
    <dialog
      ref={ref}
      aria-labelledby="wl-title"
      aria-describedby="wl-desc"
      className="wl-dialog"
      onClickCapture={(event) => {
        // 두 번 누른 CTA의 두 번째 누름은 버린다. 창이 바로 닫히거나 읽지 않은 동의가 체크되지 않게 한다
        if (event.timeStamp - openedAt.current >= DOUBLE_PRESS) return;
        event.preventDefault();
        event.stopPropagation();
      }}
      onPointerDown={(event) => {
        pressedOutside.current = !(event.target as Element).closest('.wl-card');
        // 누르는 순간에 본다. click 때는 브라우저가 이미 포커스를 풀었다. 키보드를 내려도 포커스는 남으므로 높이도 본다
        const field = document.activeElement;
        typing.current = field instanceof HTMLInputElement && field.type === 'tel' && parseInt(event.currentTarget.style.getPropertyValue('--kb')) > 0;
      }}
      onClick={(event) => {
        // 카드를 걸친 드래그로는 닫지 않는다. click의 좌표가 손을 뗀 자리다. 키보드로 낸 click은 좌표가 0이라 대상도 본다
        const inCard = (element: Element | null) => element?.closest('.wl-card');
        const outside = pressedOutside.current && !inCard(event.target as Element) && !inCard(document.elementFromPoint(event.clientX, event.clientY));
        pressedOutside.current = false;
        if (!outside) return;
        // 키보드가 떠 있을 때 바깥을 누르면 키보드만 내린다
        if (typing.current) (document.activeElement as HTMLElement | null)?.blur();
        else event.currentTarget.close();
      }}
      onClose={() => {
        stopTracking.current();
        opener.current?.focus({ preventScroll: true });   // Safari는 클릭한 링크에 포커스를 주지 않아 close()가 돌려줄 곳이 없다
      }}
    >
      <div ref={cardRef} className="wl-card">
        <button type="button" aria-label={COPY.waitlist.close} className="wl-close" onClick={() => ref.current?.close()}>
          <Close />
        </button>
        <h2 ref={titleRef} id="wl-title" tabIndex={-1} className="wl-title">{title}</h2>
        <p id="wl-desc" className="wl-desc"><Spans parts={description} /></p>
        {children}
      </div>
    </dialog>
  );
}
