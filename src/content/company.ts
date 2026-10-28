// 사업자등록증(2026-10-07 발급)의 값만 쓴다. 법인명은 '주식회사 스딩' 하나뿐이다.
export const COMPANY = {
  legalName: '주식회사 스딩', brandName: '스딩', brandNameEn: 'Sding',   // TODO(brand-en): Sding 또는 SDING. 상표 출원안과 맞춘다
  ceo: '정원창', bizRegNo: '590-86-03810', corpRegNo: '110111-0970668',  // 법인등록번호는 푸터에 쓰지 않는다
  openedAt: '2026-09-18',                   // TODO(founding-date): 법인 설립등기일 확인 전까지 개업일을 쓴다
  region: '서울특별시', locality: '강남구', street: '압구정로46길 5-10, 3층 302호 (신사동, 압구정로데오스타)',
  mailOrderNo: '',                          // 통신판매업 신고번호. 신고 완료 전까지 반드시 빈 값
  showMailOrderLabel: true,                 // 번호가 비어 있어도 라벨은 보인다. 숨기려면 false
  phone: '', email: '', privacyOfficer: '',   // TODO(contact): 전화번호, 대표 이메일, 개인정보보호책임자를 전달받아 채운다
};
export const ADDRESS = `${COMPANY.region} ${COMPANY.locality} ${COMPANY.street}`;

// 운영 빌드에서만 호출한다. mailOrderNo는 검사하지 않는다.
export function assertCompany() {
  for (const k of ['phone', 'email', 'privacyOfficer'] as const) {
    if (!COMPANY[k]) throw new Error('COMPANY.' + k + ' is empty');
  }
}
