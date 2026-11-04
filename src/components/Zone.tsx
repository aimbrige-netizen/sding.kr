import { MediaSlot } from './MediaSlot';
import { MEDIA, hasFile, type MediaSpec } from '@/content/media';
import { zoneLabel, type Zone as ZoneData } from '@/content/zones';
import { order } from '@/lib/motion';

// 존 섹션 하나(PLAN '존 공통 틀'). 문서 순서는 늘 글 다음 미디어이고, 좌우는 CSS가 바꾼다.
// 고지 문구는 미디어 바로 아래에 둔다(ZONE 03 표)
export function Zone({ zone, flip }: { zone: ZoneData; flip: boolean }) {
  const spec: MediaSpec = MEDIA[zone.media];
  const kind = spec.kind === 'phone' || spec.kind === 'compare' ? spec.kind : 'wide';
  // 모바일 4:5 컷이 있을 때만 모바일 프레임을 4:5로 바꾼다. 없으면 16:9를 폭 가득 보인다
  const cut = spec.kind === 'video' && Boolean(spec.src && spec.srcMobile);
  // 파일이 오기 전의 포스터 카드는 AI가 만든 그림이 아니다. 그래서 'AI' 라벨은 파일이 있을 때만 붙이고,
  // 고지도 파일에 대한 문장(notice) 대신 기능의 한계를 말하는 문장(posterNotice)을 쓴다
  const ready = hasFile(spec);
  // 포스터 이미지가 없는 영상은 재생 전까지 포스터 카드를 덮개로 써서 'AI' 라벨이 그 위에 붙는다.
  // 영상은 포스터와 함께 넣는다(PLAN '미디어 슬롯 사양'의 poster-*)
  const screen = spec.kind === 'phone' ? spec.screen : spec;
  if (ready && screen.kind === 'video' && !screen.poster) throw new Error(`${zone.id}: 영상에 poster가 없다`);
  const badge = zone.badge && ready
    ? <span className="ai-badge" data-strong={kind === 'compare' || undefined}>{zone.badge}</span>
    : null;
  const notice = ready ? zone.notice : zone.posterNotice;
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
          {notice ? <figcaption className="zone-notice">{notice}</figcaption> : null}
        </figure>
      </div>
    </section>
  );
}
