// 임시 아이콘을 만든다. --brand 바탕에 흰 '스'(Pretendard 800)다(PLAN '아이콘과 공유 이미지').
// 손으로 실행하고(node scripts/icons.mjs) 빌드에는 들어가지 않는다. 결과 파일은 커밋한다.
// TODO(logo): 로고 원본이 오면 이 스크립트의 윤곽과 결과 파일을 바꾼다
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import sharp from 'sharp';

const root = new URL('..', import.meta.url);
const css = readFileSync(new URL('src/styles/tokens.css', root), 'utf8');
const token = (name) => css.match(new RegExp(`--${name}:\\s*(#[0-9A-Fa-f]{6})`))[1];

// 16 격자의 '스' 윤곽. 글자 크기 16 그대로면 획 끝이 픽셀 경계에 와서 16px 탭에서도 읽힌다
const MARK = 'M9.117 3.006Q9.11 4.053 9.661 5.06Q10.211 6.068 11.348 6.822Q12.485 7.577 14.148 7.85L13.164 9.709Q11.297 9.357 9.961 8.412Q8.625 7.467 7.914 6.107Q7.195 7.459 5.856 8.405Q4.515 9.35 2.664 9.709L1.711 7.85Q3.336 7.568 4.461 6.807Q5.586 6.045 6.144 5.041Q6.703 4.037 6.711 3.006L6.711 2.006L9.117 2.006L9.117 3.006ZM14.555 13.834L1.445 13.834L1.445 11.99L14.555 11.99Z';

const svg = ({ size, rx = 0, s = size / 16, tx = 0, ty = 0 }) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">` +
  `<rect width="${size}" height="${size}" rx="${rx}" fill="${token('brand')}"/>` +
  `<path transform="translate(${tx} ${ty}) scale(${s})" fill="${token('white')}" d="${MARK}"/></svg>`;

const png = (spec) => sharp(Buffer.from(svg(spec))).png({ compressionLevel: 9 }).toBuffer();

// PNG를 그대로 담는 ICO. 머리 6바이트, 항목마다 16바이트, 그 뒤에 PNG가 차례로 온다
function ico(images) {
  const head = Buffer.alloc(6 + 16 * images.length);
  head.writeUInt16LE(1, 2);
  head.writeUInt16LE(images.length, 4);
  let offset = head.length;
  images.forEach(({ size, data }, i) => {
    const at = 6 + 16 * i;
    head[at] = size;
    head[at + 1] = size;
    head.writeUInt16LE(1, at + 4);
    head.writeUInt16LE(32, at + 6);
    head.writeUInt32LE(data.length, at + 8);
    head.writeUInt32LE(offset, at + 12);
    offset += data.length;
  });
  return Buffer.concat([head, ...images.map(({ data }) => data)]);
}

const write = (path, data) => writeFileSync(new URL(path, root), data);

mkdirSync(new URL('public/icons/', root), { recursive: true });
write('src/app/icon.svg', `<!-- TODO(logo): 임시 아이콘. scripts/icons.mjs가 만든다 -->\n${svg({ size: 16, rx: 3 })}\n`);
write('src/app/favicon.ico', ico(await Promise.all(
  [[16, 3], [32, 6], [48, 9]].map(async ([size, rx]) => ({ size, data: await png({ size, rx }) })),
)));
write('src/app/apple-icon.png', await png({ size: 180, s: 8.1, tx: 25.2, ty: 20.79 }));
write('public/icons/icon-192.png', await png({ size: 192, rx: 42, s: 8.64, tx: 26.88, ty: 22.18 }));
write('public/icons/icon-512.png', await png({ size: 512, rx: 113, s: 23.04, tx: 71.68, ty: 59.15 }));
write('public/icons/maskable-512.png', await png({ size: 512, s: 20.48, tx: 92.16, ty: 81.02 }));   // 먼 획이 중심에서 33.7%라 안전 영역(40%) 안이다
