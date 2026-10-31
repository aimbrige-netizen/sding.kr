import { Fragment } from 'react';

// 문장이나 구절을 span으로 나눈다. 사이에 실제 공백을 두어 읽기 도구가 붙여 읽지 않는다
export function Spans({ parts, className }: { parts: string[]; className?: string }) {
  return parts.map((part, i) => (
    <Fragment key={part}>
      {i > 0 ? ' ' : null}
      <span className={className}>{part}</span>
    </Fragment>
  ));
}
