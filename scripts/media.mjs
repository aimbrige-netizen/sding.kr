// 사진 원본을 사이트용 AVIF(q60)와 WebP(q82)로 미리 줄인다(PLAN '미디어 슬롯 사양'). 손으로 실행하고 빌드에는 들어가지 않는다.
//   node scripts/media.mjs <원본 폴더> [--preview | --licensed] [--only=이름,이름]
//                                                                 원본 폴더의 사진을 아래 JOBS대로 자르고 줄인다. 기본은 --preview다.
//                                                                 2026-11-13부터 preview 작업이 없어 보통은 --licensed로 실행한다.
//                                                                 --licensed는 VIDEOS(영상 원본 바이트 복사)와 POSTERS(영상 첫 프레임)도 만든다.
//                                                                 --only는 out 이름이 맞는 작업만 한다(이미 커밋된 파일을 다시 쓰지 않을 때)
//   node scripts/media.mjs --verify                              src/content/media.ts가 가리키는 파일과 git 상태를 확인한다
// 원본(마스터)은 git 밖의 docs/private/media-masters/에 바이트 그대로 둔다. 다시 인코딩하면 C2PA 서명이 빠지기 때문이다.
// 무료 요금제 사진은 상업적으로 쓸 수 없어 public/media/preview/(git 제외)에만 쓴다. 로컬 커밋도 하지 않는다.
// --licensed는 유료 요금제로 만든 사진만 public/media/에 쓴다. 이 파일들은 커밋된다.
// 원본이나 크롭을 바꾸면 버전(v1 → v2)을 올린다. /media/*는 1년 immutable 캐시라 같은 이름으로 덮어쓰면 방문자 브라우저에 옛 파일이 남는다
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const PREVIEW_DIR = join(ROOT, 'public', 'media', 'preview');
const LICENSED_DIR = join(ROOT, 'public', 'media');
const KB = 1000;

