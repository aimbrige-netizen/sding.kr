import type { Metadata } from 'next';
import { LegalPage } from '@/components/LegalPage';
import { LEGAL } from '@/content/legal';

export const metadata: Metadata = { title: LEGAL.privacy.metaTitle, description: LEGAL.privacy.description };

export default function Privacy() {
  return <LegalPage doc={LEGAL.privacy} />;
}
