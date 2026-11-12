import { StoreChoice } from './StoreChoice';
import { WaitlistForm } from './WaitlistForm';
import { COMPANY } from '@/content/company';
import { STORE_LINE } from '@/content/faq';
import { COPY } from '@/content/site';
import { ctaMode, launchLabel } from '@/lib/launch';

// 마지막 CTA(#waitlist, PLAN '마지막 CTA'). 왼쪽 5/12에 제목과 설명을 흰 바탕에 두고, 오른쪽 7/12의 --gray-100 블록에 폼을 둔다.
// CTA 링크의 목적지라서 JS가 없어도 여기로 온다. 제목에서 날짜만 표시 크기의 --orange다.
// 블록 아래 한 줄에 신청 취소와 제휴 문의가 온다. 신청 취소는 폼의 상태를 바꾸므로 폼 안에 있고, 제휴 문의는 aside로 넘긴다.
// 제휴 문의는 주소가 없으면 숨긴다(푸터와 같다)
export function CtaSection() {
  const live = ctaMode() === 'live';
  const partner = COMPANY.email ? (
    <p className="wl-partner">{COPY.final.partner[0]} <a href={`mailto:${COMPANY.email}`}>{COPY.final.partner[1]}</a></p>
  ) : null;
  return (
    <section id="waitlist" aria-labelledby="waitlist-title" className="signup">
      <div className="wrap signup-grid">
        <div className="signup-intro">
          {/* 날짜와 쉼표 뒤에서 늘, '스딩이 문을' 뒤에서는 900px 이상에서만 줄을 바꾼다. 줄 사이의 띄어쓰기는 DOM에 남긴다 */}
          <h2 id="waitlist-title" tabIndex={-1} className="signup-title">
            {live ? COPY.final.titleLive : (
              <>
                <span className="line"><span className="date">{launchLabel()}</span>{COPY.final.title[0]}</span>
                {' '}<span className="nb">{COPY.final.title[1]}</span>{' '}<br className="br-d" /><span className="nb">{COPY.final.title[2]}</span>
              </>
            )}
          </h2>
          <div className="signup-lead">
            {(live ? [STORE_LINE] : COPY.final.lead).map((sentence) => <p key={sentence}>{sentence}</p>)}
          </div>
        </div>
        <div className="signup-form">
          {/* 오픈 뒤에는 폼 대신 스토어 선택이 블록에 들어가고, 제휴 문의는 같은 줄 모양으로 블록 아래에 둔다 */}
          {live ? <><div className="wl-block"><StoreChoice /></div>{partner ? <div className="wl-after">{partner}</div> : null}</> : <WaitlistForm aside={partner} />}
        </div>
      </div>
    </section>
  );
}
