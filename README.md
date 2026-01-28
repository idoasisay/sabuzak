# Sabuzak

Next.js 16 웹 프로젝트. **SSR(서버 컴포넌트)을 기본**으로 하고, 필요할 때만 클라이언트에서 상태·상호작용을 씁니다.

## 기술 스택

| 카테고리  | 기술                                                                   |
| --------- | ---------------------------------------------------------------------- |
| Framework | Next.js 16 (App Router)                                                |
| Language  | TypeScript 5                                                           |
| 런타임    | React 19                                                               |
| Styling   | Tailwind CSS 4, shadcn/ui                                              |
| State     | Zustand 5                                                              |
| Lint/포맷 | ESLint 9, Prettier 3                                                   |
| Git hooks | Husky, lint-staged, commitlint                                         |
| CI/CD     | GitHub Actions (AI 코드 리뷰, QA 시나리오 자동 생성, Node.js 스크립트) |
| 배포      | Vercel                                                                 |

## 사전 요구사항

- Node.js >= 18
- npm

## 설치

```bash
# 저장소 클론
git clone <repository-url>
cd sabuzak

# 의존성 설치
npm install
```

## 환경 설정

`.env.local` 파일을 프로젝트 루트에 생성하고 필요한 환경 변수를 설정하세요.

## 실행

**개발 환경**

```bash
# 개발 서버
npm run dev
```

[http://localhost:3000](http://localhost:3000)에서 확인할 수 있습니다.

**프로덕션 빌드**

```bash
npm run build
npm start
```

## 스크립트 명령어

**개발**

| 명령어        | 설명                    |
| ------------- | ----------------------- |
| `npm run dev` | 개발 서버               |
| `npm start`   | 프로덕션 서버 (빌드 후) |

**빌드**

| 명령어          | 설명          |
| --------------- | ------------- |
| `npm run build` | 프로덕션 빌드 |

**코드 품질**

| 명령어             | 설명             |
| ------------------ | ---------------- |
| `npm run lint`     | ESLint 검사      |
| `npm run lint:fix` | ESLint 자동 수정 |
| `npm run format`   | Prettier 포맷팅  |

## 프로젝트 구조

```
sabuzak/
├── app/                 # Next.js App Router (라우팅·레이아웃만)
│   ├── layout.tsx       # 전역 레이아웃
│   ├── page.tsx         # / 페이지 (필요 시 feature에서 컴포넌트 import)
│   └── globals.css
├── features/            # 기능 단위 모듈 (Feature-based)
│   ├── home/
│   │   ├── index.tsx    # 외부에 노출할 것만 export
│   │   └── components/
│   └── README.md
├── components/          # 여러 기능/페이지가 쓰는 공용 UI
│   ├── ThemeSync.tsx    # 스토어 → <html> 테마 반영 (use client)
│   └── ThemeToggle.tsx
├── stores/              # 전역 상태 (Zustand). 사용하는 쪽은 "use client"
│   ├── useAppStore.ts
│   └── index.ts
├── lib/                 # 유틸, API 클라이언트 등
├── public/
├── .github/
│   ├── workflows/
│   └── scripts/
└── .husky/
```

## 렌더링·상태 (SSR 기준)

- **기본은 서버 컴포넌트(RSC)**
  - `app/` 안의 페이지·레이아웃은 지금처럼 서버에서 렌더됩니다.
  - 컴포넌트에 `"use client"` 를 붙이지 않으면 전부 서버 컴포넌트입니다.
- **클라이언트가 필요할 때만**
  - Zustand, `useState`, `onClick` 같은 훅/이벤트를 쓰는 컴포넌트에만 **파일 상단에 `"use client"`** 를 둡니다.
  - 전역 상태는 `stores/` 의 스토어를 만들고, 그 훅을 **클라이언트 컴포넌트 안에서만** 사용합니다.
- **라우트와 기능 분리**
  - `app/` 은 URL·레이아웃만 담당하고, 화면 조각은 `features/`, `components/` 에서 가져와 조합합니다.

## CI/CD

- **AI 코드 리뷰**: PR diff를 `review_bot.mjs`(Node + `@google/genai`)로 분석해 인라인 리뷰와 요약 댓글을 남깁니다.
- Python 없이 Node.js와 `npm ci`만으로 동작합니다. `GEMINI_API_KEY`는 GitHub Actions 시크릿에 설정합니다.
