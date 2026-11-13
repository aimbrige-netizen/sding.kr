# 시안 A: 장면형 시네마

- `mockup.html`은 대표가 2026-11-13에 고른 시안 A('A로 가자')를 그대로 옮긴 사본이다. 기획서 v2.2의 시각 기준이다.
- 시안은 사진을 `/assets/…`(힉스필드 원본의 JPEG 사본과 걷는 영상)와 `img/…`(시안이 자른 컷)로 가리킨다. 그 파일과 시안을 화면 크기별로 찍은 렌더(`shots/`)는 git 밖의 `docs/private/design/scene-a/`(`assets/`, `img/`, `shots/`)에 둔다. 원본은 `docs/private/media-masters/higgsfield/`에 있다.
- 시안을 다시 열려면 `docs/private/design/scene-a/`에 이 `mockup.html`을 복사해 그 폴더를 웹 서버의 뿌리로 띄우고, `/assets/`는 그 안의 `assets/`로, `/fonts.css`와 `/fonts/`는 저장소의 `public/`으로 이어 준다.
- CDN에서 받는 아이콘(Phosphor), 렌더 표시(`frame-mark`, `data-frame`), '영상 재생' 알약 버튼은 시안에만 있다. 사이트는 기존 재생 버튼(`VideoPlayer`, `PlayButtons`)과 인라인 SVG를 쓴다.
- 사이트가 시안과 일부러 다르게 한 점(폰 드레스 비교는 쌍 A, 히어로에 등장 효과 없음, 폭 기준점 900px 하나, 신청 폼의 동의 고지를 체크 바로 위에 둠, 900~1279px 신청 사진을 무대 오른쪽 절반에 둠, 가로로 든 폰의 첫 화면 등)은 기획서 v2.2 변경과 v2.2 검토 반영에 있다.
- `mockup.html`은 고치지 않는다. 시안과 다르게 만든 점은 기획서에 적는다.
