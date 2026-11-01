import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { COMPANY } from '@/content/company';
import { COPY, SITE } from '@/content/site';
import { ctaMode, launchDotted } from '@/lib/launch';

export const alt = SITE.ogAlt;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const revalidate = 3600;   // 페이지와 같다. 오픈일에 오픈 후 문구로 바뀐다(PLAN '메타 태그')

// next/og는 woff2와 가변 폰트를 읽지 못해 고정 굵기 woff를 따로 둔다. 방문자에게는 내려가지 않는다
const [light, extraBold, black, css] = await Promise.all([
  readFile(join(process.cwd(), 'assets/fonts/Pretendard-Light.subset.woff')),
  readFile(join(process.cwd(), 'assets/fonts/Pretendard-ExtraBold.subset.woff')),
  readFile(join(process.cwd(), 'assets/fonts/Pretendard-Black.subset.woff')),
  readFile(join(process.cwd(), 'src/styles/tokens.css'), 'utf8'),
]);

// CSS 변수와 clamp를 읽지 못해 색은 tokens.css에서 꺼내고 크기는 숫자로 둔다
const token = (name: string) => css.match(new RegExp(`--${name}:\\s*(#[0-9A-Fa-f]{6})`))![1];
const HOOK = 184;                 // --fs-display의 최댓값
const em = (n: number) => n * HOOK;
const EYES = [.913, 1.484];       // 둘째 단어 상자 왼쪽에서 두 o의 중심까지. 세로 중심은 .541em(줄 높이 .9에서 잰 값)
const disc = (d: number) => ({ width: em(d), height: em(d), borderRadius: '50%' });

// 글자 o 위에 같은 색 원을 얹어 1px 어긋나도 보이지 않는다. 크기는 Hero의 .eye, .pupil과 같다
function Eye({ x }: { x: number }) {
  return (
    <div style={{ ...disc(.546), position: 'absolute', left: em(x - .273), top: em(.268), display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: token('brand') }}>
      <div style={{ ...disc(.266), position: 'relative', display: 'flex', backgroundColor: token('white') }}>
        <div style={{ ...disc(.15), position: 'absolute', left: em(.058), top: em(.108), display: 'flex', backgroundColor: token('ink-900') }}>
          <div style={{ ...disc(.054), position: 'absolute', left: em(.03), top: em(.024), backgroundColor: token('white') }} />
        </div>
      </div>
    </div>
  );
}

// 공유 미리보기 이미지. 로고 글자, 날짜, 후킹, 정의 문장을 담는다(PLAN '메타 태그')
export default function Image() {
  const mode = ctaMode();
  const [lead, ...rest] = COPY.hero.hook[mode].split(' ');
  const playful = mode === 'waitlist';   // 오픈 후 문구는 승인 전이라 눈 없이 두 단어만 쓴다. TODO(live-hook)
  return new ImageResponse(
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 48, fontFamily: 'Pretendard',
      background: `radial-gradient(70% 80% at 50% 45%, ${token('cream')} 45%, ${token('peach')} 100%)` }}>
      <div style={{ display: 'flex', alignItems: 'center', height: 56, fontSize: 56, fontWeight: 800, lineHeight: 1 }}>
        {/* TODO(logo): 로고 SVG가 오면 이 글자를 바꾼다 */}
        <div style={{ letterSpacing: '-.02em', color: token('brand') }}>{COMPANY.brandName}</div>
        <div style={{ width: 2, height: 36, marginLeft: 32, marginRight: 32, backgroundColor: token('brand'), opacity: .45 }} />
        <div style={{ color: token('ink-900') }}>{launchDotted()}</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 16, fontSize: HOOK, letterSpacing: '-.035em', lineHeight: .9 }}>
        <div style={{ fontWeight: 300, color: token('ink-900') }}>{lead}</div>
        <div style={{ position: 'relative', display: 'flex', marginTop: -4, fontWeight: 900, color: token('brand') }}>
          {rest.join(' ')}
          {playful ? EYES.map((x) => <Eye key={x} x={x} />) : null}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 32, fontSize: 40, fontWeight: 800, letterSpacing: '-.01em', lineHeight: 1.35, color: token('ink-600') }}>
        {SITE.definition.split(/(?<=,)\s+/).map((line) => <div key={line} style={{ whiteSpace: 'nowrap' }}>{line}</div>)}
      </div>
    </div>,
    {
      ...size,
      fonts: [
        { name: 'Pretendard', data: light, weight: 300, style: 'normal' },
        { name: 'Pretendard', data: extraBold, weight: 800, style: 'normal' },
        { name: 'Pretendard', data: black, weight: 900, style: 'normal' },
      ],
    },
  );
}
