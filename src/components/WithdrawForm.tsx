'use client';

import { useEffect, useId, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { flushSync } from 'react-dom';
import { Sparkle } from './Icons';
import { COPY } from '@/content/site';
import { formatPhone, normalizePhone } from '@/lib/phone';
import { getToken, hasTurnstileKey, loadTurnstile, TURNSTILE_WITHDRAW } from '@/lib/turnstile';

const copy = COPY.waitlist;
const text = copy.withdraw;
const SEND_WAIT = 20_000;   // 신청과 같다. 서버 한도 15초보다 길다

type Failure = 'phone' | 'challenge' | 'server';

// 응답 표는 신청과 같다(PLAN '사전 신청 API'). 번호가 등록돼 있었는지는 답이 같아 드러나지 않는다.
// 분석 이벤트는 보내지 않는다. 취소는 번호와 이어진 행동이라 결과도 남기지 않는다
async function send(phone: string, token: string, hp: string): Promise<Failure | null> {
  try {
    const res = await fetch('/api/waitlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'withdraw', phone, token, hp }),
      signal: AbortSignal.timeout(SEND_WAIT),
    });
    const { ok, code } = (await res.json()) as { ok?: boolean; code?: string };
    if (ok) return null;
    if (code === 'phone' || code === 'invalid') return 'phone';
    if (code === 'challenge') return 'challenge';
  } catch {}
  return 'server';
}

