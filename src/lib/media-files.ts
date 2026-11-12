// 미디어 파일이 있는지 빌드할 때 정한다(PLAN '미디어 슬롯 사양'). 서버 컴포넌트만 이 파일을 불러온다.
// 무료 요금제 사진(preview)은 이 PC의 public/media/preview/(git 제외)에만 있다. Vercel에서는 보지 않으므로 git에서 만든 빌드는 포스터 카드다.
// 라이선스가 있는 파일은 커밋되므로 fs를 보지 않는다. /는 ISR이라 재생성 때 public/가 함수 안에 없을 수 있다(scripts/media.mjs --verify가 대신 확인한다).
// MEDIA_PREVIEW=off면 이 PC에서도 포스터 상태로 빌드한다(검증용). next build와 next start에 같은 값을 준다
import 'server-only';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { FEATURES } from '@/content/features';
import { MEDIA, type Art, type MediaId, type MediaSpec } from '@/content/media';
import { COPY } from '@/content/site';

const PREVIEW_DIR = join(process.cwd(), 'public', 'media', 'preview');   // 앞부분을 고정해 파일 추적이 public 전체로 번지지 않게 한다
const PREVIEW_ON = !process.env.VERCEL && process.env.MEDIA_PREVIEW !== 'off';
const names = (a: Art) => a.widths.flatMap((w) => [`${a.file}-${w}.avif`, `${a.file}-${w}.webp`]);

// 그릴 파일이 모두 있는지. 너비나 형식이 하나라도 빠지면 없는 것으로 보고 포스터 카드를 그린다
export function present(spec: MediaSpec): boolean {
  if (spec.kind === 'pair') return present(spec.before) && present(spec.after);
  if (spec.kind === 'video') return Boolean(spec.src);
  if (!spec.desktop.file) return false;
  if (!spec.preview) return true;
  const arts = spec.phone ? [spec.desktop, spec.phone] : [spec.desktop];
  return PREVIEW_ON && arts.every((a) => names(a).every((n) => existsSync(join(PREVIEW_DIR, n))));
}

const isAi = (spec: MediaSpec) => (spec.kind === 'pair' ? spec.before.ai || spec.after.ai : spec.ai);

// 미디어 바로 아래 한 줄(PLAN 'AI 서비스 고지'). 파일이 없으면 포스터 고지(없으면 빈 값), 있으면 기능 고지나 AI 예시 캡션이다
export function noteFor(id: MediaId): string {
  const spec = MEDIA[id] as MediaSpec;
  const feature = FEATURES.find((f) => f.id === id);
  if (!present(spec)) return feature?.posterNotice ?? '';
  if (feature?.notice) return feature.notice;
  return isAi(spec) ? COPY.media.aiCaption : '';
}
