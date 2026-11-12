import { Fragment } from 'react';
import type { Feature } from '@/content/features';

// 기능 섹션 머리: 라벨(고정 용어), h2 두 줄, 설명. 문구는 모두 features.ts에서 읽는다.
// h2의 두 줄 사이에는 띄어쓰기를 DOM에 남겨 스크린리더가 두 줄을 붙여 읽지 않게 한다.
// breakDesktop이면 900px 이상에서 문장마다 줄을 바꾸고(br.br-d), 폰은 이어 쓴다
export function FeatureHead({ feature }: { feature: Feature }) {
  const { headline, body } = feature;
  return (
    <>
      <p className="label">{feature.feature}</p>
      <h2 id={`${feature.id}-title`} tabIndex={-1} className="h2">
        <span className="line">{headline[0]}</span>{' '}<span className="line">{headline[1]}</span>
      </h2>
      <p className="body">
        {body.map((sentence, i) => (
          <Fragment key={i}>
            {i > 0 ? ' ' : null}
            {i > 0 && feature.breakDesktop ? <br className="br-d" /> : null}
            {sentence}
          </Fragment>
        ))}
      </p>
    </>
  );
}
