import { Fragment } from 'react';
import { faqFor } from '@/content/faq';
import { COPY } from '@/content/site';
import { ctaMode } from '@/lib/launch';

// 가운뎃점(·)으로 이은 말('플래닝·드레스·웨딩홀을')은 Chrome이 keep-all에서도 점 앞뒤에서 줄을 바꿔, 줄이 '·'로 시작하거나 끝난다.
// 그런 어절만 .nb(inline-block)로 묶어 줄바꿈으로 가르지 않는다. 글자는 그대로라 content의 문자열과 JSON-LD는 바뀌지 않는다.
// inline-block이라 200% 확대로 폭이 모자라면 어절 안에서 줄을 바꾼다(base.css)
function Answer({ text }: { text: string }) {
  if (!text.includes('·')) return text;
  // split의 괄호 묶음 덕분에 홀수 자리가 가운뎃점이 든 어절이다. 나머지 글은 한 덩어리로 둔다
  return text.split(/(\S*·\S*)/).map((part, i) => (
    <Fragment key={i}>{i % 2 ? <span className="nb">{part}</span> : part}</Fragment>
  ));
}

// FAQ(#faq, PLAN 'FAQ', 시안 A). 데스크톱은 제목이 왼쪽 5칸에 머물고(sticky) 목록이 오른쪽 7칸으로 흐른다. 폰은 쌓는다.
// 여닫기는 details가 맡아 JS 없이 동작하고, 답은 닫혀 있어도 HTML에 있다.
// 첫 질문은 처음부터 펼쳐 정의 문장이 누르지 않아도 보인다. 답의 첫 문장이 곧 답이고, 굵기를 나누지 않고 같은 굵기로 쓴다.
// 오른쪽 표시는 더하기이고, 열면 세로 획이 사라져 주황 빼기가 된다(faq.css가 선으로 그린다)
export function Faq() {
  return (
    <section id="faq" aria-labelledby="faq-title" className="faq">
      <div className="wrap faq-grid">
        <h2 id="faq-title" tabIndex={-1} className="faq-title">{COPY.faq.title}</h2>
        <ul className="faq-list">
          {faqFor(ctaMode()).map((item, i) => (
            <li key={item.id}>
              <details data-faq={item.id} open={i === 0 || undefined} className="faq-item">
                {/* flex는 제목에 건다. summary가 display를 따르는지에 기대지 않는다 */}
                <summary className="faq-q"><h3 className="faq-row"><span className="faq-text">{item.q}</span><span className="faq-mark" aria-hidden="true" /></h3></summary>
                <p className="faq-a"><Answer text={item.a} /></p>
              </details>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
