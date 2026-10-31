import { Fragment } from 'react';
import { CtaButton } from './CtaButton';
import { HookMotion } from './HookMotion';
import { Sparkle } from './Icons';
import { InlineScript } from './InlineScript';
import { COPY } from '@/content/site';
import { FONT_SUBSET, hookGateScript, preloadFontSubset } from '@/lib/fonts';
import { ctaMode, daysToLaunch, launchDotted } from '@/lib/launch';
import { order } from '@/lib/motion';

// 쉼표 뒤에서 나눈 구절. 구절 안에서는 줄을 바꾸지 않는다
const phrases = (text: string) => text.split(/(?<=,)\s+/);

// 가는 첫 단어. i의 점은 반짝임이다(점 없는 ı 위에 반짝임을 얹는다)
function LeadWord({ text }: { text: string }) {
  return text.split('i').map((part, k) => (
    <Fragment key={k}>
      {k > 0 ? (
        <span className="dotless">
          ı<Sparkle className="tittle" />
        </span>
      ) : null}
      {part}
    </Fragment>
  ));
}

// 굵은 둘째 단어. o는 흰자와 눈동자가 있는 눈이다
function EyeWord({ text, from }: { text: string; from: number }) {
  return [...text].map((ch, k) =>
    ch === 'o' ? (
      <span key={k} className="ch eye" style={order(from + k)}>
        <span className="pupil" />
      </span>
    ) : (
      <span key={k} className="ch" style={order(from + k)}>
        {ch}
      </span>
    ),
  );
}

// D-day 왁스 실링. 오픈 전에는 카운트다운, 오픈 문구로 바뀌면(오픈일 또는 수동 전환) 날짜를 보인다
function Seal({ counting, days }: { counting: boolean; days: number }) {
  return (
    <span className="seal">
      <span className="seal-in">
        <svg className="seal-shape" viewBox="0 0 100 100" aria-hidden="true" focusable="false">
          <defs>
            {/* 밝은 --brand는 왼쪽 위 가장자리에만 둔다. 라벨 밑까지 번지면 흰 글자가 4.5:1에 못 미친다 */}
            <radialGradient id="seal-fill" cx="18%" cy="12%" r="92%">
              <stop offset="0" className="seal-stop-hi" />
              <stop offset=".15" className="seal-stop" />
              <stop offset="1" className="seal-stop" />
            </radialGradient>
          </defs>
          <path fill="url(#seal-fill)" d="M97.8 50C98.4 52.4 97.6 55 97.1 57.5C96.6 59.9 95.9 62.4 94.8 64.5C93.7 66.7 91.7 68.5 90.4 70.6C89.2 72.7 88.6 75.1 87.1 77C85.7 78.9 83.7 80.3 81.8 81.8C80 83.4 77.9 84.3 76.2 86.1C74.5 87.9 73.6 91.1 71.7 92.7C69.8 94.3 67.2 95 64.8 95.6C62.4 96.3 59.8 96.6 57.3 96.4C54.9 96.2 52.4 94.9 50 94.6C47.6 94.4 45.2 95.1 42.9 94.9C40.5 94.7 38.1 94.3 35.9 93.5C33.6 92.7 31.9 91 29.5 90.2C27.2 89.4 24.1 89.7 21.9 88.7C19.7 87.6 17.7 85.8 16.1 83.9C14.5 82.1 13 79.9 12.1 77.6C11.2 75.2 11.5 72.3 10.7 70C9.9 67.8 8.3 66 7.2 63.9C6.1 61.8 4.6 59.6 4.1 57.3C3.6 55 4.5 52.5 4.3 50C4.1 47.5 2.9 45 3 42.6C3 40.1 3.8 37.6 4.7 35.3C5.6 33 6.7 30.6 8.3 28.8C9.9 26.9 12.8 25.9 14.5 24.2C16.2 22.5 17.2 20.5 18.5 18.5C19.8 16.4 20.6 13.5 22.3 11.9C24 10.2 26.7 9.8 28.9 8.6C31.1 7.4 33.1 5.7 35.4 4.9C37.6 4.1 40.2 3.9 42.7 3.6C45.1 3.4 47.6 2.9 50 3.4C52.4 3.9 54.6 5.8 56.9 6.5C59.2 7.2 61.3 7.6 63.7 7.8C66.2 8 69.3 6.9 71.6 7.6C73.9 8.3 75.8 10.3 77.7 11.8C79.7 13.3 81.8 14.8 83.4 16.6C85 18.4 86.1 20.8 87.4 22.8C88.7 24.9 90.4 26.7 91.2 29C92.1 31.2 91.8 33.9 92.2 36.3C92.7 38.6 92.9 40.8 93.8 43.1C94.7 45.3 97.3 47.6 97.8 50Z" />
          <circle className="seal-ring" cx="50" cy="50" r="37.5" />
          <path className="seal-gloss" d="M17 36A36 36 0 0 1 36 15.5" />
          <circle className="seal-dot" cx="14.5" cy="44" r="1.8" />
        </svg>
        <span className="seal-label">{counting ? COPY.hero.ddayLabel : COPY.hero.kicker}</span>
        {counting ? (
          <span className="seal-num">
            {COPY.hero.ddayPrefix}
            <span data-dday-n>{days}</span>
          </span>
        ) : (
          // TODO(seal-date): 68px 실링에서는 날짜가 왁스 밖으로 나간다. docs/OPEN_ITEMS.md에서 정한다
          <span className="seal-date">{launchDotted()}</span>
        )}
      </span>
    </span>
  );
}

