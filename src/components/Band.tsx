import { Phrase } from './Phrase';
import { segText, type Feature } from '@/content/features';

// 장면 사이의 흰 띠(시안 A): 라벨(고정 용어)과 큰 문장 하나. 문장은 제목이 아니라 p다(제목은 장면의 h2).
// 큰 문장은 설명의 첫 문장(body[0])을 줄만 나눠 보인다. 글자가 다르면 빌드할 때 멈춘다
export function Band({ feature, tight = false }: { feature: Feature; tight?: boolean }) {
  if (segText(feature.statement) !== feature.body[0]) throw new Error(`features.${feature.id}.statement가 body[0]과 글자가 다르다`);
  return (
    <div className={tight ? 'band band-tight' : 'band'}>
      <div className="wrap band-in">
        <p className="label">{feature.feature}</p>
        <p className="statement"><Phrase parts={feature.statement} /></p>
      </div>
    </div>
  );
}
