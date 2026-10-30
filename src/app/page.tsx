import { Film } from '@/components/Film';
import { Hero } from '@/components/Hero';
import { RevealArmer } from '@/components/RevealArmer';
import { SoundBuddy } from '@/components/SoundBuddy';
import { VideoProvider } from '@/components/VideoProvider';
import { HAS_SOUND } from '@/content/media';
import { COPY } from '@/content/site';

// 섹션은 단계별로 채운다: 2단계 Hero·Film, 3단계 Intro·Zone, 4단계 Faq, 5단계 CtaSection
export default function Home() {
  return (
    <VideoProvider>
      <main id="main" tabIndex={-1} className="outline-none">
        <Hero />
        <Film />
      </main>
      {HAS_SOUND ? <SoundBuddy copy={COPY.sound} /> : null}
      <RevealArmer />
    </VideoProvider>
  );
}
