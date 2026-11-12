import { CtaButton } from './CtaButton';
import { MediaSlot } from './MediaSlot';
import { MEDIA } from '@/content/media';
import { COPY } from '@/content/site';
import { ctaMode, launchDotted } from '@/lib/launch';
import { noteFor, present } from '@/lib/media-files';

// 히어로(PLAN '히어로', 시안 docs/design/cinema/mockup.html의 첫 화면). 문구는 site.ts에서만 읽는다.
// 사진 파일이 있는지(present)로 빌드할 때 두 상태가 정해진다. 문구, 그 자리, CTA는 두 상태에서 같다.
// - 사진 상태: figure 안의 사진과 AI 캡션. 데스크톱은 사진이 문구 뒤에 깔리고, 폰은 문구 다음에 4:5 사진이 온다.
// - 포스터 상태: div 안의 브랜드 포스터 카드(MediaSlot이 그린다). 카드는 AI가 만든 그림이 아니라 캡션을 달지 않는다.
// 등장 효과는 없다. H1과 사진은 처음부터 보인다(LCP). 줄 사이 띄어쓰기는 DOM에 남겨 스크린리더가 두 줄을 붙여 읽지 않게 한다
export function Hero() {
  const mode = ctaMode();
  const photo = present(MEDIA.hero);
  const note = noteFor('hero');
  const Box = photo ? 'figure' : 'div';
  return (
    <section id="top" aria-labelledby="hero-title" className="hero" data-media={photo ? 'photo' : 'poster'}>
      <div className="hero-copy wrap">
        <p className="hero-date">
          {launchDotted()} {mode === 'live' ? COPY.hero.kicker : COPY.hero.kickerSoon}
        </p>
        <h1 id="hero-title" tabIndex={-1} className="hero-title">
          <span className="line">{COPY.hero.h1[0]}</span>{' '}<span className="line">{COPY.hero.h1[1]}</span>
        </h1>
        <p className="hero-sub">
          <span className="line">{COPY.hero.sub[0]}</span>{' '}<span className="line">{COPY.hero.sub[1]}</span>
        </p>
        <div className="hero-actions">
          <CtaButton location="hero" className="btn">{COPY.cta[mode]}</CtaButton>
        </div>
      </div>
      <Box className="hero-media">
        <div className="hero-frame">
          <MediaSlot id="hero" priority />
        </div>
        {photo && note ? <figcaption className="hero-cap cap">{note}</figcaption> : null}
      </Box>
    </section>
  );
}
