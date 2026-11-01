import { ChevronDown } from './Icons';
import { faqFor } from '@/content/faq';
import { COPY } from '@/content/site';
import { ctaMode } from '@/lib/launch';
import { order } from '@/lib/motion';

// 첫 문장이 곧 답이다(PLAN 'FAQ'). 훑어 읽도록 첫 문장만 진하게 보인다. 이어 붙이면 item.a 그대로다
const sentences = (text: string) => text.split(/(?<=[.?!])\s+/);

// FAQ(#faq). 여닫기는 details가 맡아 JS 없이 동작하고, 답은 닫혀 있어도 HTML에 있다
export function Faq() {
  return (
    <section id="faq" aria-labelledby="faq-title" className="faq">
      <div className="faq-in">
        <h2 id="faq-title" tabIndex={-1} className="zone-title faq-title" data-reveal style={order(0)}>{COPY.faq.title}</h2>
        <ul className="faq-list" data-reveal style={order(1)}>
          {faqFor(ctaMode()).map((item) => {
            const [lead, ...rest] = sentences(item.a);
            return (
              <li key={item.id}>
                <details className="faq-item">
                  <summary className="faq-q">
                    {/* flex는 제목에 건다. summary가 display를 따르는지에 기대지 않는다 */}
                    <h3 className="faq-row">
                      <span className="faq-text">{item.q}</span>
                      <span className="faq-mark"><ChevronDown /></span>
                    </h3>
                  </summary>
                  <p className="faq-a"><strong>{lead}</strong>{rest.length ? ` ${rest.join(' ')}` : null}</p>
                </details>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
