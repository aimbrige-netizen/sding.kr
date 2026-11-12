import { Plus } from './Icons';
import { faqFor } from '@/content/faq';
import { COPY } from '@/content/site';
import { ctaMode } from '@/lib/launch';

// FAQ(#faq, PLAN 'FAQ'). 여닫기는 details가 맡아 JS 없이 동작하고, 답은 닫혀 있어도 HTML에 있다.
// 첫 질문은 처음부터 펼쳐 정의 문장이 누르지 않아도 보인다. 답의 첫 문장이 곧 답이고, 굵기를 나누지 않고 같은 굵기로 쓴다
export function Faq() {
  return (
    <section id="faq" aria-labelledby="faq-title" className="faq">
      <div className="wrap">
        <h2 id="faq-title" tabIndex={-1} className="h2 faq-title">{COPY.faq.title}</h2>
        <ul className="faq-list">
          {faqFor(ctaMode()).map((item, i) => (
            <li key={item.id}>
              <details data-faq={item.id} open={i === 0 || undefined} className="faq-item">
                {/* flex는 제목에 건다. summary가 display를 따르는지에 기대지 않는다 */}
                <summary className="faq-q"><h3 className="faq-row"><span className="faq-text">{item.q}</span><span className="faq-mark"><Plus /></span></h3></summary>
                <p className="faq-a">{item.a}</p>
              </details>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
