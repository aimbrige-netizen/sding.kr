import { preload } from 'react-dom';

// public/fonts/pretendard-1.3.9/의 서브셋 번호. 어떤 글자가 어느 파일에 있는지는 src/styles/fonts.css의 unicode-range를 따른다
export const FONT_SUBSET = { latin: 91, dotlessI: 74 } as const;

export const FONT_WAIT_MS = 700;                    // 후킹이 웹폰트를 기다리는 최대 시간(PLAN '모션')
export const FONT_PROBE = '1em "Pretendard Variable"';
export const HOOK_READY = 'hook-ready';             // html에 붙는다. 후킹 글자가 제자리로 올라오는 신호

// 후킹 등장 신호를 HTML 안의 짧은 스크립트로 건다. 글꼴이 준비되거나 700ms가 지나면 다음 프레임에 html에 hook-ready를 붙인다.
// JS 번들을 기다리지 않으므로 번들이 늦거나 받지 못해도 후킹은 제자리에 오고 실링이 보인다
export const hookGateScript = (sample: string) =>
  `(function(h,s){function r(){requestAnimationFrame(function(){h.classList.add('${HOOK_READY}')})}` +
  `setTimeout(r,${FONT_WAIT_MS});try{document.fonts.load('${FONT_PROBE}',s).then(r,r)}catch(e){r()}})` +
  `(document.documentElement,${JSON.stringify(sample).replace(/</g, '\\u003c')})`;

// 첫 화면 글자가 든 서브셋을 먼저 받는다. crossOrigin이 없으면 브라우저가 preload를 쓰지 않고 다시 받는다
export function preloadFontSubset(id: number) {
  preload(`/fonts/pretendard-1.3.9/PretendardVariable.subset.${id}.woff2`, {
    as: 'font', type: 'font/woff2', crossOrigin: 'anonymous',
  });
}
