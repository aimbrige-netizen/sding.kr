import type { CSSProperties } from 'react';
import { Sparkle, ZONE_ICONS } from './Icons';
import { ZONES } from '@/content/zones';

// 브랜드 포스터 카드: 파크 지도 위를 지나는 길과 존 4개(시안 B). 데스크톱은 16:9, 모바일은 4:5 길을 쓴다.
// 길은 구간(leg) 5개로 나뉘고, 존은 1~4번 구간이 끝나는 점에 있다. 라이드는 구간을 차례로 그린다
const ROADS = {
  wide: {
    view: '0 0 1600 900',
    legs: [
      'M-60 780C80 760 200 720 290 640',
      'M290 640C380 560 430 240 560 180',
      'M560 180C690 120 760 330 800 450C840 570 900 720 1040 660',
      'M1040 660C1180 600 1180 260 1310 200',
      'M1310 200C1440 140 1560 120 1680 80',
    ],
  },
  tall: {
    view: '0 0 800 1000',
    legs: [
      'M-60 150C40 170 130 190 215 225',
      'M215 225C300 260 480 300 585 330',
      'M585 330C690 360 610 480 400 510C190 540 120 640 215 690',
      'M215 690C310 740 480 770 585 795',
      'M585 795C690 820 760 900 860 1040',
    ],
  },
};

// 존의 위치. x·y는 모바일 길, dx·dy는 데스크톱 길 위의 점이다
const stop = (x: string, y: string, dx: string, dy: string) => ({ '--x': x, '--y': y, '--dx': dx, '--dy': dy }) as CSSProperties;
const STOPS = [
  stop('26.9%', '22.5%', '18.1%', '71.1%'),
  stop('73.1%', '33%', '35%', '20%'),
  stop('26.9%', '69%', '65%', '73.3%'),
  stop('73.1%', '79.5%', '81.9%', '22.2%'),
];

// 구간을 이어 한 줄의 길로 만든다. 다음 구간의 시작점(M)은 앞 구간의 끝점과 같다
const joinLegs = (legs: string[]) => legs[0] + legs.slice(1).map((leg) => leg.replace(/^M[-\d.\s]+/, '')).join('');

export function ParkMap({ label }: { label: string }) {
  return (
    <div className="park" role="img" aria-label={label}>
      {(['wide', 'tall'] as const).map((kind) => {
        const road = ROADS[kind];
        const path = joinLegs(road.legs);
        return (
          <svg key={kind} className={`road road-${kind}`} viewBox={road.view} preserveAspectRatio="none" aria-hidden="true" focusable="false">
            <path className="road-edge" d={path} />
            <path className="road-lane" d={path} />
            <path className="road-dots" d={path} />
            {road.legs.map((leg) => <path key={leg} className="leg" d={leg} pathLength={1} />)}
          </svg>
        );
      })}
      {ZONES.map((zone, i) => {
        const Icon = ZONE_ICONS[zone.icon];
        return (
          <span key={zone.id} className="st" style={STOPS[i]}>
            <span className="st-ring"><Icon /></span>
            <span className="st-name">{zone.name}</span>
          </span>
        );
      })}
      <Sparkle className="park-spark park-spark-1" />
      <Sparkle className="park-spark park-spark-2" />
      <Sparkle className="park-spark park-spark-3" />
    </div>
  );
}
