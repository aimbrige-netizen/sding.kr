import Link from 'next/link';
import { COMPANY } from '@/content/company';

type Props = { href?: string; label?: string };

// TODO(logo): 로고 SVG 원본이 오면 public/brand/logo.svg로 바꾼다. 그 전까지 텍스트 로고를 쓴다
export function Logo({ href, label }: Props) {
  const mark = <span className="text-h3 font-extrabold text-brand">{COMPANY.brandName}</span>;
  if (!href) return mark;
  return (
    <Link href={href} aria-label={label} className="inline-flex min-h-(--tap) min-w-(--tap) items-center">
      {mark}
    </Link>
  );
}