// 신청 폼 자리에 바뀌어 나온다(WaitlistForm). JS가 있어야 열 수 있으므로 하이드레이션 처리는 두지 않는다.
// 번호는 어디에도 저장하지 않는다. 돌아가면 이 컴포넌트와 함께 사라진다.
// onBack은 신청 화면으로 돌아가고, onWithdrawn은 취소가 끝났을 때 신청 쪽의 완료 상태를 거둔다
export function WithdrawForm({ onBack, onWithdrawn }: { onBack: () => void; onWithdrawn: () => void }) {
  const id = useId();
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<Failure | null>(null);
  const [pending, setPending] = useState(false);
  const [interact, setInteract] = useState(false);
  const [done, setDone] = useState(false);
  const [sending, setSending] = useState(false);   // 토큰을 받고 요청을 보낸 뒤. 이때는 돌아갈 수 없다
  const sendingRef = useRef(false);               // 창을 닫는 이벤트가 읽는다

  const leadRef = useRef<HTMLParagraphElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const trapRef = useRef<HTMLInputElement>(null);
  const statusRef = useRef<HTMLParagraphElement>(null);
  const slotRef = useRef<HTMLDivElement>(null);
  const doneRef = useRef<HTMLParagraphElement>(null);
  const attempt = useRef<AbortController | null>(null);

  useEffect(() => {
    // 누른 버튼이 사라졌으므로 설명으로 포커스를 옮긴다. 입력칸으로 바로 옮기면 터치 기기에서 키보드가 설명을 가린다
    leadRef.current?.focus();
    // 창을 닫으면 확인 위젯을 없애고 신청 화면으로 돌려 둔다. 다음에 창을 열면 신청 화면이어야 한다.
    // 요청을 이미 보냈으면 결과가 올 때까지 둔다
    const dialog = leadRef.current?.closest('dialog');
    if (!dialog) return;
    const stop = () => {
      attempt.current?.abort();
      if (!sendingRef.current) onBack();
    };
    dialog.addEventListener('close', stop);
    return () => dialog.removeEventListener('close', stop);
  }, [onBack]);

  const tidy = (input: HTMLInputElement) => (input.selectionStart === input.value.length ? formatPhone(input.value) : input.value);

  function onPhoneChange(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    setPhone((event.nativeEvent as InputEvent).isComposing ? input.value : tidy(input));
    if (error === 'phone') setError(null);
  }

  function showPhoneError() {
    flushSync(() => setError('phone'));
    phoneRef.current?.focus();
  }

  // 신청 폼과 같이 입력을 시작한 사람만 스크립트를 미리 받는다
  function preloadTurnstile() {
    if (hasTurnstileKey) loadTurnstile().catch(() => {});
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (attempt.current) return;
    if (!normalizePhone(phone)) return showPhoneError();

    const abort = new AbortController();
    attempt.current = abort;
    setError(null);
    setPending(true);

    let failure: Failure | null = null;
    let closed = false;
    if (!hasTurnstileKey) {
      failure = 'server';
    } else {
      try {
        const slot = slotRef.current!;
        const token = await getToken(slot, abort.signal, () => {
          flushSync(() => setInteract(true));
          requestAnimationFrame(() => slot.scrollIntoView({ block: 'nearest' }));
        }, TURNSTILE_WITHDRAW);
        setInteract(false);
        // 보낸 요청은 멈출 수 없다. 돌아가기를 막아 결과(성공이나 오류)를 꼭 보게 한다
        sendingRef.current = true;
        setSending(true);
        failure = await send(phone, token, trapRef.current?.value ?? '');
        sendingRef.current = false;
        setSending(false);
      } catch {
        closed = abort.signal.aborted;
        failure = 'challenge';
      }
    }

    attempt.current = null;
    setPending(false);
    setInteract(false);
    if (closed) return;
    if (failure === 'phone') return showPhoneError();
    if (failure) {
      flushSync(() => setError(failure));
      statusRef.current?.scrollIntoView({ block: 'nearest' });
      return;
    }
    flushSync(() => setDone(true));
    onWithdrawn();
    doneRef.current?.focus();
  }

  const failed = error === 'challenge' || error === 'server';
  const status = failed ? copy.errors[error] : interact ? text.interact : '';

  return (
    <>
      {done ? (
        <p ref={doneRef} tabIndex={-1} className="wl-done">
          <strong>{text.done[0]}</strong> <span>{text.done[1]}</span>
        </p>
      ) : (
        <form data-withdraw="" method="post" action="/api/waitlist" noValidate onSubmit={onSubmit} onInput={preloadTurnstile} className="wl-form">
          <p ref={leadRef} id={`${id}-lead`} tabIndex={-1} className="wl-lead">{text.lead}</p>
          <label htmlFor={`${id}-phone`} className="wl-label">{copy.phone}</label>
          <input
            ref={phoneRef}
            id={`${id}-phone`}
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            required
            value={phone}
            readOnly={pending}
            onChange={onPhoneChange}
            onBlur={() => setPhone(formatPhone)}
            onCompositionEnd={(event) => setPhone(tidy(event.currentTarget))}
            aria-invalid={error === 'phone' ? true : undefined}
            aria-describedby={`${id}-lead ${id}-phone-error`}
            className="wl-input"
          />
          <p id={`${id}-phone-error`} aria-live="polite" aria-atomic="true" className="wl-error">
            {error === 'phone' ? copy.errors.phone : ''}
          </p>

          <div hidden>
            <input
              ref={trapRef}
              type="text"
              name="sd_note"
              tabIndex={-1}
              autoComplete="off"
              defaultValue=""
              data-1p-ignore=""
              data-lpignore="true"
              data-bwignore=""
              data-form-type="other"
            />
          </div>

          <button type="submit" {...{ autoComplete: 'off' }} aria-disabled={pending ? true : undefined} className="btn-primary wl-submit">
            <span>{pending ? text.sending : text.submit}</span>
            <span className="btn-orb" aria-hidden="true">
              <Sparkle />
            </span>
          </button>
        </form>
      )}
      <p ref={statusRef} role="status" aria-live="polite" aria-atomic="true" data-error={failed ? '' : undefined} className="wl-status">{status}</p>
      <p role="status" className="sr-only">{pending && !interact ? text.sending : ''}</p>
      <div ref={slotRef} data-open={interact ? '' : undefined} className="wl-slot" />
      <p className="wl-switch">
        <button
          type="button"
          aria-disabled={sending ? true : undefined}
          className="wl-more"
          onClick={() => {
            if (sendingRef.current) return;
            attempt.current?.abort();
            onBack();
          }}
        >
          {text.back}
        </button>
      </p>
    </>
  );
}
