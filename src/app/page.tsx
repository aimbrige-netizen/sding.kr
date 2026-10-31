import { AnchorFocus } from '@/components/AnchorFocus';
import { CtaSection } from '@/components/CtaSection';
import { Faq } from '@/components/Faq';
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
import { graph } from '@/lib/jsonld';

export default function Home() {
  return (
    <VideoProvider>
      {/* <를 유니코드로 바꿔 값 안의 글자가 script를 닫지 못하게 한다(PLAN '구조화 데이터') */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(graph()).replace(/</g, '\\u003c') }} />
      <main id="main" tabIndex={-1} className="outline-none">
        <Hero />
        <Film />
        <Intro />
        <div className="zone-run">
          <ProgressDots items={ZONES.map((zone) => ({ id: zone.id, label: zoneLabel(zone) }))} label={COPY.zones.nav} />
          {ZONES.map((zone, i) => <Zone key={zone.id} zone={zone} flip={i % 2 === 1} />)}
        </div>
        <Faq />
        <CtaSection />
      </main>
      {HAS_SOUND ? <SoundBuddy copy={COPY.sound} /> : null}
      <RevealArmer />
      <AnchorFocus />
    </VideoProvider>
  );
}
