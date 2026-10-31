import { AnchorFocus } from '@/components/AnchorFocus';
import { Film } from '@/components/Film';
import { Hero } from '@/components/Hero';
import { Intro } from '@/components/Intro';
import { ProgressDots } from '@/components/ProgressDots';
import { RevealArmer } from '@/components/RevealArmer';
import { SoundBuddy } from '@/components/SoundBuddy';
import { VideoProvider } from '@/components/VideoProvider';
import { Zone } from '@/components/Zone';
import { HAS_SOUND } from '@/content/media';
import { COPY } from '@/content/site';
import { ZONES, zoneLabel } from '@/content/zones';

// 섹션은 단계별로 채운다: 2단계 Hero·Film, 3단계 Intro·Zone, 4단계 Faq, 5단계 CtaSection
export default function Home() {
  return (
    <VideoProvider>
      <main id="main" tabIndex={-1} className="outline-none">
        <Hero />
        <Film />
        <Intro />
        <div className="zone-run">
          <ProgressDots items={ZONES.map((zone) => ({ id: zone.id, label: zoneLabel(zone) }))} label={COPY.zones.nav} />
          {ZONES.map((zone, i) => <Zone key={zone.id} zone={zone} flip={i % 2 === 1} />)}
        </div>
      </main>
      {HAS_SOUND ? <SoundBuddy copy={COPY.sound} /> : null}
      <RevealArmer />
      <AnchorFocus />
    </VideoProvider>
  );
}
