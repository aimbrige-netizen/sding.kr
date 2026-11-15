import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { WORDMARK } from '@/components/Wordmark';
import { COPY, SITE } from '@/content/site';
import { ctaMode, launchDotted } from '@/lib/launch';

export const alt = SITE.ogAlt;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const revalidate = 3600;   // 페이지와 같다. 오픈일에 오픈 후 문구로 바뀐다(PLAN '메타 태그')

// next/og는 woff2와 가변 폰트를 읽지 못해 고정 굵기 woff를 따로 둔다. 방문자에게는 내려가지 않는다
const [light, extraBold, css] = await Promise.all([
  readFile(join(process.cwd(), 'assets/fonts/Pretendard-Light.subset.woff')),
  readFile(join(process.cwd(), 'assets/fonts/Pretendard-ExtraBold.subset.woff')),
  readFile(join(process.cwd(), 'src/styles/tokens.css'), 'utf8'),
]);

// CSS 변수와 clamp를 읽지 못해 색은 tokens.css에서 꺼내고 크기는 숫자로 둔다
const token = (name: string) => css.match(new RegExp(`--${name}:\\s*(#[0-9A-Fa-f]{6})`))![1];

// 워드마크는 Wordmark.tsx의 윤곽을 --orange로 칠한 SVG다. 색 값의 #이 데이터 URL을 끊지 않게 통째로 인코딩한다. TODO(logo)
const WORDMARK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${WORDMARK.viewBox}">`
  + `<path fill-rule="evenodd" fill="${token('orange')}" d="${WORDMARK.d}"/></svg>`;
const WORDMARK_SRC = `data:image/svg+xml,${encodeURIComponent(WORDMARK_SVG)}`;

// 공유 미리보기 이미지. 흰 바탕에 워드마크, 날짜 줄, 두 줄 H1, 정의 문장을 글자로만 그린다(PLAN '메타 태그')
export default function Image() {
  const mode = ctaMode();
  return new ImageResponse(
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', padding: '64px 72px 0', fontFamily: 'Pretendard',
      backgroundColor: token('white') }}>
      {/* 높이 48에 viewBox 비율(1519.2 : 641)을 맞춘 폭. Satori는 두 값을 다 받아야 비율을 지킨다 */}
      <img src={WORDMARK_SRC} width={114} height={48} alt="" />
      <div style={{ display: 'flex', marginTop: 56, fontSize: 30, fontWeight: 800, lineHeight: 1.4, color: token('ink') }}>
        {`${launchDotted()} ${mode === 'live' ? COPY.hero.kicker : COPY.hero.kickerSoon}`}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', marginTop: 24, fontSize: 112, fontWeight: 800, lineHeight: 1.08, letterSpacing: '-0.04em', color: token('ink') }}>
        {COPY.hero.h1.map((line) => <div key={line} style={{ whiteSpace: 'nowrap' }}>{line}</div>)}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', marginTop: 28, fontSize: 30, fontWeight: 300, lineHeight: 1.4, color: token('gray-700') }}>
        {SITE.definition.split(/(?<=,)\s+/).map((line) => <div key={line} style={{ whiteSpace: 'nowrap' }}>{line}</div>)}
      </div>
    </div>,
    {
      ...size,
      fonts: [
        { name: 'Pretendard', data: light, weight: 300, style: 'normal' },
        { name: 'Pretendard', data: extraBold, weight: 800, style: 'normal' },
      ],
    },
  );
}
