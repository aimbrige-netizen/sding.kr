'use client';

import { useEffect, useId, useRef, useState, useSyncExternalStore, type ChangeEvent, type FormEvent } from 'react';
import { flushSync } from 'react-dom';
import { Sparkle } from './Icons';
import { Spans } from './Spans';
import { COPY } from '@/content/site';
import { formatPhone, normalizePhone } from '@/lib/phone';
import { getToken, hasTurnstileKey, loadTurnstile } from '@/lib/turnstile';

const copy = COPY.waitlist;
const noop = () => () => {};
const SEND_WAIT = 20_000;   // 서버 한도 15초보다 길다. 연결이 끊겨도 '보내는 중'에 갇히지 않게 한다. 다시 눌러도 번호는 한 번만 저장된다

type Failure = keyof typeof copy.errors;

// 응답 표(PLAN '사전 신청 API')를 화면 상태로 옮긴다. 413, 504처럼 JSON이 아닌 응답과 망 오류, 시간 초과는 server다
async function send(phone: string, token: string, hp: string): Promise<Failure | null> {
  try {
    const res = await fetch('/api/waitlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, consent: true, token, hp }),
      signal: AbortSignal.timeout(SEND_WAIT),
    });
    const { ok, code } = (await res.json()) as { ok?: boolean; code?: string };
    if (ok) return null;
    if (code === 'phone' || code === 'invalid') return 'phone';
    if (code === 'consent' || code === 'challenge') return code;
  } catch {}
  return 'server';
}

