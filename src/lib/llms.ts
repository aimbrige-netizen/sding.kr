import { launchFull } from './launch';
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
    `${llms.launch}: ${launchFull()}`,
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
