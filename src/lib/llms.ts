import { ctaMode, launchFull } from './launch';
import { ADDRESS, COMPANY } from '@/content/company';
import { COPY, SITE } from '@/content/site';
import { ZONES } from '@/content/zones';

// public/llms.txt의 내용. 정의 문장, 기능 4개, 회사 정보, 링크 3개를 content 파일에서 읽는다(PLAN 'llms.txt')
export function llmsText() {
  const { llms, footer } = COPY;
  return [
    `# ${COMPANY.brandName} (${COMPANY.brandNameEn})`,
    '',
    `> ${SITE.definition}`,
    '',
    // 빌드할 때의 ctaMode()를 쓴다. 재생성으로는 바뀌지 않으므로 오픈일 0시(KST)가 지난 뒤 다시 배포해야 '정식 오픈일'이 된다(PLAN 'CTA 전환')
    `${ctaMode() === 'live' ? llms.launch : llms.launchSoon}: ${launchFull()}`,
    '',
    `## ${llms.features}`,
    '',
    ...ZONES.map((zone) => `- ${zone.feature}: ${zone.definition}`),
    '',
    `## ${llms.company}`,
    '',
    `- ${llms.legalName}: ${COMPANY.legalName}`,
    `- ${footer.labels.ceo}: ${COMPANY.ceo}`,
    `- ${footer.labels.bizRegNo}: ${COMPANY.bizRegNo}`,
    `- ${llms.address}: ${ADDRESS}`,
    '',
    `## ${llms.links}`,
    '',
    `- [${llms.home}](${SITE.url}/)`,
    `- [${footer.privacy}](${SITE.url}/privacy)`,
    `- [${footer.terms}](${SITE.url}/terms)`,
    '',
  ].join('\n');
}
