import { ZONE_ICONS } from './Icons';
import type { Zone } from '@/content/zones';

// 존 영상·이미지가 오기 전의 브랜드 포스터 카드. 소개 영상 포스터의 존을 크게 당겨 존 아이콘과 이름만 보인다(PLAN '미디어 슬롯 사양')
export function ZonePoster({ zone }: { zone: Zone }) {
  const Icon = ZONE_ICONS[zone.icon];
  return (
    <div className="zone-poster" role="img" aria-label={`${zone.name}, ${zone.feature}`}>
      <span className="st">
        <span className="st-ring"><Icon /></span>
        <span className="st-name">{zone.name}</span>
      </span>
    </div>
  );
}
