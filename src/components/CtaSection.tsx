import { MediaSlot } from './MediaSlot';
import { StoreChoice } from './StoreChoice';
import { WaitlistForm } from './WaitlistForm';
import { COMPANY } from '@/content/company';
import { STORE_LINE } from '@/content/faq';
import { MEDIA } from '@/content/media';
import { COPY } from '@/content/site';
import { ctaMode, launchLabel } from '@/lib/launch';
import { noteFor, present } from '@/lib/media-files';

// 마지막 CTA(#waitlist, PLAN '마지막 CTA', 시안 A 마지막 장면). 사진 무대 위 왼쪽에 제목과 설명을 두고, 그 아래 흰 바탕에 신청 폼을 둔다.
// 데스크톱 폼은 두 칸이다(번호는 왼쪽, 동의 고지와 체크, 버튼, 아래 줄은 오른쪽, cta.css). 900~1279px는 사진이 무대 오른쪽 절반이다.
// 폰은 사진(6:5), 고지, 제목, 설명, 폼을 쌓는다.
// 폼(WaitlistForm)과 동의 문구, 신청 취소는 그대로이고 이 섹션은 자리만 정한다. CTA 링크의 목적지라서 JS가 없어도 여기로 온다.
// 제목에서 날짜만 표시 크기의 --orange다. 제휴 문의는 주소가 없으면 숨긴다(푸터와 같다)
export function CtaSection() {
  const live = ctaMode() === 'live';
  const photo = present(MEDIA.final);
  const note = noteFor('final');
  const partner = COMPANY.email ? (
    <p className="wl-partner">{COPY.final.partner[0]} <a href={`mailto:${COMPANY.email}`}>{COPY.final.partner[1]}</a></p>
  ) : null;
  return (
    <section id="waitlist" aria-labelledby="waitlist-title" className="signup" data-media={photo ? 'photo' : 'poster'}>
      <div className="signup-media">
        <MediaSlot id="final" />
        {photo ? <span className="signup-veil" aria-hidden="true" /> : null}
      </div>
      {photo && note ? <p className="wrap note signup-note">{note}</p> : null}
      <div className="wrap signup-head">
        {/* 칸마다 줄을 바꾼다(12월 25일, / 스딩이 / 문을 열 예정이에요). 줄 사이의 띄어쓰기는 DOM에 남긴다 */}
        <h2 id="waitlist-title" tabIndex={-1} className="signup-title">
          {live ? COPY.final.titleLive : (
            <>
              <span className="line"><span className="date">{launchLabel()}</span>{COPY.final.title[0]}</span>
              {' '}<span className="line">{COPY.final.title[1]}</span>{' '}<span className="line">{COPY.final.title[2]}</span>
            </>
          )}
        </h2>
        <div className="signup-lead">
          {(live ? [STORE_LINE] : COPY.final.lead).map((sentence) => <p key={sentence}>{sentence}</p>)}
        </div>
      </div>
      <div className="wrap signup-form">
        {/* 오픈 뒤에는 폼 대신 스토어 선택이 블록에 들어가고, 제휴 문의는 같은 줄 모양으로 블록 아래에 둔다 */}
        {live ? <><div className="wl-block"><StoreChoice /></div>{partner ? <div className="wl-after">{partner}</div> : null}</> : <WaitlistForm aside={partner} />}
      </div>
    </section>
  );
}
