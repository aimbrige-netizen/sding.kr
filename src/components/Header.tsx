import Link from 'next/link';
import { CtaButton } from './CtaButton';
import { Logo } from './Logo';
import { FEATURES } from '@/content/features';
import { COPY } from '@/content/site';
import { ctaMode } from '@/lib/launch';

// 머리글(PLAN '헤더'). 900px 이상은 워드마크, 기능 바로가기 4개, CTA이고, 폰은 워드마크와 CTA만 보인다. 햄버거는 두지 않는다.
// 늘 흰 반투명 바탕과 블러라 스크롤 위치를 보는 JS가 없다. CTA 동작(신청 창, 스토어 선택 창)은 CtaButton이 맡는다.
// 머리글은 모든 페이지에 있으므로 링크는 '/'를 붙인다. 홈에서는 같은 문서 안에서 스크롤만 한다
export function Header() {
  return (
    <header className="site-header">
      <div className="wrap site-header-in">
        <Logo href="/#top" label={COPY.homeLabel} />
        <div className="site-actions">
          <nav className="site-nav" aria-label={COPY.nav.label}>
            <ul>
              {FEATURES.map((f) => (
                <li key={f.id}>
                  <Link href={`/#${f.id}`}>{f.nav}</Link>
                </li>
              ))}
            </ul>
          </nav>
          <CtaButton location="header" className="btn btn-compact">
            {COPY.cta[ctaMode()]}
          </CtaButton>
        </div>
      </div>
    </header>
  );
}
