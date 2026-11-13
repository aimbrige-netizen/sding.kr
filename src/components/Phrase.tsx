import { Fragment } from 'react';
import type { Seg } from '@/content/features';

// 조각으로 나눈 문구를 그린다(features.ts의 Seg). 조각 사이에는 실제 띄어쓰기를 두어 읽기 도구가 붙여 읽지 않는다.
// 줄바꿈은 폭에 따라 숨기는 br이다: br-m은 899px 이하에서만, br-d는 900px 이상에서만 보인다(base.css). 강조는 em이다
export function Phrase({ parts }: { parts: readonly Seg[] }) {
  return parts.map((s, i) => (
    <Fragment key={i}>
      {i > 0 ? ' ' : null}
      {s.br === 'all' ? <br /> : s.br === 'phone' ? <br className="br-m" /> : s.br === 'desktop' ? <br className="br-d" /> : null}
      {s.em ? <em>{s.t}</em> : s.t}
    </Fragment>
  ));
}
