import { Wordmark } from './Wordmark';

// 브랜드 포스터 카드. 미디어 파일이 없을 때 MediaSlot만 이 카드를 그린다.
// CLAUDE.md 규칙: 회색이나 어두운 자리표시 상자를 쓰지 않고, 파일이 아직 없다고 알리는 안내 문구도 넣지 않는다.
// 카드는 AI가 만든 그림이 아니므로 'AI' 라벨도 붙이지 않는다. 흰 면과 가운데 주황 워드마크뿐이다
export function PosterCard() {
  return (
    <div className="poster" aria-hidden="true">
      <Wordmark className="poster-mark" />
    </div>
  );
}
