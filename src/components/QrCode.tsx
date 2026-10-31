import { encode } from 'uqr';

// 서버 컴포넌트에서만 쓴다. 라이브러리가 브라우저 번들에 들어가지 않는다. 여백 4칸은 QR 규격의 조용한 영역이다
export function QrCode({ value, label }: { value: string; label: string }) {
  const { data, size } = encode(value, { ecc: 'M', border: 4 });
  const path = data.flatMap((row, y) => row.map((dark, x) => (dark ? `M${x} ${y}h1v1h-1z` : ''))).join('');
  return (
    <svg role="img" aria-label={label} viewBox={`0 0 ${size} ${size}`} shapeRendering="crispEdges">
      <path d={path} fill="currentColor" />
    </svg>
  );
}