// 인코딩 작업. extract는 원본에서 자르는 자리(left, top, width, height, 원본 픽셀)다.
// preview: 무료 요금제 사진. --preview로만 만든다. budget은 파일 하나의 상한(바이트)이다.
// 품질은 AVIF q60, WebP q82다. 이 품질로 상한을 넘는 폭만 byWidth에서 품질을 낮춘다(PLAN '미디어 슬롯 사양').
// WebP는 AVIF를 못 읽는 옛 브라우저의 대체 파일이다. 큰 폭의 WebP가 q72에서도 상한을 넘으면 그 폭의 WebP 상한만 올린다
// 원본 PNG에 힉스필드의 hf-job-id 글 조각이 있으면 사이트 파일의 XMP dc:source로 옮긴다. 출처 표시를 지우지 않는다(힉스필드 이용약관 5.5)
const JOBS = [
  // 무료 요금제(Fish Audio) 미리보기 작업(hero/price/planner v1)은 2026-11-13에 힉스필드 사진으로 바꾸며 지웠다.
  // 힉스필드 Ultra 요금제 원본 2752x1536, 1792x2400(2026-11-12 UTC). git 밖의 docs/private/media-masters/higgsfield/manifest.json에 job id와 해시가 있다.
  // 낮춘 품질은 100% 확대 비교에서 얼굴 차이가 없었고, 웨딩홀 2560의 꽃잎 결만 조금 부드러워졌다(2026-11-13)
  { out: 'hero-d.v2', src: '01-hero-b.png', extract: [21, 0, 2731, 1536], widths: [1280, 1920, 2560],
    byWidth: { 2560: { quality: { avif: 52, webp: 76 } } }, budget: { avif: 50 * KB, webp: 64 * KB } },   // 데스크톱 첫 화면
  { out: 'price-d.v2', src: '02-price-b.png', extract: [21, 0, 2731, 1536], widths: [1280, 1920, 2560], budget: { avif: 120 * KB, webp: 120 * KB } },
  { out: 'dress-before.v1', src: '04-dress-before-a.png', extract: [0, 11, 1792, 2389], widths: [480, 720, 960, 1224], budget: { avif: 200 * KB, webp: 200 * KB } },
  { out: 'dress-after.v1', src: '05-dress-after-a.png', extract: [0, 11, 1792, 2389], widths: [480, 720, 960, 1224], budget: { avif: 200 * KB, webp: 200 * KB } },

  // v2.2(시안 A '장면형 시네마', 2026-11-13). 상자는 시안의 크롭 상자를 파일의 정확한 비율로 맞춘 값이다(PLAN '미디어 슬롯 사양').
  // 가장 큰 폭은 상자 폭을 넘지 않는다(늘려 그리지 않는다). v2.1의 hero-m.v2, price-m.v2, planner-d.v2, planner-m.v2, hall.v1은 쓰지 않아 지웠다.
  // 장면 사진: 데스크톱 16:9 풀블리드(sticky), 폰 크롭
  { out: 'hero-m.v3', src: '01-hero-b.png', extract: [1417, 0, 1024, 1536], widths: [640, 960, 1024],
    byWidth: { 960: { quality: { avif: 52, webp: 72 } }, 1024: { quality: { avif: 48, webp: 62 } } }, budget: { avif: 40 * KB, webp: 50 * KB } },   // 2/3. 폰 LCP
  { out: 'price-m.v3', src: '02-price-b.png', extract: [1670, 110, 1080, 1350], widths: [640, 960, 1080], budget: { avif: 120 * KB, webp: 120 * KB } },   // 4/5 옷걸이
  // 플래너와 웨딩홀 데스크톱은 결이 많아 큰 두 폭의 AVIF 품질을 낮추고, WebP는 q72에서도 넘어 그 폭의 WebP 상한만 올렸다(v2.1과 같은 규칙)
  { out: 'planner-d.v3', src: '03-planner-c.png', extract: [10, 0, 2731, 1536], widths: [1280, 1920, 2560],
    byWidth: { 1920: { quality: { avif: 54, webp: 72 }, budget: { webp: 170 * KB } }, 2560: { quality: { avif: 42, webp: 72 }, budget: { webp: 290 * KB } } },
    budget: { avif: 120 * KB, webp: 120 * KB } },
  { out: 'planner-m.v3', src: '03-planner-c.png', extract: [560, 0, 1229, 1536], widths: [640, 960, 1152],
    byWidth: { 960: { quality: { webp: 78 } }, 1152: { quality: { webp: 72 } } }, budget: { avif: 120 * KB, webp: 120 * KB } },
  // 폰 드레스 비교: 쌍 A를 두 장 같은 상자로 머리부터 무릎 아래까지(3/5). 쌍 B는 AI 사진의 미소가 바뀌어 쓰지 않는다
  { out: 'dress-before-m.v1', src: '04-dress-before-a.png', extract: [399, 190, 1032, 1720], widths: [480, 720, 960], budget: { avif: 120 * KB, webp: 120 * KB } },
  { out: 'dress-after-m.v1', src: '05-dress-after-a.png', extract: [399, 190, 1032, 1720], widths: [480, 720, 960], budget: { avif: 120 * KB, webp: 120 * KB } },
  { out: 'hall-d.v1', src: '06-hall-c.png', extract: [10, 0, 2731, 1536], widths: [1280, 1920, 2560],   // 데스크톱 고정 사진(다른 홀)
    byWidth: { 1920: { quality: { avif: 57, webp: 72 }, budget: { webp: 130 * KB } }, 2560: { quality: { avif: 46, webp: 72 }, budget: { webp: 230 * KB } } },
    budget: { avif: 120 * KB, webp: 120 * KB } },
  { out: 'final-d.v1', src: '01-hero-c.png', extract: [10, 0, 2731, 1536], widths: [1280, 1920, 2560], budget: { avif: 120 * KB, webp: 120 * KB } },
  // 폰 신청 사진은 6:5 상자(cta.css)에 보이는 자리만 자른다(v1은 4:5 [1300, 0, 1229, 1536]이라 3분의 1이 보이지 않았다)
  { out: 'final-m.v2', src: '01-hero-c.png', extract: [1302, 61, 1224, 1020], widths: [640, 960, 1152], budget: { avif: 120 * KB, webp: 120 * KB } },
  // 첫 화면 장면 목차의 작은 사진(4/3, 112x84로 보인다)
  { out: 'idx-price.v1', src: '02-price-b.png', extract: [2230, 290, 320, 240], widths: [224, 320], budget: { avif: 20 * KB, webp: 20 * KB } },
  { out: 'idx-planner.v1', src: '03-planner-c.png', extract: [860, 140, 800, 600], widths: [224, 448],
    byWidth: { 448: { quality: { webp: 78 } } }, budget: { avif: 20 * KB, webp: 20 * KB } },
  { out: 'idx-dress.v1', src: '05-dress-after-b.png', extract: [560, 860, 680, 510], widths: [224, 448],
    byWidth: { 448: { quality: { avif: 56, webp: 72 } } }, budget: { avif: 20 * KB, webp: 20 * KB } },   // 몸판만, 얼굴 없음
  { out: 'idx-hall.v1', src: '06-hall-c.png', extract: [1180, 90, 400, 300], widths: [224, 400], budget: { avif: 20 * KB, webp: 20 * KB } },
  // 디테일 컷. 거의 원본 크기(1x)라 더 선명한 원본이 오면 바꾼다(OPEN_ITEMS)
  { out: 'price-lace.v1', src: '02-price-a.png', extract: [809, 197, 408, 510], widths: [320, 408], budget: { avif: 60 * KB, webp: 60 * KB } },   // 4/5
  { out: 'price-bouquet.v1', src: '02-price-a.png', extract: [1228, 390, 528, 660], widths: [320, 528], budget: { avif: 60 * KB, webp: 60 * KB } },
  { out: 'price-ring.v1', src: '02-price-a.png', extract: [1805, 610, 360, 450], widths: [320, 360], budget: { avif: 60 * KB, webp: 60 * KB } },
  { out: 'price-cards.v1', src: '02-price-a.png', extract: [2180, 560, 480, 600], widths: [320, 480], budget: { avif: 60 * KB, webp: 60 * KB } },
  { out: 'planner-note.v1', src: '03-planner-c.png', extract: [1180, 1176, 880, 360], widths: [440, 880], budget: { avif: 60 * KB, webp: 60 * KB } },   // 22/9
  { out: 'planner-tulips.v1', src: '03-planner-c.png', extract: [2110, 790, 640, 560], widths: [420, 640], budget: { avif: 60 * KB, webp: 60 * KB } },   // 8/7
  { out: 'dress-top-before.v1', src: '04-dress-before-a.png', extract: [302, 631, 1196, 468], widths: [600, 1196], budget: { avif: 80 * KB, webp: 80 * KB } },   // 23/9, 두 장 같은 상자
  { out: 'dress-top-after.v1', src: '05-dress-after-a.png', extract: [302, 631, 1196, 468], widths: [600, 1196], budget: { avif: 80 * KB, webp: 80 * KB } },
  { out: 'dress-hem-before.v1', src: '04-dress-before-a.png', extract: [302, 1931, 1196, 468], widths: [600, 1196], budget: { avif: 80 * KB, webp: 80 * KB } },
  { out: 'dress-hem-after.v1', src: '05-dress-after-a.png', extract: [302, 1931, 1196, 468], widths: [600, 1196], budget: { avif: 80 * KB, webp: 80 * KB } },
  { out: 'hall-chandelier.v1', src: '06-hall-a.png', extract: [678, 19, 583, 318], widths: [420, 583], budget: { avif: 60 * KB, webp: 60 * KB } },   // 11/6, 걷는 영상의 홀
  { out: 'hall-aisle.v1', src: '06-hall-a.png', extract: [638, 999, 924, 504], widths: [420, 924], budget: { avif: 60 * KB, webp: 60 * KB } },
];

