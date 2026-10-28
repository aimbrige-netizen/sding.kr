import Link from 'next/link';
import { Logo } from './Logo';
import { ADDRESS, COMPANY } from '@/content/company';
import { COPY } from '@/content/site';

// 보이는 '|'는 장식이다. 읽기 도구가 단어를 붙여 읽지 않도록 앞뒤에 실제 공백을 둔다
const Sep = () => <>{' '}<span aria-hidden="true" className="px-1 text-line">|</span>{' '}</>;

export function Footer() {
  const { labels } = COPY.footer;
  // 비어 있는 연락처는 빼고 보여 준다. 운영 빌드는 assertCompany()가 빈 값을 막는다
  const contacts = (['phone', 'email', 'privacyOfficer'] as const).filter((k) => COMPANY[k]);
  const links = [
    { href: '/privacy', label: COPY.footer.privacy },
    { href: '/terms', label: COPY.footer.terms },
    ...(COMPANY.email ? [{ href: `mailto:${COMPANY.email}`, label: COPY.footer.partner }] : []),
  ];

  return (
    <footer className="bg-peach px-(--gutter) pt-12 pb-[calc(var(--buddy)+var(--sp-12)+env(safe-area-inset-bottom))] text-cap font-normal tracking-normal text-ink-600">
      <div className="mx-auto max-w-site">
        <Logo />
        <address className="mt-4 flex flex-col gap-1 not-italic">
          <p>
            {COMPANY.legalName}<Sep />{labels.ceo} {COMPANY.ceo}
          </p>
          <p>
            {labels.bizRegNo} {COMPANY.bizRegNo}
            {COMPANY.showMailOrderLabel && <><Sep />{labels.mailOrderNo} {COMPANY.mailOrderNo}</>}
          </p>
          <p>{ADDRESS}</p>
          {contacts.length > 0 && (
            <p>
              {contacts.map((k, i) => (
                <span key={k}>{i > 0 && <Sep />}{labels[k]} {COMPANY[k]}</span>
              ))}
            </p>
          )}
        </address>
        <nav className="mt-4">
          <ul className="flex flex-wrap items-center">
            {links.map((l, i) => (
              <li key={l.href} className="flex items-center">
                {i > 0 && <span aria-hidden="true" className="px-2">·</span>}
                <Link href={l.href} className="inline-flex min-h-(--tap) items-center font-semibold text-ink-900 underline-offset-4 hover:underline">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <p className="mt-2">{COPY.footer.aiNotice}</p>
        <p className="mt-1">{COPY.footer.copyright}</p>
      </div>
    </footer>
  );
}
