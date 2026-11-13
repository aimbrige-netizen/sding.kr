import { Band } from './Band';
import { MediaSlot } from './MediaSlot';
import { Phrase } from './Phrase';
import { ScrollRow } from './ScrollRow';
import { Shot, StripLift } from './Shot';
import { featureById, segText } from '@/content/features';
import { DETAILS } from '@/content/media';
import { COPY } from '@/content/site';
import { noteFor, rowNote, rowPresent } from '@/lib/media-files';

// 웨딩 가격 정찰제(#price, PLAN '웨딩 가격 정찰제', 시안 A 장면 1). 흰 띠(라벨과 큰 문장) 다음에 장면이 온다.
// 데스크톱: 쇼룸 사진이 고정되고 제목은 소품 위 빈 벽(왼쪽 위)에 놓인다. 흰 막에는 정의 문장, 굵은 한 줄, 같은 기준으로 놓인 네 가지 컷.
// 폰: 4:5 옷걸이 사진, 제목, 정의, 가로로 넘기는 컷. 컷 줄은 포스터 상태(MEDIA_PREVIEW=off)에서 그리지 않는다
export function PriceScene() {
  const f = featureById('price');
  const note = noteFor('price');
  const crops = rowPresent('price');
  if (!f.def || segText(f.def) !== f.definition) throw new Error('features.price.def가 definition과 글자가 다르다');
  return (
    <section id="price" aria-labelledby="price-title" data-feature="price" className="feature">
      <Band feature={f} />
      <div className="scene scene-price">
        <Shot id="price" note={note} />
        <div className="reel">
          <div className="reel-text">
            <h2 id="price-title" tabIndex={-1} className="h2"><Phrase parts={f.headline} /></h2>
          </div>
          <div className="strip">
            <StripLift note={note} />
            <div className="strip-text">
              <p className="def"><Phrase parts={f.def} /></p>
              <p className="callout">{f.body[1]}</p>
            </div>
            {crops ? (
              <>
                <ScrollRow label={`${f.feature} ${COPY.media.details}`} className="crops crops-price">
                  {DETAILS.price.map((spec, i) => (
                    <div key={spec.desktop.file} className="crop"><MediaSlot detail="price" index={i} /></div>
                  ))}
                </ScrollRow>
                <p className="note strip-note">{rowNote('price')}</p>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