// 영상은 다시 인코딩하지 않고 원본 바이트를 그대로 복사한다(--licensed). 힉스필드 원본의 C2PA 매니페스트(맨 앞 uuid 상자)가 남는다.
// 그래서 faststart가 아니고(moov가 끝에 있다) 길이도 원본 그대로다(PLAN 변경 기록 v2.2). 크기와 해시가 manifest.json과 같아야 쓴다
const VIDEOS = [
  { out: 'hall-walk.v1.mp4', src: '07-hall-walk.mp4', bytes: 3996936, sha256: '881036a643aadb1b53ac1831aefb6279bf9dfd452f1e3dd7b50e014be55106e4', budget: 5 * 1000 * KB },
];

// 영상 포스터: 첫 프레임을 ffmpeg로 PNG에 뽑아 sharp로 WebP를 만든다. 동작 줄이기의 정지 화면도 이 그림이다.
// 영상 원본에는 PNG 글 조각이 없어 job id(manifest.json)를 직접 적는다.
// 영상에 색 정보(color_space 등)가 없으면 ffmpeg는 BT.601로, Chrome은 BT.709로 푼다. 포스터를 BT.709로 풀어야 포스터가 걷힐 때 색이 바뀌지 않는다(v1은 BT.601)
const POSTERS = [
  { out: 'hall-walk-poster.v2', video: '07-hall-walk.mp4', matrix: 'bt709', source: 'higgsfield:job:9fbb5645-ca5e-4c79-bb82-f33c56db28b9', widths: [1280], budget: { webp: 120 * KB } },
];

