# Sabuzak

Next.js 16 기반의 현대적인 웹 애플리케이션 프로젝트입니다.

## 🚀 빠른 시작

**처음 시작하시나요?** → **[INIT.md](./INIT.md)** 파일을 먼저 확인하세요!

초기 설정 가이드에서 다음 내용을 확인할 수 있습니다:

- 의존성 설치
- Git 설정
- GitHub 저장소 설정
- Vercel 배포 설정
- 환경 변수 설정

## 📦 기술 스택

- **프레임워크**: Next.js 16 (App Router)
- **언어**: TypeScript
- **스타일링**: Tailwind CSS 4.x + shadcn/ui
- **상태관리**: Zustand
- **코드 품질**: ESLint, Prettier, Husky, lint-staged, commitlint
- **CI/CD**: GitHub Actions (AI 코드 리뷰, QA 시나리오 자동 생성)
- **배포**: Vercel

## 🛠️ 개발

### 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

### 빌드

```bash
npm run build
npm start
```

### 코드 품질

```bash
# ESLint 실행
npm run lint

# ESLint 자동 수정
npm run lint:fix

# Prettier 포맷팅
npm run format
```

## 📁 프로젝트 구조

```
sabuzak/
├── .github/          # GitHub Actions 워크플로우
├── .husky/           # Git hooks
├── app/              # Next.js App Router
├── components/       # React 컴포넌트
│   └── ui/          # shadcn/ui 컴포넌트
├── lib/             # 유틸리티 함수
└── public/          # 정적 파일
```

## 🤖 주요 기능

### AI 기반 코드 리뷰

- PR 생성 시 자동으로 코드 리뷰 생성
- 인라인 댓글 자동 작성
- Critical/Suggestion/Nitpick 세 가지 심각도로 분류

### QA 시나리오 자동 생성

- PR 변경사항 분석
- 사용자 관점의 테스트 시나리오 생성
- 우선순위별로 정리된 체크리스트

### 자동화된 코드 품질 관리

- Husky: 커밋 전 자동 검사
- lint-staged: 변경된 파일만 검사
- commitlint: 커밋 메시지 규칙 검사

## 📚 문서

- [초기 설정 가이드](./INIT.md) - 프로젝트 설정 방법
- [설정 이관 프롬프트](./MIGRATION_PROMPT.md) - 다른 프로젝트로 설정 이관하기
- [Next.js 문서](https://nextjs.org/docs)
- [Tailwind CSS 문서](https://tailwindcss.com/docs)
- [shadcn/ui 문서](https://ui.shadcn.com)

## 📝 커밋 컨벤션

이 프로젝트는 [Conventional Commits](https://www.conventionalcommits.org/)를 따릅니다.

```
feat: 새로운 기능 추가
fix: 버그 수정
docs: 문서 수정
style: 코드 포맷팅
refactor: 코드 리팩토링
perf: 성능 개선
test: 테스트 코드
chore: 빌드 업무 수정
ci: CI 설정 파일 수정
```

## 📄 라이선스

이 프로젝트는 비공개 프로젝트입니다.
