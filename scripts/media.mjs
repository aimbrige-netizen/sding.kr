// 사진 원본을 사이트용 AVIF(q60)와 WebP(q82)로 미리 줄인다(PLAN '미디어 슬롯 사양'). 손으로 실행하고 빌드에는 들어가지 않는다.
//   node scripts/media.mjs <원본 폴더> [--preview | --licensed]   원본 폴더의 사진을 아래 JOBS대로 자르고 줄인다. 기본은 --preview다.
//                                                                 2026-11-13부터 preview 작업이 없어 보통은 --licensed로 실행한다
//   node scripts/media.mjs --verify                              src/content/media.ts가 가리키는 파일과 git 상태를 확인한다
// 원본(마스터)은 git 밖의 docs/private/media-masters/에 바이트 그대로 둔다. 다시 인코딩하면 C2PA 서명이 빠지기 때문이다.
// 무료 요금제 사진은 상업적으로 쓸 수 없어 public/media/preview/(git 제외)에만 쓴다. 로컬 커밋도 하지 않는다.
// --licensed는 유료 요금제로 만든 사진만 public/media/에 쓴다. 이 파일들은 커밋된다.
// 원본이나 크롭을 바꾸면 버전(v1 → v2)을 올린다. /media/*는 1년 immutable 캐시라 같은 이름으로 덮어쓰면 방문자 브라우저에 옛 파일이 남는다
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, statSync } from 'node:fs';
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
  // 힉스필드 Ultra 요금제 원본 2752x1536, 1792x2400(2026-11-12). git 밖의 docs/private/media-masters/higgsfield/manifest.json에 job id와 해시가 있다.
  // 낮춘 품질은 100% 확대 비교에서 얼굴 차이가 없었고, 웨딩홀 2560의 꽃잎 결만 조금 부드러워졌다(2026-11-13)
  { out: 'hero-d.v2', src: '01-hero-b.png', extract: [21, 0, 2731, 1536], widths: [1280, 1920, 2560],
    byWidth: { 2560: { quality: { avif: 52, webp: 76 } } }, budget: { avif: 50 * KB, webp: 64 * KB } },   // LCP
  { out: 'hero-m.v2', src: '01-hero-b.png', extract: [1310, 0, 1229, 1536], widths: [640, 960, 1152],
    byWidth: { 960: { quality: { avif: 55, webp: 78 } }, 1152: { quality: { avif: 50, webp: 72 } } }, budget: { avif: 40 * KB, webp: 50 * KB } },   // 폰 LCP
  { out: 'price-d.v2', src: '02-price-b.png', extract: [21, 0, 2731, 1536], widths: [1280, 1920, 2560], budget: { avif: 120 * KB, webp: 120 * KB } },
  { out: 'price-m.v2', src: '02-price-b.png', extract: [606, 0, 2048, 1536], widths: [640, 960, 1280], budget: { avif: 120 * KB, webp: 120 * KB } },
  { out: 'planner-d.v2', src: '03-planner-c.png', extract: [494, 0, 1382, 1536], widths: [960, 1296],
    byWidth: { 1296: { quality: { avif: 55, webp: 72 }, budget: { webp: 140 * KB } } }, budget: { avif: 120 * KB, webp: 120 * KB } },
  { out: 'planner-m.v2', src: '03-planner-c.png', extract: [660, 0, 1229, 1536], widths: [640, 960, 1152],
    byWidth: { 960: { quality: { webp: 80 } }, 1152: { quality: { webp: 74 } } }, budget: { avif: 120 * KB, webp: 120 * KB } },
  { out: 'dress-before.v1', src: '04-dress-before-a.png', extract: [0, 11, 1792, 2389], widths: [480, 720, 960, 1224], budget: { avif: 200 * KB, webp: 200 * KB } },
  { out: 'dress-after.v1', src: '05-dress-after-a.png', extract: [0, 11, 1792, 2389], widths: [480, 720, 960, 1224], budget: { avif: 200 * KB, webp: 200 * KB } },
  { out: 'hall.v1', src: '06-hall-a.png', extract: [13, 0, 2731, 1536], widths: [960, 1280, 1920, 2560],
    byWidth: { 1920: { quality: { avif: 55, webp: 72 }, budget: { webp: 160 * KB } }, 2560: { quality: { avif: 43, webp: 72 }, budget: { webp: 250 * KB } } },
    budget: { avif: 120 * KB, webp: 120 * KB } },
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
  const jobs = JOBS.filter((job) => Boolean(job.preview) !== licensed);
  if (!jobs.length) fail(licensed ? '--licensed로 만들 작업이 없다. 유료 요금제 원본의 작업을 JOBS에 먼저 더한다.' : '--preview로 만들 작업이 없다.');
  for (const job of jobs) {
    if (!existsSync(join(masters, job.src))) fail(`원본이 없다: ${join(masters, job.src)}`);
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
  const { MEDIA } = await jiti.import('../src/content/media.ts');

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

  if (problems.length) fail(`media --verify 실패\n- ${problems.join('\n- ')}`);
  console.log(`media --verify 통과: 커밋되는 파일 ${checked}개 확인, public/media/preview/는 git 제외이고 추적되는 파일이 없다.`);
}
