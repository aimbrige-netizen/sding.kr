import { MediaSlot } from './MediaSlot';
import { MEDIA, type MediaSpec } from '@/content/media';
import { zoneLabel, type Zone as ZoneData } from '@/content/zones';
import { order } from '@/lib/motion';

// 존 섹션 하나(PLAN '존 공통 틀'). 문서 순서는 늘 글 다음 미디어이고, 좌우는 CSS가 바꾼다.
// 고지 문구는 미디어 바로 아래에 둔다(ZONE 03 표). 측정(zone_view, video_play)은 7단계에서 붙인다
export function Zone({ zone, flip }: { zone: ZoneData; flip: boolean }) {
  const spec: MediaSpec = MEDIA[zone.media];
  const kind = spec.kind === 'phone' || spec.kind === 'compare' ? spec.kind : 'wide';
  // 모바일 4:5 컷이 있을 때만 모바일 프레임을 4:5로 바꾼다. 없으면 16:9를 폭 가득 보인다
  const cut = spec.kind === 'video' && Boolean(spec.src && spec.srcMobile);
  // TODO(poster-ai-label): 파일이 오기 전에는 AI가 만들지 않은 포스터 위에 라벨이 붙는다. 변호사 검토에서 함께 본다
  const badge = zone.badge
    ? <span className="ai-badge" data-strong={kind === 'compare' || undefined}>{zone.badge}</span>
    : null;
  // 문구를 고치다 hl이 어긋나면 제목이 소리 없이 깨지므로 빌드를 멈춘다
  if (!zone.headline.endsWith(` ${zone.hl}`)) throw new Error(`${zone.id}: hl이 headline의 끝 구절이 아니다`);
  const lead = zone.headline.slice(0, -zone.hl.length).trimEnd();

  return (
    <section id={zone.id} aria-labelledby={`${zone.id}-title`} className="zone" data-kind={kind} data-flip={flip || undefined} data-cut={cut || undefined}>
      <div className="zone-in">
        <div className="zone-text">
          <p className="eyebrow" data-reveal style={order(0)}>{zoneLabel(zone)}</p>
          <h2 id={`${zone.id}-title`} tabIndex={-1} className="zone-title" data-reveal style={order(1)}>
            <span className="nb">{lead}</span> <span className="nb"><span className="hl">{zone.hl}</span></span>
          </h2>
          <p className="zone-body" data-reveal style={order(2)}>{zone.body}</p>
        </div>
        <figure className="zone-media">
          {kind === 'phone' ? (
            <div className="stage" data-reveal="frame">
              <MediaSlot id={zone.media}>{badge}</MediaSlot>
            </div>
          ) : (
            <div className="frame" data-reveal="frame">
              <div className="frame-core">
                <MediaSlot id={zone.media}>{badge}</MediaSlot>
              </div>
            </div>
          )}
          {zone.notice ? <figcaption className="zone-notice">{zone.notice}</figcaption> : null}
        </figure>
      </div>
    </section>
  );
}
