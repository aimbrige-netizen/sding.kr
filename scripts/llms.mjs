// 빌드 직전에 public/llms.txt를 만든다. 서버 코드를 늘리지 않으려고 라우트로 만들지 않는다(PLAN 'llms.txt')
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createJiti } from 'jiti';

const src = fileURLToPath(new URL('../src', import.meta.url));
const jiti = createJiti(import.meta.url, { alias: { '@': src } });
const { llmsText } = await jiti.import('../src/lib/llms.ts');

writeFileSync(new URL('../public/llms.txt', import.meta.url), llmsText());
