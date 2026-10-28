# sding.kr

주식회사 스딩의 원페이지 랜딩이다. 기획은 [docs/PLAN.md](docs/PLAN.md), 정해지지 않은 값과 질문은 [docs/OPEN_ITEMS.md](docs/OPEN_ITEMS.md)에 있다.

## 명령

```bash
npm run dev        # 개발 서버
npm run build      # 운영 빌드
npm run lint       # ESLint
npm run typecheck  # 라우트 타입 생성 후 tsc
```

## 어디를 고치나

- 문구와 값: `src/content/`
- 색, 간격, 글자 크기: `src/styles/tokens.css`
- 히어로 시안: `docs/design/`
- 환경 변수 이름: `.env.example`
