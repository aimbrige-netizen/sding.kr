import { ZONE_ICONS } from './Icons';
import { COPY, SITE } from '@/content/site';
import { ZONES } from '@/content/zones';
import { order } from '@/lib/motion';

// 문장을 구절 앞뒤에서 나눈다. 구절도 조각으로 남는다
const splitBy = (text: string, parts: string[]) =>
  text.split(new RegExp(`(${parts.map((part) => part.replaceAll('.', '\\.')).join('|')})`));

// 정의 문장 안에서 묶을 구절을 감싸고 그 안의 강조 구절에 형광펜을 칠한다. 문장은 SITE.definition 하나뿐이다
function Definition() {
  const { keep, hl } = COPY.intro;
  return splitBy(SITE.definition, keep).map((part, k) => {
    if (!keep.includes(part)) return part;
    const pieces = splitBy(part, hl).map((piece, j) => (hl.includes(piece) ? <span key={j} className="hl">{piece}</span> : piece));
    return <span key={k} className="nb">{pieces}</span>;
  });
}

// 소개(#intro). 시안은 docs/design/hero-b.html. 존 알약은 일반 앵커라 JS 없이도 이동한다
export function Intro() {
  return (
    <section id="intro" aria-labelledby="intro-title" className="intro">
      <div className="intro-in">
        <h2 id="intro-title" tabIndex={-1} className="eyebrow" data-reveal style={order(0)}>{COPY.intro.kicker}</h2>
        <p className="definition" data-reveal style={order(1)}><Definition /></p>
        <ul className="intro-zones">
          {ZONES.map((zone, i) => {
            const Icon = ZONE_ICONS[zone.icon];
            return (
              <li key={zone.id} data-reveal style={order(i + 2)}>
                <a className="intro-pill" href={`#${zone.id}`}>
                  <span className="intro-ico"><Icon /></span>
                  <span>{zone.name}</span>
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
