import type { ReactNode, SVGProps } from 'react';
import type { Zone } from '@/content/zones';

// 24px 격자, 선 2px, 둥근 끝(PLAN '아이콘과 이미지'). 존 아이콘 4개와 반짝임 1개, 재생·정지·비교 손잡이·펼침 조작 글리프만 둔다
type IconProps = Omit<SVGProps<SVGSVGElement>, 'children'>;

function Svg({ children, ...props }: IconProps & { children: ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" {...props}>
      {children}
    </svg>
  );
}

const line = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
const solid = { fill: 'currentColor', stroke: 'currentColor', strokeWidth: 1.4, strokeLinejoin: 'round' } as const;

export function Sparkle(props: IconProps) {
  return (
    <Svg {...solid} {...props}>
      <path d="M12 3c.6 5.1 3.9 8.4 9 9-5.1.6-8.4 3.9-9 9-.6-5.1-3.9-8.4-9-9 5.1-.6 8.4-3.9 9-9z" />
    </Svg>
  );
}

function Ticket(props: IconProps) {
  return (
    <Svg {...line} {...props}>
      <path d="M4 6.5h16a1 1 0 0 1 1 1V10a2 2 0 0 0 0 4v2.5a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V14a2 2 0 0 0 0-4V7.5a1 1 0 0 1 1-1z" />
      <path d="M15 8.6v1.1M15 11.45v1.1M15 14.3v1.1" />
    </Svg>
  );
}

function ParkMap(props: IconProps) {
  return (
    <Svg {...line} {...props}>
      <path d="M3.5 6.2 9 4l6 2.5 5.5-2.2v13.5L15 20l-6-2.5-5.5 2.2z" />
      <path d="M9 4v13.5M15 6.5V20" />
    </Svg>
  );
}

function Dress(props: IconProps) {
  return (
    <Svg {...line} {...props}>
      <path d="M9.5 3 10 7.2c-.5 1.2-.7 2.5-.5 3.8l-4 8.4c4.3 1.5 8.7 1.5 13 0l-4-8.4c.2-1.3 0-2.6-.5-3.8L14.5 3" />
      <path d="M10 7.2c1.3.7 2.7.7 4 0M9.5 11h5" />
    </Svg>
  );
}

function Arch(props: IconProps) {
  return (
    <Svg {...line} {...props}>
      <path d="M5 20.5V11a7 7 0 0 1 14 0v9.5M3 20.5h18M10.2 20.5l1.1-6.5M13.8 20.5l-1.1-6.5" />
    </Svg>
  );
}

export const ZONE_ICONS: Record<Zone['icon'], (props: IconProps) => ReactNode> = {
  ticket: Ticket,
  map: ParkMap,
  dress: Dress,
  arch: Arch,
};

export function Play(props: IconProps) {
  return (
    <Svg fill="currentColor" {...props}>
      <path d="M7 5.2v13.6a1.2 1.2 0 0 0 1.8 1l11-6.8a1.2 1.2 0 0 0 0-2L8.8 4.2a1.2 1.2 0 0 0-1.8 1z" />
    </Svg>
  );
}

export function Pause(props: IconProps) {
  return (
    <Svg fill="currentColor" {...props}>
      <rect x="6" y="4.5" width="4.2" height="15" rx="1.4" />
      <rect x="13.8" y="4.5" width="4.2" height="15" rx="1.4" />
    </Svg>
  );
}

export function Chevrons(props: IconProps) {
  return (
    <Svg {...line} {...props}>
      <path d="M9 7l-5 5 5 5M15 7l5 5-5 5" />
    </Svg>
  );
}

export function ChevronDown(props: IconProps) {
  return (
    <Svg {...line} {...props}>
      <path d="M6 9l6 6 6-6" />
    </Svg>
  );
}
