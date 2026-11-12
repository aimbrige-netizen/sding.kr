import { FeatureHead } from './FeatureHead';
import { MediaSlot } from './MediaSlot';
import { featureById } from '@/content/features';
import { MEDIA } from '@/content/media';
import { noteFor, present } from '@/lib/media-files';

// AI 웨딩 플래너(#planner, PLAN 'AI 웨딩 플래너'). 900px 이상은 왼쪽 5/12에 글, 오른쪽 7/12에 화면 오른쪽 끝까지 닿는 9:10 사진이다.
// 폰은 글 다음에 4:5 사진이 온다. 캡션은 사진 바로 아래 사진의 왼쪽 끝에 둔다.
// figure와 figcaption은 실제 파일이 있을 때만 쓴다. 포스터 카드는 div이고 캡션이 없다(noteFor가 빈 값)
export function PlannerScene() {
  const note = noteFor('planner');
  const photo = present(MEDIA.planner);
  const Box = photo ? 'figure' : 'div';
  const Cap = photo ? 'figcaption' : 'p';
  return (
    <section id="planner" aria-labelledby="planner-title" data-feature="planner" className="planner">
      <div className="planner-copy"><FeatureHead feature={featureById('planner')} /></div>
      <Box className="planner-media">
        <div className="planner-frame"><MediaSlot id="planner" /></div>
        {note && <Cap className="cap planner-cap">{note}</Cap>}
      </Box>
    </section>
  );
}
