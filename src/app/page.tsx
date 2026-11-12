import { CtaSection } from '@/components/CtaSection';
import { DressScene } from '@/components/DressScene';
import { Faq } from '@/components/Faq';
import { HallScene } from '@/components/HallScene';
import { Hero } from '@/components/Hero';
import { PlannerScene } from '@/components/PlannerScene';
import { PriceScene } from '@/components/PriceScene';
import { VideoProvider } from '@/components/VideoProvider';
import { graph } from '@/lib/jsonld';

// 한 페이지 랜딩(PLAN '페이지 구조'). 히어로, 기능 4개, FAQ, 마지막 CTA 순서다
export default function Home() {
  return (
    <VideoProvider>
      <main id="main" tabIndex={-1} className="outline-none">
        <Hero />
        <PriceScene />
        <PlannerScene />
        <DressScene />
        <HallScene />
        <Faq />
        <CtaSection />
      </main>
      {/* 히어로(LCP)가 HTML 앞쪽에 오도록 main 뒤에 둔다. <를 유니코드로 바꿔 값 안의 글자가 script를 닫지 못하게 한다(PLAN '구조화 데이터') */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(graph()).replace(/</g, '\\u003c') }} />
    </VideoProvider>
  );
}
