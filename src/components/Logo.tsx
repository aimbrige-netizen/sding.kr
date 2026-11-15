import Link from 'next/link';
import { Wordmark } from './Wordmark';

type Props = { href: string; label: string; className?: string };

// 머리글과 푸터의 로고 링크. 누르는 영역은 44px 이상이고(base.css .logo), 워드마크 색은 --orange다.
// TODO(logo): 지금은 따낸 워드마크다. 로고 원본 벡터가 오면 Wordmark.tsx의 d만 바꾼다
export function Logo({ href, label, className }: Props) {
  return (
    <Link href={href} aria-label={label} className={['logo', className].filter(Boolean).join(' ')}>
      <Wordmark className="logo-mark" />
    </Link>
  );
}
