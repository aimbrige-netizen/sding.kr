import { ctaMode } from './launch';
import { prune } from './prune';
import { COMPANY } from '@/content/company';
import { faqFor } from '@/content/faq';
import { MEDIA, type MediaSpec } from '@/content/media';
import { COPY, SITE } from '@/content/site';
import { ZONES } from '@/content/zones';

const home = `${SITE.url}/`;
const org = `${SITE.url}/#org`;
const site = `${SITE.url}/#website`;
const terms = `${SITE.url}/#terms`;
const absolute = (url = '') => (url ? new URL(url, SITE.url).href : '');

// 업로드일과 썸네일이 채워진 뒤에만 영상 노드를 낸다(PLAN '구조화 데이터')
function film() {
  const spec: MediaSpec = MEDIA.hero;
  if (spec.kind !== 'video' || !spec.uploadDate || !spec.poster) return null;
  return {
    '@type': 'VideoObject', '@id': `${SITE.url}/#film`, name: COPY.film.title, description: spec.description,
    thumbnailUrl: [absolute(spec.poster)], uploadDate: spec.uploadDate, duration: spec.duration,
    contentUrl: absolute(spec.src), embedUrl: spec.youtube, inLanguage: 'ko-KR',
  };
}

// ctaMode()는 스토어 주소가 있어야 'live'가 되므로 이 노드는 앱이 나온 뒤에만 나간다(PLAN 'CTA 전환')
function app() {
  const { ios, android } = SITE.store;
  return {
    '@type': 'MobileApplication', '@id': `${SITE.url}/#app`, name: COMPANY.brandName,
    operatingSystem: [ios && 'iOS', android && 'Android'].filter(Boolean).join(', '),
    installUrl: [ios, android], publisher: { '@id': org },
  };
}

// 노드를 @graph 하나에 담아 @id로 잇는다. 값은 화면과 같은 content 파일에서 읽는다
export const graph = () => {
  const mode = ctaMode();
  return prune({
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'Organization', '@id': org, name: COMPANY.brandName, alternateName: COMPANY.brandNameEn, legalName: COMPANY.legalName,
        url: home, logo: `${SITE.url}/icons/icon-512.png`, description: SITE.description,
        foundingDate: COMPANY.openedAt, taxID: COMPANY.bizRegNo,
        address: { '@type': 'PostalAddress', streetAddress: COMPANY.street, addressLocality: COMPANY.locality,
          addressRegion: COMPANY.region, addressCountry: 'KR' },
        sameAs: SITE.sameAs },
      { '@type': 'WebSite', '@id': site, url: home, name: COMPANY.brandName, inLanguage: 'ko-KR', publisher: { '@id': org } },
      { '@type': 'WebPage', '@id': `${SITE.url}/#webpage`, url: home, name: SITE.title,
        isPartOf: { '@id': site }, about: { '@id': org }, inLanguage: 'ko-KR',
        primaryImageOfPage: { '@type': 'ImageObject', url: `${SITE.url}/opengraph-image` } },
      { '@type': 'DefinedTermSet', '@id': terms, name: COPY.terms, inLanguage: 'ko-KR',
        hasDefinedTerm: ZONES.map((zone) => ({ '@type': 'DefinedTerm', name: zone.feature, description: zone.definition,
          inDefinedTermSet: { '@id': terms } })) },
      film(),
      mode === 'live' ? app() : null,
      { '@type': 'FAQPage', '@id': `${SITE.url}/#faq`,
        mainEntity: faqFor(mode).map((item) => ({ '@type': 'Question', name: item.q, acceptedAnswer: { '@type': 'Answer', text: item.a } })) },
    ],
  });
};
