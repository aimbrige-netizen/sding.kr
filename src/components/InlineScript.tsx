'use client';

// HTML을 읽을 때 바로 실행되는 짧은 스크립트. 브라우저에서 React가 그린 script는 실행되지 않으므로
// 클라이언트에서는 type을 바꿔 개발 모드의 경고를 막는다(Next 안내서 'Preventing Flash')
export function InlineScript({ html }: { html: string }) {
  return (
    <script
      type={typeof window === 'undefined' ? 'text/javascript' : 'text/plain'}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
