import { FeatureHead } from './FeatureHead';
import { MediaSlot } from './MediaSlot';
import { featureById } from '@/content/features';
import { MEDIA } from '@/content/media';
import { noteFor, present } from '@/lib/media-files';

// 웨딩 가격 정찰제(#price, PLAN '웨딩 가격 정찰제'). 컨테이너 안의 글 다음에 화면 폭 가득 16:9(폰 4:3) 미디어가 온다.
// 미디어 위에는 아무것도 얹지 않고, 캡션은 그 아래 컨테이너 선에 둔다.
// figure와 figcaption은 실제 파일이 있을 때만 쓴다. 포스터 카드는 div이고 캡션이 없다(noteFor가 빈 값)
export function PriceScene() {
  const f = featureById('price');
  const note = noteFor('price');
  const photo = present(MEDIA.price);
  const Box = photo ? 'figure' : 'div';
  const Cap = photo ? 'figcaption' : 'p';
  return (
    <section id="price" aria-labelledby="price-title" data-feature="price" className="price">
      <div className="wrap"><FeatureHead feature={f} /></div>
      <Box className="price-media">
        <div className="price-frame"><MediaSlot id="price" /></div>
        {note && <Cap className="cap wrap price-cap">{note}</Cap>}
      </Box>
    </section>
  );
}
