import { Sparkle } from './Icons';
import { MediaSlot } from './MediaSlot';
import { MEDIA, type MediaSpec } from '@/content/media';
import { COPY } from '@/content/site';
import { ZONES } from '@/content/zones';

// 영상 섹션(#film). 히어로 바로 아래에서 프레임 윗부분이 첫 화면에 보인다(PLAN '영상 섹션')
export function Film() {
  const spec: MediaSpec = MEDIA.hero;
  const transcript = spec.kind === 'video' ? spec.transcript : undefined;
  return (
    <section id="film" aria-labelledby="film-title" className="px-(--gutter) pb-(--section-y)">
      <h2 id="film-title" tabIndex={-1} className="sr-only">{COPY.film.title}</h2>
      <div className="film-shell">
        <div className="film-core">
          <MediaSlot id="hero" />
        </div>
      </div>
      <details className="transcript" data-reveal>
        <summary>
          <Sparkle />
          <span>{COPY.film.transcript}</span>
        </summary>
        <div className="transcript-body">
          {transcript ? (
            <p>{transcript}</p>
          ) : (
            // TODO(transcript): 영상 대본이 오면 MEDIA.hero.transcript에 넣는다. 그 전에는 포스터 라이드가 지나는 존 순서를 보인다
            <ol>
              {ZONES.map((zone) => (
                <li key={zone.id}><b>{zone.name}</b> {zone.headline}</li>
              ))}
            </ol>
          )}
        </div>
      </details>
    </section>
  );
}
