import { Sparkle } from './Icons';
import { QrCode } from './QrCode';
import { COPY, SITE } from '@/content/site';

// 오픈 후 마지막 CTA와 스토어 선택 창의 내용. 주소가 있는 곳만 보이고 App Store를 앞에 둔다.
// 공식 배지 파일이 올 때까지 폼의 버튼과 같은 알약을 쓴다. 애플, 구글 로고는 그리지 않는다.
// QR은 스토어가 둘이어도 하나다. 사이트의 이 자리로 오게 해서 폰에서 링크를 누르게 한다. 리다이렉트 라우트를 만들지 않는다.
// 자기 화면의 코드는 찍을 수 없으므로 QR은 큰 화면에서만 보인다(styles/cta.css)
export function StoreChoice() {
  const stores = (['ios', 'android'] as const).filter((store) => SITE.store[store]);
  return (
    <div className="store">
      <ul className="store-links">
        {stores.map((store) => (
          <li key={store}>
            <a href={SITE.store[store]} className="btn-primary store-link">
              <span>{COPY.store[store]}</span>
              <span className="btn-orb" aria-hidden="true">
                <Sparkle />
              </span>
            </a>
          </li>
        ))}
      </ul>
      <figure className="store-qr">
        <QrCode value={`${SITE.url}/#waitlist`} label={COPY.store.qrLabel} />
        <figcaption>{COPY.store.qr}</figcaption>
      </figure>
    </div>
  );
}
