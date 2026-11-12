import { FeatureHead } from './FeatureHead';
import { MediaSlot } from './MediaSlot';
import { featureById } from '@/content/features';
import { MEDIA } from '@/content/media';
import { COPY } from '@/content/site';
import { noteFor, present } from '@/lib/media-files';

// AI 드레스 합성(PLAN 'AI 드레스 합성'). --gray-100 띠 안에 원본과 AI 합성 3:4 두 장을 나란히 둔다.
// 두 파일(라이선스가 있는 요금제로 만든 것)이 모두 있을 때만 비교 묶음과 캡션 '원본', 'AI 합성'을 그린다.
// 그 전에는 두 칸에 걸친 포스터 카드 한 장이다. 카드는 AI가 만든 그림이 아니므로 캡션 없이 포스터 고지만 단다
export function DressScene() {
  const f = featureById('dress');
  const ready = present(MEDIA.dress);
  return (
    <section id="dress" aria-labelledby="dress-title" data-feature="dress" className="dress">
      <div className="wrap">
        <FeatureHead feature={f} />
        {ready ? (
          <div className="pair" role="group" aria-label={COPY.compare.label}>
            <figure className="pair-item">
              <div className="pair-frame">
                <MediaSlot id="dress" part="before" />
              </div>
              <figcaption className="pair-cap">{COPY.compare.before}</figcaption>
            </figure>
            <figure className="pair-item">
              <div className="pair-frame">
                <MediaSlot id="dress" part="after" />
              </div>
              <figcaption className="pair-cap">{COPY.compare.after}</figcaption>
            </figure>
          </div>
        ) : (
          <div className="pair-poster">
            <MediaSlot id="dress" />
          </div>
        )}
        <p className="note dress-note">{noteFor('dress')}</p>
      </div>
    </section>
  );
}
