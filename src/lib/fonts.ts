import { preload } from 'react-dom';

// public/fonts/pretendard-1.3.9/의 서브셋 번호. 어떤 글자가 어느 파일에 있는지는 src/styles/fonts.css의 unicode-range를 따른다.
// 첫 화면 글자를 가장 많이 담은 세 파일을 먼저 받는다(84.5KB). h1에서는 '혼'(87)만 나중에 바뀐다
export const FONT_SUBSET = {
  latin: 91,    // 숫자와 영문, 'AI', 쉼표와 마침표, 그리고 '가이'(h1), '스가로하고리'(부제), '시기'(CTA)
  hangul: 90,   // '보는비'(h1), '정오'(날짜), 부제의 한글 13자(은을정제공개과드미경게해요)
  h1: 88,       // '격결준'(h1), '격'(부제), '림받'(CTA)
} as const;

// 첫 화면 글자가 든 서브셋을 먼저 받는다. crossOrigin이 없으면 브라우저가 preload를 쓰지 않고 다시 받는다
export function preloadFontSubset(id: number) {
  preload(`/fonts/pretendard-1.3.9/PretendardVariable.subset.${id}.woff2`, {
    as: 'font', type: 'font/woff2', crossOrigin: 'anonymous',
  });
}
