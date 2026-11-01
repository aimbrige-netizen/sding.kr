import type { Metadata } from 'next';
import { LegalPage } from '@/components/LegalPage';
import { LEGAL } from '@/content/legal';

export const metadata: Metadata = { title: LEGAL.terms.metaTitle, description: LEGAL.terms.description };

export default function Terms() {
  return <LegalPage doc={LEGAL.terms} />;
}
