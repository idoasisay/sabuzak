# CLAUDE.md

## 프로젝트

**Sabuzak** - Next.js 16 + React 19 + TypeScript + Tailwind v4 + Zustand 5

## 명령어

```bash
npm run dev      # 개발 서버
npm run build    # 빌드
npm run lint     # 린트
```

## 핵심 규칙

### 폴더 역할

| 폴더          | 역할                                     |
| ------------- | ---------------------------------------- |
| `app/`        | 라우팅만. UI 로직은 features/에서 import |
| `features/`   | 기능별 UI/로직. 배럴 익스포트로 노출     |
| `components/` | 공용 UI (여러 feature가 공유)            |
| `stores/`     | 전역 상태 (`use{Name}Store.ts`)          |

### DO

- `@/` 경로 별칭 사용
- 시맨틱 토큰: `bg-background`, `text-foreground`, `text-muted-foreground`
- `function` 선언 컴포넌트
- Server Component 기본, `"use client"`는 필요 시만
- Zustand selector: `useStore(s => s.field)`

### DON'T

- `app/`에 복잡한 UI 로직
- 하드코딩 색상: `bg-zinc-50`, `text-gray-600`
- 내부 경로 직접 임포트: `@/features/home/components/HomeView`
- `any` 타입
- `console.log` 커밋

## 상세 문서

| 문서                                           | 내용                   |
| ---------------------------------------------- | ---------------------- |
| [docs/PRD.md](./docs/PRD.md)                   | 기능 명세, 데이터 모델 |
| [AGENTS.md](./AGENTS.md)                       | 구조 요약 + 네비게이션 |
| [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) | 폴더 구조 상세         |
| [docs/ROUTING.md](./docs/ROUTING.md)           | Next.js 라우팅 규칙    |
| [docs/STYLING.md](./docs/STYLING.md)           | 디자인 토큰 사용법     |
| [docs/STATE.md](./docs/STATE.md)               | Zustand 패턴           |
