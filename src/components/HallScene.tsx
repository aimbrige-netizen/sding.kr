import { Band } from './Band';
import { MediaSlot } from './MediaSlot';
import { Phrase } from './Phrase';
import { Shot, StripLift } from './Shot';
import { featureById } from '@/content/features';
import { noteFor, rowPresent } from '@/lib/media-files';

// 웨딩홀 시뮬레이션(#hall, PLAN '웨딩홀 시뮬레이션', 시안 A 장면 4).
// 데스크톱: 둥근 샹들리에 홀 사진(hallShot)이 고정되고, 제목에는 제목과 함께 지나가는 흰 띠가 붙는다(사진을 바래게 하지 않는다).
// 흰 막에는 다른 홀을 걷는 영상(8칸)과 그 홀의 컷 두 장(4칸, 영상과 위아래 선이 맞는다).
// 폰: 영상이 장면의 첫 화면이고(고정 사진은 그리지 않는다) 그 아래 고지, 제목, 정사각 컷 두 장, 고지. 순서는 CSS가 바꾼다(DOM은 제목이 먼저).
// 영상은 MediaSlot이 VideoPlayer와 재생 버튼으로 그린다(무음, 반복, 35% 이상 보일 때 재생, 동작 줄이기는 포스터와 재생 버튼)
export function HallScene() {
  const f = featureById('hall');
  const shotNote = noteFor('hallShot');
  const videoNote = noteFor('hall');
  const crops = rowPresent('hall');
  return (
    <section id="hall" aria-labelledby="hall-title" data-feature="hall" className="feature">
      <Band feature={f} />
      <div className="scene scene-hall">
        <Shot id="hallShot" note={shotNote} />
        <div className="reel">
          <div className="reel-text">
            <h2 id="hall-title" tabIndex={-1} className="h2"><Phrase parts={f.headline} /></h2>
          </div>
          <div className="strip">
            <StripLift note={shotNote} />
            <div className="hall-media">
              <div className="hall-video"><MediaSlot id="hall" /></div>
              {videoNote ? <p className="note hall-video-note">{videoNote}</p> : null}
              {crops ? (
                <div className="hall-crops">
                  <div className="crop crop-chand"><MediaSlot detail="hall" index={0} /></div>
                  <div className="crop crop-aisle"><MediaSlot detail="hall" index={1} /></div>
                </div>
              ) : null}
            </div>
            {/* 데스크톱은 영상과 컷을 한 묶음으로 보고 그 아래 한 번, 폰은 컷 아래에 한 번 더(영상 아래 고지는 따로 있다) */}
            {videoNote ? <p className={crops ? 'note strip-note' : 'note strip-note strip-note-desktop'}>{videoNote}</p> : null}
          </div>
        </div>
      </div>
    </section>
  );
}
