import type { ReactNode, SVGProps } from 'react';

// 24px 격자, 선 2px, 둥근 끝(PLAN '아이콘과 이미지'). 재생·정지·닫기·펼침(+) 조작 글리프만 둔다
type IconProps = Omit<SVGProps<SVGSVGElement>, 'children'>;

function Svg({ children, ...props }: IconProps & { children: ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" {...props}>
      {children}
    </svg>
  );
}

const line = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
// 채운 글리프용 설정. 지금은 쓰는 아이콘이 없어 내보내 둔다(쓰지 않는 상수로 남기면 lint가 경고한다)
export const solid = { fill: 'currentColor', stroke: 'currentColor', strokeWidth: 1.4, strokeLinejoin: 'round' } as const;

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

// FAQ 펼침 표시. 열리면 45도 돌아 x가 된다(faq.css)
export function Plus(props: IconProps) {
  return (
    <Svg {...line} {...props}>
      <path d="M12 5v14M5 12h14" />
    </Svg>
  );
}

export function Close(props: IconProps) {
  return (
    <Svg {...line} {...props}>
      <path d="M6 6l12 12M18 6L6 18" />
    </Svg>
  );
}