// AI로 만든 이미지라는 표시(IPTC DigitalSourceType)와 원본의 출처(dc:source). 원본의 C2PA 서명을 대신하지는 않는다
const xmp = (source) => '<?xpacket begin="﻿" id="W5M0MpCehiHzreSzNTczkc9d"?>'
  + '<x:xmpmeta xmlns:x="adobe:ns:meta/"><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">'
  + '<rdf:Description rdf:about="" xmlns:Iptc4xmpExt="http://iptc.org/std/Iptc4xmpExt/2008-02-29/" xmlns:dc="http://purl.org/dc/elements/1.1/">'
  + '<Iptc4xmpExt:DigitalSourceType>http://cv.iptc.org/newscodes/digitalsourcetype/trainedAlgorithmicMedia</Iptc4xmpExt:DigitalSourceType>'
  + (source ? `<dc:source>${source}</dc:source>` : '')
  + '</rdf:Description></rdf:RDF></x:xmpmeta><?xpacket end="r"?>';

const fail = (message) => {
  console.error(message);
  process.exit(1);
};
const git = (...args) => spawnSync('git', args, { cwd: ROOT, encoding: 'utf8' });
const previewIgnored = () => git('check-ignore', '-q', 'public/media/preview/probe.avif').status === 0;

const args = process.argv.slice(2);
if (args.includes('--verify')) await verify();
else await encode();

