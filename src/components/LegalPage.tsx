import Link from 'next/link';
import { LEGAL_COPY, type LegalBlock, type LegalDoc, type LegalRow } from '@/content/legal';

// 처리방침과 약관이 같은 틀을 쓴다. 문구는 content/legal.ts에만 있고 여기서는 그리기만 한다.
// 표 대신 dl을 쓴다. 좁은 폭에서 가로 스크롤 없이 줄이 쌓이고, 읽기 도구가 라벨과 값을 묶어 읽는다
function Rows({ rows }: { rows: LegalRow[] }) {
  if (!rows.length) return null;
  return (
    <dl className="legal-rows">
      {rows.map((row) => (
        <div key={row.label} className="legal-row">
          <dt>{row.label}</dt>
          <dd>
            {row.href ? <a href={row.href}>{row.value}</a> : row.value}
            {row.note ? ` ${row.note}` : null}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function Block({ block }: { block: LegalBlock }) {
  if ('list' in block) {
    return <ul className="legal-list">{block.list.map((item) => <li key={item}>{item}</li>)}</ul>;
  }
  if ('rows' in block) return <Rows rows={block.rows} />;
  if ('groups' in block) {
    return block.groups.map((group) => (
      <div key={group.name} className="legal-group">
        <h3>{group.name}</h3>
        <Rows rows={group.rows} />
      </div>
    ));
  }
  const text = block.strong ? <strong>{block.p}</strong> : block.p;
  if (!block.link) return <p>{text}</p>;
  const { label, href } = block.link;
  return <p>{text} {href.startsWith('/') ? <Link href={href}>{label}</Link> : <a href={href}>{label}</a>}</p>;
}

export function LegalPage({ doc }: { doc: LegalDoc }) {
  return (
    <main id="main" tabIndex={-1} className="legal outline-none">
      <div className="legal-in">
        <header className="legal-head">
          <h1 className="zone-title legal-title">{doc.title}</h1>
          <p className="legal-lead">{doc.lead}</p>
        </header>
        <nav className="legal-toc" aria-labelledby="legal-toc-title">
          <h2 id="legal-toc-title">{LEGAL_COPY.toc}</h2>
          <ol>
            {doc.sections.map((section) => (
              <li key={section.id}><a href={`#${section.id}`}>{section.title}</a></li>
            ))}
          </ol>
        </nav>
        <div className="legal-body">
          {doc.sections.map((section) => (
            <section key={section.id} id={section.id} aria-labelledby={`${section.id}-title`} className="legal-sec">
              <h2 id={`${section.id}-title`}>{section.title}</h2>
              {section.blocks.map((block, i) => <Block key={i} block={block} />)}
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
