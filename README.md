# Sabuzak

Next.js 16 웹 프로젝트

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
├── app/              # Next.js App Router (페이지, 레이아웃)
├── components/       # React 컴포넌트
│   └── ui/          # shadcn/ui 컴포넌트
├── lib/             # 유틸리티 함수
├── public/          # 정적 파일
├── .github/         # GitHub Actions (CI/CD)
│   ├── workflows/   # ci.yml (lint, build, AI 리뷰, QA 시나리오, preview 배포)
│   └── scripts/     # review_bot.mjs, qa_bot.mjs (Gemini API), post_*.js (PR 댓글)
└── .husky/          # Git hooks (pre-commit, commit-msg, pre-push)
```

## CI/CD

- **AI 코드 리뷰**: PR diff를 `review_bot.mjs`(Node + `@google/genai`)로 분석해 인라인 리뷰와 요약 댓글을 남깁니다.
- **QA 테스트 시나리오**: PR diff를 `qa_bot.mjs`(Node + `@google/genai`)로 분석해 체크리스트 형식의 QA 시나리오 댓글을 남깁니다.
- Python 없이 Node.js와 `npm ci`만으로 동작합니다. `GEMINI_API_KEY`는 GitHub Actions 시크릿에 설정합니다.
