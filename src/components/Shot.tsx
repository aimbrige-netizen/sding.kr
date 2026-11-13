import { MediaSlot } from './MediaSlot';
import { MEDIA, type MediaId } from '@/content/media';
import { present } from '@/lib/media-files';

// 장면 사진(시안 A). 데스크톱은 머리글 아래에 고정되는(sticky) 풀블리드 사진이고, 그 위를 흰 막(.strip)이 지나간다.
// 폰은 화면 폭 사진과 그 바로 아래 고지다. 데스크톱의 고지는 흰 막의 맨 윗줄(.strip-lift)이 맡아 사진 바로 아래에 붙어 있다.
// 흰 베일(.shot-veil)은 사진 위 제목의 대비를 지킨다. 파일이 없으면 포스터 카드라 베일을 두지 않는다
export function Shot({ id, note, className }: { id: MediaId; note: string; className?: string }) {
  const photo = present(MEDIA[id]);
  return (
    <div className="shot-wrap">
      <div className={className ? `shot ${className}` : 'shot'}>
        <MediaSlot id={id} />
        {photo ? <span className="shot-veil" aria-hidden="true" /> : null}
      </div>
      {note ? <p className="note shot-note">{note}</p> : null}
    </div>
  );
}

// 흰 막의 맨 윗줄. 데스크톱에서 고정 사진 바로 아래에 고지를 둔다(폰은 .shot-note). 고지가 없어도(포스터 카드) 줄의 높이는 남는다
export function StripLift({ note }: { note: string }) {
  return note ? <p className="note strip-lift">{note}</p> : <div className="strip-lift" aria-hidden="true" />;
}
