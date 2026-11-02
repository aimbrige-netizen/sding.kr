import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { SITE } from '@/content/site';
import { normalizePhone } from '@/lib/phone';
import { TURNSTILE_ACTION } from '@/lib/turnstile';

// 응답 표와 동작은 PLAN '사전 신청 API'를 따른다. 번호와 요청 본문은 어디에도 남기지 않는다.
// 로그에는 오류 코드와 HTTP 상태만 쓴다. Supabase의 error.details에는 행의 값이 들어갈 수 있다
export const maxDuration = 15;   // 확인 6초와 저장 5초를 넘기면 끊는다. 기본 300초로 두면 폼이 그만큼 기다린다

const CONSENT_VERSION = '2026-11-v1';   // 동의 문구나 처리방침이 바뀌면 올린다
const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
const VERIFY_TIMEOUT = 3000;
const HOSTNAME = new URL(SITE.url).hostname;

const fail = (status: number, code: string) => NextResponse.json({ ok: false, code }, { status });

// ok: 사람. bad: 토큰이 틀렸다. down: Cloudflare 장애나 키 설정 문제라 방문자 잘못이 아니다
async function humanCheck(token: string): Promise<'ok' | 'bad' | 'down'> {
  if (!token || token.length > 2048) return 'bad';
  const body = new URLSearchParams({
    secret: process.env.TURNSTILE_SECRET_KEY ?? '',
    response: token,
    idempotency_key: crypto.randomUUID(),   // 다시 보내도 같은 토큰이 '이미 쓴 토큰'이 되지 않는다
  });
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(VERIFY_URL, { method: 'POST', body, signal: AbortSignal.timeout(VERIFY_TIMEOUT) });
      const result = (await res.json()) as { success?: boolean; hostname?: string; action?: string; 'error-codes'?: string[] };
      if (result.success === true) {
        if (process.env.NEXT_PUBLIC_SITE_ENV !== 'production') return 'ok';   // 시험 키의 hostname과 action은 다른 값이다
        if (result.hostname === HOSTNAME && result.action === TURNSTILE_ACTION) return 'ok';
        console.error('waitlist: turnstile mismatch');   // www로 열렸거나 키 쌍이 어긋났다. 방문자는 다시 눌러도 통과하지 못한다
        return 'bad';
      }
      const codes = result['error-codes'] ?? [];
      if (codes.includes('internal-error')) continue;
      if (codes.some((code) => code.endsWith('-input-secret'))) {
        console.error('waitlist: turnstile secret');
        return 'down';
      }
      console.error('waitlist: turnstile', codes.join());   // Cloudflare의 고정 문자열이다
      return 'bad';
    } catch {
      // 시간 초과나 망 오류. 같은 idempotency_key로 한 번 더 보낸다
    }
  }
  console.error('waitlist: turnstile unavailable');
  return 'down';
}

export async function POST(req: Request) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key || !process.env.TURNSTILE_SECRET_KEY) return fail(503, 'server');

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== 'object' || Array.isArray(body)) return fail(400, 'invalid');
  if (body.hp) return NextResponse.json({ ok: true });       // 봇: 저장하지 않고 성공처럼 답한다
  if (body.consent !== true) return fail(400, 'consent');
  const phone = typeof body.phone === 'string' ? normalizePhone(body.phone) : null;
  if (!phone) return fail(400, 'phone');

  const human = await humanCheck(typeof body.token === 'string' ? body.token : '');
  if (human === 'down') return fail(503, 'server');
  if (human === 'bad') return fail(400, 'challenge');

  try {
    const db = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
      db: { timeout: 5000 },
    });
    // 이미 있는 번호는 첫 동의를 그대로 두고 조용히 넘어간다. insert로 23505를 받으면 번호가 Postgres 로그에 남는다
    const { error, status } = await db.from('waitlist').upsert(
      { phone, consent_at: new Date().toISOString(), consent_version: CONSENT_VERSION },
      { onConflict: 'phone', ignoreDuplicates: true },
    );
    if (!error) return NextResponse.json({ ok: true });
    console.error('waitlist: db', error.code, status);   // 게이트웨이 오류는 code가 없다. 잘못된 키, 멈춘 프로젝트, 시간 초과는 status로 가른다
  } catch {
    console.error('waitlist: db unavailable');
  }
  return fail(500, 'server');
}