async function encode() {
  const licensed = args.includes('--licensed');
  if (licensed && args.includes('--preview')) fail('--preview와 --licensed는 함께 쓸 수 없다.');
  const dir = args.find((a) => !a.startsWith('--'));
  if (!dir) fail('사용법: node scripts/media.mjs <원본 폴더> [--preview | --licensed], node scripts/media.mjs --verify');
  const masters = resolve(process.cwd(), dir);

  // 무료 요금제 사진은 git이 무시하는 폴더에만 쓴다. 무시되지 않으면 아무것도 쓰지 않고 멈춘다
  if (!licensed && !previewIgnored()) fail('public/media/preview/가 .gitignore에 없다. 아무것도 쓰지 않고 멈춘다.');
  // --only=이름,이름: 그 out 이름의 작업만 한다. 이미 커밋된 파일을 같은 이름으로 다시 쓰지 않을 때 쓴다
  const only = args.find((a) => a.startsWith('--only='))?.slice('--only='.length).split(',').filter(Boolean);
  const wanted = (out) => !only || only.includes(out);
  const jobs = JOBS.filter((job) => Boolean(job.preview) !== licensed && wanted(job.out));
  const videos = licensed ? VIDEOS.filter((v) => wanted(v.out)) : [];
  const posters = licensed ? POSTERS.filter((p) => wanted(p.out)) : [];
  if (only) for (const name of only) if (![...JOBS, ...VIDEOS, ...POSTERS].some((j) => j.out === name)) fail(`--only의 이름이 작업에 없다: ${name}`);
  if (!jobs.length && !videos.length && !posters.length) fail(licensed ? '--licensed로 만들 작업이 없다. 유료 요금제 원본의 작업을 JOBS에 먼저 더한다.' : '--preview로 만들 작업이 없다.');
  for (const src of [...jobs.map((j) => j.src), ...videos.map((v) => v.src), ...posters.map((p) => p.video)]) {
    if (!existsSync(join(masters, src))) fail(`원본이 없다: ${join(masters, src)}`);
  }

  // sharp는 next의 선택 의존성으로만 들어온다. package.json은 바꾸지 않는다
  let sharp;
  try {
    sharp = (await import('sharp')).default;
  } catch {
    fail('sharp를 불러오지 못했다. next 16.4.5의 선택 의존성(sharp ^0.35.5)이 node_modules에 있어야 한다. package.json은 바꾸지 않는다.');
  }
  sharp.cache(false);
  sharp.concurrency(1);   // 2560px AVIF 인코딩은 무겁다. 한 번에 하나씩, 다른 무거운 작업 없이 돌린다

  const outDir = licensed ? LICENSED_DIR : PREVIEW_DIR;
  mkdirSync(outDir, { recursive: true });
  if (licensed) console.log('--licensed: public/media/에 쓰는 파일은 커밋된다. 유료 요금제로 만든 원본인지 다시 확인한다.');

  const over = [];
  let count = 0;
  for (const job of jobs) {
    // 힉스필드 원본의 job id(PNG 글 조각). 16진수와 -만 받아 XMP에 그대로 넣어도 안전하게 한다
    const { comments = [] } = await sharp(join(masters, job.src)).metadata();
    const hf = comments.find((c) => c.keyword === 'hf-job-id')?.text;
    const source = hf && /^[0-9a-f-]{8,64}$/i.test(hf) ? `higgsfield:job:${hf}` : '';
    if (licensed && !source) console.warn(`경고: ${job.src}에 hf-job-id가 없거나 형식이 달라 출처(dc:source) 없이 쓴다`);
    for (const w of job.widths) {
      const o = job.byWidth?.[w] ?? {};
      for (const ext of ['avif', 'webp']) {
        let img = sharp(join(masters, job.src));
        if (job.extract) {
          const [left, top, width, height] = job.extract;
          img = img.extract({ left, top, width, height });
        }
        // 힉스필드 PNG는 RGBA다. 다 불투명한 알파를 빼야 AVIF에 쓸모없는 알파 면이 들어가지 않는다
        img = img.resize(w, null, { kernel: 'lanczos3' }).removeAlpha();
        const q = { avif: 60, webp: 82, ...o.quality };
        img = ext === 'avif' ? img.avif({ quality: q.avif, effort: 4 }) : img.webp({ quality: q.webp, effort: 4 });
        const file = join(outDir, `${job.out}-${w}.${ext}`);
        const info = await img.withXmp(xmp(source)).toFile(file);
        const bytes = statSync(file).size;
        const limit = { ...job.budget, ...o.budget }[ext];
        const flag = bytes > limit ? `  상한 ${limit} 초과` : '';
        if (flag) over.push(file);
        count += 1;
        console.log(`${job.out}-${w}.${ext}\t${info.width}x${info.height}\t${bytes}${flag}`);
      }
    }
  }

  // 영상: 원본 바이트를 그대로 복사한다. 다시 인코딩, 다시 담기(remux), 자르기를 하지 않는다
  for (const v of videos) {
    const from = join(masters, v.src);
    const hash = createHash('sha256').update(readFileSync(from)).digest('hex');
    if (statSync(from).size !== v.bytes || hash !== v.sha256) fail(`영상 원본이 manifest와 다르다(크기 ${statSync(from).size}, sha256 ${hash}): ${from}`);
    const file = join(outDir, v.out);
    copyFileSync(from, file);
    const bytes = statSync(file).size;
    const flag = bytes > v.budget ? `  상한 ${v.budget} 초과` : '';
    if (flag) over.push(file);
    count += 1;
    console.log(`${v.out}\t원본 바이트 복사\t${bytes}${flag}`);
  }

  // 포스터: 첫 프레임(0초)을 무손실 PNG로 뽑아 WebP로 줄인다. ffmpeg는 이 PC에 설치되어 있어야 한다(package.json은 바꾸지 않는다)
  for (const p of posters) {
    const tmp = mkdtempSync(join(tmpdir(), 'sding-poster-'));
    try {
      const png = join(tmp, 'frame0.png');
      // YUV에서 RGB로 바꾸는 행렬을 정해 둔다. format=rgb24가 있어야 이 scale이 변환을 맡는다(없으면 자동으로 붙는 변환이 BT.601을 쓴다)
      const vf = `scale=in_color_matrix=${p.matrix}:out_color_matrix=${p.matrix},format=rgb24`;
      const r = spawnSync('ffmpeg', ['-v', 'error', '-i', join(masters, p.video), '-frames:v', '1', '-vf', vf, '-f', 'image2', '-c:v', 'png', png], { encoding: 'utf8' });
      if (r.error || r.status !== 0 || !existsSync(png)) fail(`ffmpeg로 첫 프레임을 뽑지 못했다: ${r.error?.message || r.stderr}`);
      for (const w of p.widths) {
        const file = join(outDir, `${p.out}-${w}.webp`);
        const info = await sharp(png).resize(w, null, { kernel: 'lanczos3' }).removeAlpha().webp({ quality: 82, effort: 4 }).withXmp(xmp(p.source)).toFile(file);
        const bytes = statSync(file).size;
        const flag = bytes > p.budget.webp ? `  상한 ${p.budget.webp} 초과` : '';
        if (flag) over.push(file);
        count += 1;
        console.log(`${p.out}-${w}.webp\t${info.width}x${info.height}\t${bytes}${flag}`);
      }
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  }
  console.log(`${count}개 파일을 ${outDir}에 썼다.`);
  if (over.length) fail(`상한을 넘은 파일 ${over.length}개: ${over.join(', ')}`);
}

// 커밋되는 파일이 모두 있는지, 무료 요금제 사본이 git에 들어가지 않았는지 확인한다
async function verify() {
  const problems = [];
  if (!previewIgnored()) problems.push('public/media/preview/가 .gitignore에 없다.');
  const tracked = git('ls-files', 'public/media/preview');
  if (tracked.status !== 0) problems.push('git ls-files를 실행하지 못했다.');
  else if (tracked.stdout.trim()) problems.push(`git이 추적하는 미리보기 파일이 있다:\n${tracked.stdout.trim()}`);

  // present()는 라이선스 파일을 fs로 보지 않으므로 커밋에 빠진 파일은 git과 Vercel 빌드에서 깨진 그림이 된다.
  // 그래서 이 PC에 있는지와 함께 git이 추적하는지(스테이징 포함)도 본다
  const listed = git('-c', 'core.quotepath=false', 'ls-files', '-z', 'public');
  if (listed.status !== 0) problems.push('git ls-files public을 실행하지 못했다.');
  const trackedFiles = new Set(listed.stdout.split('\0').filter(Boolean));

  const { createJiti } = await import('jiti');
  const jiti = createJiti(import.meta.url, { alias: { '@': join(ROOT, 'src') } });
  const { MEDIA, DETAILS } = await jiti.import('../src/content/media.ts');

  let checked = 0;
  const need = (rel, id) => {   // rel: 저장소 기준 경로(public/...)
    checked += 1;
    if (!existsSync(join(ROOT, ...rel.split('/')))) problems.push(`MEDIA.${id}: 파일이 없다: ${rel}`);
    else if (!trackedFiles.has(rel)) problems.push(`MEDIA.${id}: git이 추적하지 않는다(git add로 함께 커밋한다): ${rel}`);
  };
  const image = (spec, id) => {
    if (spec.preview || !spec.desktop.file) return;   // 미리보기는 이 PC에만 있고, 빈 슬롯은 포스터 카드를 그린다
    for (const art of [spec.desktop, spec.phone].filter(Boolean)) {
      for (const w of art.widths) for (const ext of ['avif', 'webp']) need(`public/media/${art.file}-${w}.${ext}`, id);
    }
  };
  for (const [id, spec] of Object.entries(MEDIA)) {
    if (spec.kind === 'pair') {
      image(spec.before, id);
      image(spec.after, id);
    } else if (spec.kind === 'image') {
      image(spec, id);
    } else if (spec.kind === 'video' && spec.src) {
      for (const url of [spec.src, spec.srcMobile, spec.poster, spec.captions].filter(Boolean)) {
        if (url.startsWith('/')) need(`public/${url.slice(1)}`, id);
        else console.log(`MEDIA.${id}: 다른 호스트의 주소라 확인하지 않는다: ${url}`);
      }
    }
  }
  // 디테일 컷(v2.2). present()는 라이선스 파일의 디스크를 보지 않아 커밋에서 빠진 컷은 Vercel 빌드에서 깨진 그림이 되므로 여기서 잡는다
  for (const [row, specs] of Object.entries(DETAILS ?? {})) specs.forEach((spec, i) => image(spec, `DETAILS.${row}[${i}]`));
  // 영상은 원본 바이트 그대로여야 한다(다시 인코딩하면 C2PA 매니페스트가 빠진다). 크기와 해시가 VIDEOS와 같은지 본다
  for (const v of VIDEOS) {
    const rel = `public/media/${v.out}`;
    const file = join(ROOT, 'public', 'media', v.out);
    if (!existsSync(file)) continue;   // 쓰는 영상이면 위의 MEDIA 확인이 '파일이 없다'를 낸다
    const hash = createHash('sha256').update(readFileSync(file)).digest('hex');
    if (statSync(file).size !== v.bytes || hash !== v.sha256) problems.push(`${rel}: 원본 바이트와 다르다(크기 ${statSync(file).size}, sha256 ${hash})`);
  }

  if (problems.length) fail(`media --verify 실패\n- ${problems.join('\n- ')}`);
  console.log(`media --verify 통과: 커밋되는 파일 ${checked}개 확인, public/media/preview/는 git 제외이고 추적되는 파일이 없다.`);
}
