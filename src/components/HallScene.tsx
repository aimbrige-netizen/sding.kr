import { FeatureHead } from './FeatureHead';
import { MediaSlot } from './MediaSlot';
import { featureById } from '@/content/features';
import { MEDIA } from '@/content/media';
import { noteFor, present } from '@/lib/media-files';

// 웨딩홀 시뮬레이션(PLAN '웨딩홀 시뮬레이션'). 글 블록 아래 화면 폭 가득 16:9 미디어, 그 아래 고지.
// 지금은 이미지 슬롯이고, 라이선스가 있는 파일이 오기 전에는 포스터 카드다. 재생할 것이 없으므로 재생 버튼을 그리지 않는다.
// 영상으로 바꾸면(M3) MediaSlot이 VideoPlayer와 재생 버튼을 그린다.
// 실제 파일이 있을 때만 figure와 figcaption을 쓰고, 포스터 카드는 div, 포스터 고지는 p다
export function HallScene() {
  const photo = present(MEDIA.hall);
  const Box = photo ? 'figure' : 'div';
  const Cap = photo ? 'figcaption' : 'p';
  return (
    <section id="hall" aria-labelledby="hall-title" data-feature="hall" className="hall">
      <div className="wrap hall-copy">
        <FeatureHead feature={featureById('hall')} />
      </div>
      <Box className="hall-media">
        <div className="hall-frame">
          <MediaSlot id="hall" />
        </div>
        <Cap className="cap wrap hall-cap">{noteFor('hall')}</Cap>
      </Box>
    </section>
  );
}
