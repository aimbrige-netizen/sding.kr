import { CtaButton } from './CtaButton';
import { MediaSlot } from './MediaSlot';
import { Phrase } from './Phrase';
import { FEATURES } from '@/content/features';
import { DETAILS, MEDIA } from '@/content/media';
import { COPY } from '@/content/site';
import { ctaMode, launchDotted } from '@/lib/launch';
import { noteFor, present, rowPresent } from '@/lib/media-files';

// 히어로(PLAN '히어로', 시안 A 첫 장면). 문구는 site.ts에서만 읽는다.
// 사진 상태: 데스크톱은 사진 무대(화면 높이에서 머리글과 아래 150px를 뺀 높이) 위 왼쪽에 문구, 그 아래 장면 목차(작은 사진과 기능 이름)와 AI 캡션.
//           폰은 사진이 먼저 오고, 사진 아래쪽이 흰 바탕으로 녹아든 자리에 날짜와 제목이 앉는다. 그 아래 캡션, 보조 문장, CTA.
// 포스터 상태(사진 파일이 없을 때, 이 PC의 MEDIA_PREVIEW=off): 데스크톱은 오른쪽 절반에 포스터 카드, 폰은 문구만. 목차는 디테일 컷 줄이라 그리지 않는다.
// 제목과 사진에는 등장 효과가 없다(LCP). 줄 사이 띄어쓰기는 DOM에 남겨 스크린리더가 두 줄을 붙여 읽지 않게 한다
export function Hero() {
  const mode = ctaMode();
  const photo = present(MEDIA.hero);
  const note = noteFor('hero');
  const index = rowPresent('index');
  // 목차 사진은 FEATURES 순서대로 한 장씩이다. 개수가 다르면 빌드할 때 멈춘다
  if (DETAILS.index.length !== FEATURES.length) throw new Error('DETAILS.index와 FEATURES의 개수가 다르다');
  return (
    <section id="top" aria-labelledby="hero-title" className="hero" data-media={photo ? 'photo' : 'poster'}>
      <div className="hero-media">
        <MediaSlot id="hero" priority />
        {photo ? <span className="hero-veil" aria-hidden="true" /> : null}
      </div>
      <div className="hero-copy">
        <div className="hero-head">
          <p className="hero-date">
            {launchDotted()} {mode === 'live' ? COPY.hero.kicker : COPY.hero.kickerSoon}
          </p>
          <h1 id="hero-title" tabIndex={-1} className="hero-title">
            <span className="line">{COPY.hero.h1[0]}</span>{' '}<span className="line">{COPY.hero.h1[1]}</span>
          </h1>
        </div>
        <div className="hero-body">
          <p className="hero-sub"><Phrase parts={COPY.hero.sub} /></p>
          <div className="hero-actions">
            <CtaButton location="hero" className="btn hero-cta">{COPY.cta[mode]}</CtaButton>
          </div>
        </div>
      </div>
      {/* 장면 목차: 네 장면의 한 컷과 기능 이름. 누르면 그 장면으로 간다(데스크톱만 보인다. 폰은 머리글이 짧아 장면을 차례로 내려 본다) */}
      {index ? (
        <ul className="wrap hero-index">
          {FEATURES.map((f, i) => (
            <li key={f.id}>
              <a className="idx" href={`#${f.id}`}>
                <span className="idx-img"><MediaSlot detail="index" index={i} /></span>
                <span className="idx-name">{f.feature}</span>
              </a>
            </li>
          ))}
        </ul>
      ) : null}
      {photo && note ? <p className="wrap note hero-note">{note}</p> : null}
    </section>
  );
}
