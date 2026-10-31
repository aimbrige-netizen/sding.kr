'use client';

import { useEffect, useState } from 'react';

type Props = {
  items: { id: string; label: string }[];
  label: string;
};

// 존 4개를 가리키는 진행 점(PLAN '적용 규칙'). 화면 가운데 선을 지나는 존이 현재 위치다.
// 나타나고 사라지는 구간은 sticky가 정하므로 JS가 없어도 링크는 그대로 동작한다
export function ProgressDots({ items, label }: Props) {
  const [current, setCurrent] = useState<string | null>(null);

  useEffect(() => {
    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        const { id } = entry.target;
        if (entry.isIntersecting) setCurrent(id);
        else setCurrent((now) => (now === id ? null : now));
      }
    }, { rootMargin: '-50% 0px -50% 0px' });
    for (const item of items) {
      const section = document.getElementById(item.id);
      if (section) io.observe(section);
    }
    return () => io.disconnect();
  }, [items]);

  return (
    <div className="dots-rail">
      <nav className="dots" aria-label={label}>
        <ol className="dots-list">
          {items.map((item) => (
            <li key={item.id}>
              <a className="pd-link" href={`#${item.id}`} aria-current={current === item.id ? 'location' : undefined}>
                <span className="pd-mark" />
                <span className="sr-only">{item.label}</span>
              </a>
            </li>
          ))}
        </ol>
      </nav>
    </div>
  );
}
