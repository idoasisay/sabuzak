# AGENTS.md - 아키텍처 네비게이션

AI가 Sabuzak 프로젝트 작업 시 참조하는 구조 요약입니다. 상세 내용은 링크된 문서를 참조하세요.

---

## 파일 배치 결정 트리

```
새 파일을 만들어야 할 때:
│
├─ URL/라우팅 관련? ──────────────► app/
├─ 특정 기능 전용 UI/로직? ────────► features/{기능명}/
├─ 여러 feature가 공유하는 UI? ────► components/
├─ 앱 전역 상태? ──────────────────► stores/use{Name}Store.ts
├─ 유틸리티 함수? ─────────────────► lib/
└─ 스타일 토큰/테마? ──────────────► styles/
```

## 폴더 구조 요약

```
sabuzak/
├── app/                    # 라우팅만 (UI 로직 금지)
│   ├── (with-header)/      # 헤더 있는 페이지들
│   └── write/              # 헤더 없는 페이지
├── features/               # 기능 단위 모듈
│   ├── home/
│   └── blog/
├── components/             # 공용 UI
│   ├── layout/             # Header, Footer
│   └── ui/                 # 범용 컴포넌트
├── stores/                 # 전역 Zustand 스토어
├── styles/                 # 디자인 토큰
├── hooks/                  # 전역 커스텀 훅
└── lib/                    # 유틸리티
```

→ 상세: [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)

## 핵심 패턴 요약

### 임포트

```tsx
// ✅ 경로 별칭
import { HomeView } from "@/features/home";
import { useAppStore } from "@/stores";

// ❌ 내부 경로 직접 임포트 금지
import { HomeView } from "@/features/home/components/HomeView";
```

### 컴포넌트

```tsx
// ✅ Server Component 기본
export function HomeView() { ... }

// ✅ 필요 시만 Client
"use client";
export function Counter() { ... }
```

→ 상세: [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)

### 스타일링

```tsx
// ✅ 시맨틱 토큰만
<div className="bg-background text-foreground">
<p className="text-muted-foreground">

// ❌ 팔레트 직접 지정 금지
<div className="bg-zinc-50 text-gray-600">
```

→ 상세: [docs/STYLING.md](./docs/STYLING.md)

### 상태 관리

| 상황              | 사용         | 위치               |
| ----------------- | ------------ | ------------------ |
| 앱 전역 (테마 등) | Global Store | `stores/`          |
| 페이지/섹션 한정  | Scoped Store | `features/{name}/` |
| 컴포넌트 내 로컬  | `useState`   | 해당 컴포넌트      |

→ 상세: [docs/STATE.md](./docs/STATE.md)

---

## 상세 문서

| 문서                                      | 내용                                         |
| ----------------------------------------- | -------------------------------------------- |
| [ARCHITECTURE.md](./docs/ARCHITECTURE.md) | 폴더 구조, 렌더링 플로우, 네이밍 컨벤션      |
| [ROUTING.md](./docs/ROUTING.md)           | Next.js App Router, 동적 라우트, Route Group |
| [STYLING.md](./docs/STYLING.md)           | 디자인 토큰 정의, 사용 가능한 클래스         |
| [STATE.md](./docs/STATE.md)               | Global/Scoped Store 패턴, 코드 예시          |