// 히어로(B안, 청첩장 느낌). 시안은 docs/design/hero-b.html, 반영 목록은 docs/design/README.md
export function Hero() {
  const mode = ctaMode();
  const days = daysToLaunch();
  const counting = mode === 'waitlist' && days > 0;
  const hook = COPY.hero.hook[mode];
  const [lead, ...rest] = hook.split(' ');
  const word = rest.join(' ');
  // 오픈 후 문구('Now Open')는 승인 전이라 눈과 반짝임 없이 두 단어만 쓴다. TODO(live-hook)
  const playful = mode === 'waitlist';
  // 점 없는 ı는 'Coming'의 반짝임 자리에만 있다. 오픈 문구에는 없으므로 그 글꼴 묶음을 받지 않는다
  if (playful) preloadFontSubset(FONT_SUBSET.dotlessI);
  const sample = playful ? hook.replaceAll('i', 'ı') : hook;

  return (
    <section id="top" aria-labelledby="hero-title" className="hero">
      <div className="hero-in">
        <p className="kicker rise" style={order(0)}>
          <Sparkle className="kicker-icon" />
          <span>
            {launchDotted()} {COPY.hero.kicker}
          </span>
        </p>

        <HookMotion className="hook" sample={sample}>
          <span className="sr-only">{hook}</span>
          {counting ? (
            <span className="sr-only" lang="ko">
              {COPY.hero.ddaySr[0]}
              <span data-dday-n>{days}</span>
              {COPY.hero.ddaySr[1]}
            </span>
          ) : null}
          <span className="hook-vis" aria-hidden="true">
            <Sparkle className="hook-float hook-float-1" />
            <Sparkle className="hook-float hook-float-2" />
            <span className="ch hook-lead" style={order(0)}>
              {playful ? <LeadWord text={lead} /> : lead}
            </span>
            <span className="hook-word">
              {playful ? <EyeWord text={word} from={1} /> : <span className="ch" style={order(1)}>{word}</span>}
              <Seal counting={counting} days={days} />
            </span>
          </span>
        </HookMotion>
        {/* 글꼴 대기(최대 700ms)는 번들을 기다리지 않도록 HTML 안에서 시작한다. 클라이언트 이동으로 그려지면 HookMotion이 대신한다 */}
        <InlineScript html={hookGateScript(sample)} />

        {/* 낮은 화면에서는 H1도 LCP 후보라 투명도 0에서 시작하지 않고 이동만 한다 */}
        <h1 id="hero-title" tabIndex={-1} className="hero-h1 rise-move" style={order(4)}>
          {phrases(COPY.hero.h1).map((line, k) => (
            <Fragment key={line}>
              {k > 0 ? ' ' : null}
              <span>{line}</span>
            </Fragment>
          ))}
        </h1>
        <p className="hero-sub rise" style={order(5)}>
          {phrases(COPY.hero.sub).map((part, k) => (
            <Fragment key={part}>
              {k > 0 ? ' ' : null}
              <span className="whitespace-nowrap">{part}</span>
            </Fragment>
          ))}
        </p>
        <div className="hero-cta rise" style={order(6)}>
          <CtaButton className="btn-primary">
            <span>{COPY.cta[mode]}</span>
            <span className="btn-orb" aria-hidden="true">
              <Sparkle />
            </span>
          </CtaButton>
        </div>
      </div>
    </section>
  );
}
