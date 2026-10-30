import { ZONE_ICONS } from './Icons';
import type { Zone } from '@/content/zones';

// 존 영상·이미지가 오기 전의 브랜드 포스터 카드. 존 아이콘과 이름을 보인다(3단계에서 존 화면에 맞춰 다듬는다)
export function ZonePoster({ zone }: { zone: Zone }) {
  const Icon = ZONE_ICONS[zone.icon];
  return (
    <div className="zone-poster" role="img" aria-label={`${zone.name}, ${zone.feature}`}>
      <span className="st-ring"><Icon /></span>
      <span className="st-name">{zone.name}</span>
    </div>
  );
}
