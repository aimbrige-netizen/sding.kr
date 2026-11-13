import { Band } from './Band';
import { MediaSlot } from './MediaSlot';
import { Phrase } from './Phrase';
import { StripLift } from './Shot';
import { featureById } from '@/content/features';
import { MEDIA } from '@/content/media';
import { COPY } from '@/content/site';
import { noteFor, present, rowNote, rowPresent } from '@/lib/media-files';

// AI 드레스 합성(#dress, PLAN 'AI 드레스 합성', 시안 A 장면 3). 원본과 AI 합성(쌍 A, 같은 사람)을 나란히 둔다.
// 데스크톱: 비교 두 장이 6칸부터 화면 오른쪽 끝까지 장면 높이로 고정되고 캡션은 사진 위쪽 흰 베일에, 왼쪽 흰 면에 제목과 한 줄.
// 흰 막에는 같은 자리를 자른 목둘레와 밑단 비교. 폰: 무릎 아래까지 자른 3:5 두 장과 그 아래 캡션, 제목, 정사각 비교.
// 두 파일(라이선스가 있는 요금제로 만든 것)이 모두 있을 때만 비교 묶음과 캡션을 그린다. 그 전에는 포스터 카드 한 장과 포스터 고지다
export function DressScene() {
  const f = featureById('dress');
  const ready = present(MEDIA.dress);
  const note = noteFor('dress');
  const hem = rowPresent('dress');
  return (
    <section id="dress" aria-labelledby="dress-title" data-feature="dress" className="feature feature-tight">
      <Band feature={f} tight />
      <div className="scene scene-dress">
        <div className="shot-wrap">
          {ready ? (
            <div className="shot shot-pair" role="group" aria-label={COPY.compare.label}>
              <figure className="pair-item">
                <div className="pair-img"><MediaSlot id="dress" part="before" /></div>
                <figcaption className="pair-cap">{COPY.compare.before}</figcaption>
              </figure>
              <figure className="pair-item">
                <div className="pair-img"><MediaSlot id="dress" part="after" /></div>
                <figcaption className="pair-cap pair-cap-ai">{COPY.compare.after}</figcaption>
              </figure>
            </div>
          ) : (
            <div className="shot shot-pair-poster"><MediaSlot id="dress" /></div>
          )}
          {note ? <p className="note shot-note">{note}</p> : null}
        </div>
        <div className="reel">
          <div className="reel-text">
            <h2 id="dress-title" tabIndex={-1} className="h2"><Phrase parts={f.headline} /></h2>
            <p className="callout">{f.body[1]}</p>
          </div>
          <div className="strip">
            <StripLift note={note} />
            {hem ? (
              <>
                {/* 열마다 캡션 하나(원본 / AI 합성), 그 아래 같은 자리를 자른 목둘레와 밑단. 묶음 이름은 위의 전신 비교와 다르다 */}
                <div className="hem" role="group" aria-label={COPY.compare.detail}>
                  <figure className="hem-item">
                    <figcaption className="hem-cap">{COPY.compare.before}</figcaption>
                    <div className="crop hem-crop"><MediaSlot detail="dress" index={0} /></div>
                    <div className="crop hem-crop"><MediaSlot detail="dress" index={1} /></div>
                  </figure>
                  <figure className="hem-item">
                    <figcaption className="hem-cap hem-cap-ai">{COPY.compare.after}</figcaption>
                    <div className="crop hem-crop"><MediaSlot detail="dress" index={2} /></div>
                    <div className="crop hem-crop"><MediaSlot detail="dress" index={3} /></div>
                  </figure>
                </div>
                <p className="note strip-note">{rowNote('dress')}</p>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
