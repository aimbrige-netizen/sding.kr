import type { CSSProperties } from 'react';

// 등장 순서. 80ms 간격으로 올라온다(PLAN '모션')
export const order = (i: number) => ({ '--i': i }) as CSSProperties;
