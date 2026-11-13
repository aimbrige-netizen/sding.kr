import { Band } from './Band';
import { MediaSlot } from './MediaSlot';
import { Phrase } from './Phrase';
import { Shot, StripLift } from './Shot';
import { featureById } from '@/content/features';
import { noteFor, rowNote, rowPresent } from '@/lib/media-files';

// AI 웨딩 플래너(#planner, PLAN 'AI 웨딩 플래너', 시안 A 장면 2).
// 데스크톱: 소파의 커플 사진이 고정되고 제목은 오른쪽 위 창가(9칸부터)에 놓인다. 흰 막에는 굵은 한 줄, 단계 네 개, 노트와 튤립 컷.
// 폰: 4:5 사진, 제목, 굵은 한 줄, 2x2 단계, 화면 폭 노트 컷(22:9). 600px부터는 노트와 튤립 컷이 한 줄이다(튤립은 600px 이상에서만)
export function PlannerScene() {
  const f = featureById('planner');
  const note = noteFor('planner');
  const crops = rowPresent('planner');
  return (
    <section id="planner" aria-labelledby="planner-title" data-feature="planner" className="feature">
      <Band feature={f} />
      <div className="scene scene-planner">
        <Shot id="planner" note={note} />
        <div className="reel">
          <div className="reel-text">
            <h2 id="planner-title" tabIndex={-1} className="h2"><Phrase parts={f.headline} /></h2>
          </div>
          <div className="strip">
            <StripLift note={note} />
            <div className="strip-text">
              <p className="callout">{f.body[1]}</p>
            </div>
            <ol className="steps">
              {(f.steps ?? []).map((step) => <li key={step}>{step}</li>)}
            </ol>
            {crops ? (
              <>
                <div className="crops crops-planner">
                  <div className="crop crop-note"><MediaSlot detail="planner" index={0} /></div>
                  <div className="crop crop-tulips"><MediaSlot detail="planner" index={1} /></div>
                </div>
                <p className="note strip-note">{rowNote('planner')}</p>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
