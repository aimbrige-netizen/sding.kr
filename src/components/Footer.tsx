import Link from 'next/link';
import { Logo } from './Logo';
import { ADDRESS, COMPANY } from '@/content/company';
import { COPY } from '@/content/site';
import { ctaMode } from '@/lib/launch';

// 푸터(PLAN '푸터', '푸터 회사 정보', 시안 A). --gray-100 바탕. 첫 줄에 로고와 링크 3개, 그 아래 상호, 회사 정보, AI 안내, 저작권.
// 항목마다 li라 읽기 도구가 단어를 붙여 읽지 않는다. 통신판매업신고번호는 값이 비어 있어도 라벨을 보인다.
// 링크 nav의 이름('사이트 정보')은 머리글 nav('기능')와 다르다
export function Footer() {
  const { labels } = COPY.footer;
  // 비어 있는 연락처는 빼고 보여 준다. 운영 빌드는 assertCompany()가 빈 값을 막는다
  const contacts = (['phone', 'email', 'privacyOfficer'] as const).filter((k) => COMPANY[k]);

  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="foot-top">
          <Logo href="/#top" label={COPY.homeLabel} className="foot-logo" />
          <nav className="foot-nav" aria-label={COPY.footer.navLabel}>
            <ul className="foot-links">
              {/* 처리방침은 다른 링크와 굵기와 색으로 구분해 보인다(PLAN '법적 페이지') */}
              <li><Link href="/privacy" className="privacy">{COPY.footer.privacy}</Link></li>
              <li><Link href="/terms">{COPY.footer.terms}</Link></li>
              {COMPANY.email ? <li><Link href={`mailto:${COMPANY.email}`}>{COPY.footer.partner}</Link></li> : null}
            </ul>
          </nav>
        </div>
        <address className="foot-address">
          <p className="foot-name">{COMPANY.legalName}</p>
          <ul className="foot-info">
            <li>{labels.ceo} {COMPANY.ceo}</li>
            <li>{labels.bizRegNo} {COMPANY.bizRegNo}</li>
            {COMPANY.showMailOrderLabel ? <li>{labels.mailOrderNo} {COMPANY.mailOrderNo}</li> : null}
            <li>{ADDRESS}</li>
            {contacts.map((k) => <li key={k}>{labels[k]} {COMPANY[k]}</li>)}
          </ul>
        </address>
        <div className="foot-bottom">
          <p>{ctaMode() === 'live' ? COPY.footer.aiNotice : COPY.footer.aiNoticeSoon}</p>
          <p>{COPY.footer.copyright}</p>
        </div>
      </div>
    </footer>
  );
}
