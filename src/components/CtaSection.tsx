import { Spans } from './Spans';
import { StoreChoice } from './StoreChoice';
import { WaitlistForm } from './WaitlistForm';
import { COMPANY } from '@/content/company';
import { STORE_LINE } from '@/content/faq';
import { COPY } from '@/content/site';
import { ctaMode, launchLabel } from '@/lib/launch';
import { order } from '@/lib/motion';

// 마지막 CTA(#waitlist). 큰 오렌지 면은 이 패널 하나고, 작은 글자는 모두 흰 카드 안이나 패널 밖에 둔다.
// CTA 링크의 목적지라서 JS가 없어도 여기로 온다. 제휴 문의는 주소가 없으면 숨긴다(푸터와 같다).
// 등장 효과는 글과 카드에만 건다. 패널까지 걸면 큰 오렌지 면이 통째로 나타난다
export function CtaSection() {
  const live = ctaMode() === 'live';
  return (
    <section id="waitlist" aria-labelledby="waitlist-title" className="cta">
      <div className="cta-panel">
        <div className="cta-head" data-reveal style={order(0)}>
          <h2 id="waitlist-title" tabIndex={-1} className="zone-title cta-title">
            {live ? COPY.final.titleLive : <Spans parts={[`${launchLabel()}${COPY.final.title[0]}`, COPY.final.title[1]]} className="nb" />}
          </h2>
          <p className="cta-lead"><Spans parts={live ? [STORE_LINE] : COPY.final.lead} /></p>
        </div>
        <div className="cta-card" data-reveal style={order(1)}>
          {live ? <StoreChoice /> : <WaitlistForm />}
        </div>
      </div>
      {COMPANY.email ? (
        <p className="cta-partner">
          {COPY.final.partner[0]} <a href={`mailto:${COMPANY.email}`}>{COPY.final.partner[1]}</a>
        </p>
      ) : null}
    </section>
  );
}
