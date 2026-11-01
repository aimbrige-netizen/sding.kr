// Cloudflare Turnstile(PLAN '사전 신청 API'). 함수는 브라우저에서만 부른다.
// 위젯은 신청 버튼을 누른 폼에서 그때 만들고 토큰을 받으면 없앤다. 다시 시도하면 새 위젯이 새 토큰을 받는다.
// 쓴 위젯에 execute()를 다시 부르면 이미 쓴 토큰이 돌아오므로 위젯을 재사용하지 않는다
const ONLOAD = '__sdingTurnstile';
const SCRIPT = `https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=${ONLOAD}`;   // 복사하거나 프록시하지 않는다

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? '';
const TOKEN_WAIT = 20_000;   // 위젯이 아무 신호도 주지 않을 때 '전송 중'에 갇히지 않게 한다. 사람이 풀기 시작하면 멈춘다

export const hasTurnstileKey = SITE_KEY !== '';
export const TURNSTILE_ACTION = 'waitlist';   // API가 운영에서 같은 값인지 확인한다

type Turnstile = {
  render: (slot: HTMLElement, options: Record<string, unknown>) => string | null | undefined;
  remove: (id: string) => void;
};

type TurnstileWindow = Window & { turnstile?: Turnstile; [ONLOAD]?: () => void };

let loading: Promise<void> | null = null;

// 스크립트는 한 번만 넣는다. 스크립트를 주입하면 async가 되어 turnstile.ready()를 쓸 수 없으므로 onload 주소로 받는다
export function loadTurnstile(): Promise<void> {
  return (loading ??= new Promise<void>((resolve, reject) => {
    (window as TurnstileWindow)[ONLOAD] = resolve;
    const script = document.createElement('script');
    script.src = SCRIPT;
    script.onerror = () => {
      loading = null;   // 다음 시도에서 다시 받는다
      script.remove();
      reject(new Error('script'));
    };
    document.head.append(script);
  }));
}

// 평소에는 보이지 않고, 사람 확인이 필요할 때만 slot 안에 나타난다. 위젯 모드는 대시보드의 Managed다.
// retry를 끄면 실패가 곧바로 reject로 와서 방문자가 버튼을 다시 누를 수 있다
export function getToken(slot: HTMLElement, signal: AbortSignal, onInteract: () => void): Promise<string> {
  let id: string | null | undefined;
  let timer: ReturnType<typeof setTimeout>;
  let over = false;
  return new Promise<string>((resolve, reject) => {
    timer = setTimeout(() => reject(new Error('timeout')), TOKEN_WAIT);
    signal.addEventListener('abort', () => reject(new Error('aborted')), { once: true });
    loadTurnstile().then(() => {
      if (over || signal.aborted) return;   // 스크립트를 기다리는 동안 끝났다. 위젯을 남기지 않는다
      id = (window as TurnstileWindow).turnstile?.render(slot, {
        sitekey: SITE_KEY,
        action: TURNSTILE_ACTION,
        theme: 'light',
        language: 'ko',
        appearance: 'interaction-only',
        size: slot.clientWidth >= 300 ? 'flexible' : 'compact',   // flexible은 최소 300px, compact는 150×140이다
        retry: 'never',
        'refresh-timeout': 'never',
        'response-field': false,
        callback: resolve,
        'error-callback': (code: unknown) => { reject(new Error(String(code))); return true; },
        'timeout-callback': () => reject(new Error('timeout')),
        'unsupported-callback': () => reject(new Error('unsupported')),
        'before-interactive-callback': () => { clearTimeout(timer); onInteract(); },
      });
    }).catch(reject);
  }).finally(() => {
    over = true;
    clearTimeout(timer);
    if (id) (window as TurnstileWindow).turnstile?.remove(id);
  });
}
