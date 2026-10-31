import { CtaButton } from './CtaButton';
import { HeaderShell } from './HeaderShell';
import { Logo } from './Logo';
import { COPY } from '@/content/site';
import { ctaMode } from '@/lib/launch';

// 메뉴와 햄버거는 두지 않는다. CTA 동작(신청 창, 스토어 선택 창)은 CtaButton이 맡는다.
// 헤더는 모든 페이지에 있으므로 링크는 '/'를 붙인다. 홈에서는 같은 문서 안에서 스크롤만 한다
export function Header() {
  const mode = ctaMode();
  return (
    <HeaderShell>
      <div className="mx-auto flex h-full max-w-site items-center justify-between">
        <Logo href="/#top" label={COPY.homeLabel} />
        <CtaButton
          className="inline-flex min-h-(--tap) items-center rounded-pill bg-brand-deep px-5 text-cap font-bold tracking-normal text-white transition-[scale,box-shadow] duration-200 ease-brand hover:scale-103 hover:shadow-(--shadow-lift) active:scale-98 active:duration-100 motion-reduce:hover:scale-100 motion-reduce:active:scale-100 forced-colors:border"
        >
          {COPY.cta[mode]}
        </CtaButton>
      </div>
    </HeaderShell>
  );
}