// 마지막 CTA와 신청 창이 같은 폼을 쓴다. 번호를 쓰는 곳이 둘이라 id는 useId로 만든다.
// 번호는 어디에도 저장하지 않는다. 창을 닫아도 값이 남는 것은 컴포넌트가 살아 있기 때문이다
export function WaitlistForm() {
  const id = useId();
  const [phone, setPhone] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState<Failure | null>(null);
  const [pending, setPending] = useState(false);
  const [interact, setInteract] = useState(false);
  const [done, setDone] = useState(false);
  const hydrated = useSyncExternalStore(noop, () => true, () => false);   // 하이드레이션 전과 JS 끔에는 제출 버튼을 끈다

  const rootRef = useRef<HTMLDivElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const consentRef = useRef<HTMLInputElement>(null);
  const trapRef = useRef<HTMLInputElement>(null);
  const statusRef = useRef<HTMLParagraphElement>(null);
  const slotRef = useRef<HTMLDivElement>(null);
  const doneRef = useRef<HTMLParagraphElement>(null);
  const attempt = useRef<AbortController | null>(null);   // 진행 중인 요청. disabled를 쓰지 않아 포커스가 버튼에 남으므로 이중 제출은 이것으로 막는다

  useEffect(() => {
    // 하이드레이션 전에 넣은 값을 넘겨받는다. 그대로 두면 끝나는 순간 빈 상태가 덮어쓴다
    const typed = phoneRef.current?.value;
    if (typed) setPhone(formatPhone(typed));
    if (consentRef.current?.checked) setAgreed(true);

    // 확인 중에 창을 닫으면 위젯을 없애고 입력 상태로 돌아간다. 닫힌 창 안에서는 사람이 풀 수 없다
    const dialog = rootRef.current?.closest('dialog');
    if (!dialog) return;
    const stop = () => attempt.current?.abort();
    dialog.addEventListener('close', stop);
    return () => dialog.removeEventListener('close', stop);
  }, []);

  // 끝에서 입력할 때만 바로 다듬는다. 중간을 고칠 때 다듬으면 커서가 끝으로 튄다. 칸을 떠날 때 다듬는다
  const tidy = (input: HTMLInputElement) => (input.selectionStart === input.value.length ? formatPhone(input.value) : input.value);

  function onPhoneChange(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    setPhone((event.nativeEvent as InputEvent).isComposing ? input.value : tidy(input));
    if (error === 'phone') setError(null);
  }

  // 문구가 DOM에 들어간 뒤에 포커스를 옮겨야 낭독기가 aria-describedby를 읽는다
  function showField(field: 'phone' | 'consent') {
    flushSync(() => setError(field));
    (field === 'phone' ? phoneRef : consentRef).current?.focus();
  }

  // 스크립트는 입력을 시작한 사람만 미리 받는다. 지나가는 방문자의 IP가 Cloudflare로 가지 않게 한다. 실패하면 제출할 때 다시 시도한다
  function preloadTurnstile() {
    if (hasTurnstileKey) loadTurnstile().catch(() => {});
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (attempt.current) return;
    if (!normalizePhone(phone)) return showField('phone');
    if (!agreed) return showField('consent');

    const abort = new AbortController();
    attempt.current = abort;
    setError(null);
    setPending(true);

    let failure: Failure | null = null;
    let closed = false;
    if (!hasTurnstileKey) failure = 'server';
    else {
      try {
        const slot = slotRef.current!;
        const token = await getToken(slot, abort.signal, () => {
          flushSync(() => setInteract(true));   // 안내와 여백이 먼저 생겨야 스크롤이 맞는다
          requestAnimationFrame(() => slot.scrollIntoView({ block: 'nearest' }));   // 위젯이 나타난 뒤 신청 창의 스크롤 안에서도 보이게 한다
        });
        setInteract(false);   // 위젯이 사라졌으므로 안내도 거둔다
        failure = await send(phone, token, trapRef.current?.value ?? '');
      } catch {
        closed = abort.signal.aborted;   // send()는 던지지 않으므로 여기는 getToken뿐이다
        failure = 'challenge';
      }
    }

    attempt.current = null;
    setPending(false);
    setInteract(false);
    if (closed) return;   // 사람이 창을 닫았다
    if (failure === 'phone' || failure === 'consent') return showField(failure);
    if (failure) {
      flushSync(() => setError(failure));
      statusRef.current?.scrollIntoView({ block: 'nearest' });   // 키보드나 카드 끝에 가려져도 결과가 보이게 한다
      return;
    }
    // 패널에서는 폼이 줄어들어도 아래가 뛰지 않게 높이를 지킨다
    const root = rootRef.current;
    if (root && !root.closest('dialog')) root.style.minHeight = `${root.offsetHeight}px`;
    // 누른 버튼이 사라지므로 포커스를 옮긴다
    flushSync(() => setDone(true));
    doneRef.current?.focus();
  }

  const failed = error === 'challenge' || error === 'server';
  const status = failed ? copy.errors[error] : interact ? copy.interact : '';

  return (
    <div ref={rootRef} className="wl">
      {done ? (
        <p ref={doneRef} tabIndex={-1} className="wl-done">
          <span className="btn-orb" aria-hidden="true">
            <Sparkle />
          </span>
          <strong>{copy.done[0]}</strong> <span>{copy.done[1]}</span>
        </p>
      ) : (
        <form method="post" action="/api/waitlist" noValidate onSubmit={onSubmit} onInput={preloadTurnstile} className="wl-form">
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
            aria-describedby={`${id}-phone-error`}
            className="wl-input"
          />
          <p id={`${id}-phone-error`} aria-live="polite" aria-atomic="true" className="wl-error">
            {error === 'phone' ? copy.errors.phone : ''}
          </p>

          {/* 고지는 접지 않고 체크박스에 붙여 둔다(PLAN '마지막 CTA') */}
          <dl id={`${id}-notice`} className="wl-notice">
            {copy.notice.map((row) => (
              <div key={row.label} className={row.strong ? 'wl-notice-strong' : undefined}>
                <dt>{row.label}</dt>
                <dd>{row.strong ? <span className="hl">{row.value}</span> : row.value}</dd>
              </div>
            ))}
          </dl>
          <p id={`${id}-terms`} className="wl-terms">
            <span><Spans parts={copy.refuse} className="nb" /></span> <span>{copy.age}</span>
          </p>

          <div className="wl-consent">
            <label className="wl-check">
              <input
                ref={consentRef}
                type="checkbox"
                name="consent"
                autoComplete="off"
                required
                checked={agreed}
                onChange={(event) => {
                  if (pending) return;   // 보낸 값과 화면이 어긋나지 않게 잠근다. 체크박스에는 readOnly가 듣지 않는다
                  setAgreed(event.currentTarget.checked);
                  if (error === 'consent') setError(null);
                }}
                aria-invalid={error === 'consent' ? true : undefined}
                aria-describedby={`${id}-notice ${id}-terms ${id}-consent-error`}
              />
              <span><Spans parts={copy.consent} className="nb" /></span>
            </label>
            {/* 입력한 번호를 지키려고 새 탭으로 연다. 라벨 안에 링크를 두면 누를 때 체크가 바뀐다 */}
            <a href="/privacy" target="_blank" rel="noopener" className="wl-more">
              {copy.more}<span className="sr-only">{copy.moreSr}</span>
            </a>
          </div>
          <p id={`${id}-consent-error`} aria-live="polite" aria-atomic="true" className="wl-error">
            {error === 'consent' ? copy.errors.consent : ''}
          </p>

          {/* 사람은 비워 둔다. 숨겨 자동 완성이 채우지 못하게 하고, 이름은 휴대폰으로 읽히지 않게 정했다 */}
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

          {/* Firefox는 새로 고침 때 풀린 disabled까지 되살려 하이드레이션 전에도 눌린다. autocomplete가 그 복원을 끈다. React 타입에 없어 펼쳐서 넘긴다 */}
          <button type="submit" {...{ autoComplete: 'off' }} disabled={!hydrated} aria-disabled={pending ? true : undefined} className="btn-primary wl-submit">
            <span>{pending ? copy.sending : COPY.cta.waitlist}</span>
            <span className="btn-orb" aria-hidden="true">
              <Sparkle />
            </span>
          </button>
          <p className="wl-nojs">{copy.noJs}</p>
        </form>
      )}
      {/* 누른 뒤에 생기는 것은 모두 버튼 아래에 나온다. 패널은 아래로만 자라 위의 내용이 움직이지 않는다. 상태 줄은 폼 밖에 두어 성공 뒤에도 남는다 */}
      <p ref={statusRef} role="status" aria-live="polite" aria-atomic="true" data-error={failed ? '' : undefined} className="wl-status">{status}</p>
      <p role="status" className="sr-only">{pending && !interact ? copy.sending : ''}</p>
      <div ref={slotRef} data-open={interact ? '' : undefined} className="wl-slot" />
    </div>
  );
}
