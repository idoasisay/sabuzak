# 🚀 프로젝트 초기 설정 가이드

이 문서는 프로젝트를 처음 시작할 때 필요한 모든 설정을 안내합니다.

## 📋 목차

1. [의존성 설치](#1-의존성-설치)
2. [Git 설정](#2-git-설정)
3. [GitHub 저장소 설정](#3-github-저장소-설정)
4. [Vercel 배포 설정](#4-vercel-배포-설정)
5. [환경 변수 설정](#5-환경-변수-설정)
6. [개발 환경 확인](#6-개발-환경-확인)

---

## 1. 의존성 설치

```bash
npm install
```

모든 패키지가 설치되면 Husky가 자동으로 초기화됩니다 (`prepare` 스크립트 실행).

---

## 2. Git 설정

### 2.1 Git 사용자 정보 설정

프로젝트의 `pre-commit` hook이 특정 이메일만 허용하도록 설정되어 있습니다.

**현재 허용된 이메일 확인:**

```bash
cat .husky/pre-commit
```

**Git 사용자 정보 설정:**

```bash
# 전역 설정
git config --global user.name "Your Name"
git config --global user.email "your-email@example.com"

# 또는 이 프로젝트에만 적용
git config user.name "Your Name"
git config user.email "your-email@example.com"
```

**이메일 변경이 필요한 경우:**
`.husky/pre-commit` 파일에서 `ALLOWED_EMAIL` 값을 수정하세요.

### 2.2 Git 저장소 초기화 (필요한 경우)

```bash
git init
git add .
git commit -m "chore: initial commit"
```

---

## 3. GitHub 저장소 설정

### 3.1 GitHub 저장소 생성 및 연결

1. GitHub에서 새 저장소 생성
2. 원격 저장소 연결:

```bash
git remote add origin https://github.com/your-username/your-repo-name.git
git branch -M main
git push -u origin main
```

### 3.2 GitHub Secrets 설정

GitHub Actions가 작동하려면 다음 Secrets를 설정해야 합니다.

**설정 방법:**

1. GitHub 저장소 → Settings → Secrets and variables → Actions
2. "New repository secret" 클릭
3. 아래 Secrets 추가:

#### 필수 Secrets

| Secret 이름      | 설명                                                      | 획득 방법                                                             |
| ---------------- | --------------------------------------------------------- | --------------------------------------------------------------------- |
| `GEMINI_API_KEY` | Google Gemini API 키 (AI 코드 리뷰 및 QA 시나리오 생성용) | [Google AI Studio](https://makersuite.google.com/app/apikey)에서 생성 |

#### 선택적 Secrets (Vercel 배포 사용 시)

| Secret 이름         | 설명               | 획득 방법                            |
| ------------------- | ------------------ | ------------------------------------ |
| `VERCEL_TOKEN`      | Vercel 배포 토큰   | Vercel Dashboard → Settings → Tokens |
| `VERCEL_ORG_ID`     | Vercel 조직 ID     | Vercel 프로젝트 설정에서 확인        |
| `VERCEL_PROJECT_ID` | Vercel 프로젝트 ID | Vercel 프로젝트 설정에서 확인        |

**⚠️ 중요:**

- `GEMINI_API_KEY`는 **필수**입니다. 없으면 AI 코드 리뷰와 QA 시나리오 생성이 작동하지 않습니다.
- Vercel Secrets는 Preview 배포를 사용할 때만 필요합니다.

---

## 4. Vercel 배포 설정

### 4.1 Vercel 프로젝트 생성

1. [Vercel Dashboard](https://vercel.com/dashboard) 접속
2. "Add New..." → "Project" 클릭
3. GitHub 저장소 선택 및 연결
4. 프로젝트 설정:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (기본값)
   - **Build Command**: `npm run build` (자동 감지)
   - **Output Directory**: `.next` (자동 감지)

### 4.2 Vercel 환경 변수 설정

Vercel Dashboard → 프로젝트 → Settings → Environment Variables에서 필요한 환경 변수를 추가하세요.

### 4.3 Vercel Secrets 확인

GitHub Actions에서 Vercel 배포를 사용하려면 다음 정보가 필요합니다:

1. **VERCEL_TOKEN 생성:**
   - Vercel Dashboard → Settings → Tokens
   - "Create Token" 클릭
   - 토큰 이름 입력 후 생성
   - 생성된 토큰을 GitHub Secrets에 `VERCEL_TOKEN`으로 추가

2. **VERCEL_ORG_ID 및 VERCEL_PROJECT_ID 확인:**
   - Vercel 프로젝트 설정 페이지에서 확인 가능
   - 또는 Vercel CLI로 확인:
     ```bash
     npx vercel link
     ```
   - `.vercel/project.json` 파일에서 확인 가능

---

## 5. 환경 변수 설정

### 5.1 로컬 환경 변수

프로젝트 루트에 `.env.local` 파일을 생성하고 필요한 환경 변수를 추가하세요:

```bash
# .env.local 예시
# NEXT_PUBLIC_API_URL=http://localhost:3000/api
# DATABASE_URL=your-database-url
```

**⚠️ 주의:**

- `.env.local`은 `.gitignore`에 포함되어 있어 Git에 커밋되지 않습니다.
- 민감한 정보는 절대 커밋하지 마세요.

### 5.2 Vercel 환경 변수

Vercel Dashboard에서 프로젝트의 Environment Variables를 설정하세요. Production, Preview, Development 환경별로 다르게 설정할 수 있습니다.

---

## 6. 개발 환경 확인

### 6.1 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속하여 확인하세요.

### 6.2 코드 품질 도구 확인

```bash
# ESLint 실행
npm run lint

# ESLint 자동 수정
npm run lint:fix

# Prettier 포맷팅
npm run format

# Prettier 포맷팅 체크
npm run format:check
```

### 6.3 빌드 테스트

```bash
npm run build
```

빌드가 성공하면 프로덕션 배포 준비가 완료된 것입니다.

---

## 🎨 shadcn/ui 사용하기

### 컴포넌트 추가

```bash
# 예시: Button 컴포넌트 추가
npx shadcn@latest add button

# 여러 컴포넌트 한 번에 추가
npx shadcn@latest add button card dialog
```

### 사용 가능한 컴포넌트 목록

[shadcn/ui 공식 문서](https://ui.shadcn.com/docs/components)에서 확인할 수 있습니다.

---

## 🔧 프로젝트 구조

```
sabuzak/
├── .github/
│   ├── scripts/          # GitHub Actions 스크립트
│   │   ├── qa_bot.py     # QA 시나리오 생성
│   │   ├── review_bot.py # 코드 리뷰 생성
│   │   └── ...
│   └── workflows/
│       └── ci.yml        # CI/CD 워크플로우
├── .husky/               # Git hooks
├── app/                  # Next.js App Router
├── components/           # React 컴포넌트
│   └── ui/              # shadcn/ui 컴포넌트
├── lib/                 # 유틸리티 함수
└── public/              # 정적 파일
```

---

## 📝 주요 기능

### 1. AI 기반 코드 리뷰

- PR 생성 시 자동으로 코드 리뷰 생성
- 인라인 댓글 자동 작성
- Critical/Suggestion/Nitpick 세 가지 심각도로 분류

### 2. QA 시나리오 자동 생성

- PR 변경사항 분석
- 사용자 관점의 테스트 시나리오 생성
- 우선순위별로 정리된 체크리스트

### 3. 자동화된 코드 품질 관리

- Husky: 커밋 전 자동 검사
- lint-staged: 변경된 파일만 검사
- commitlint: 커밋 메시지 규칙 검사

### 4. Vercel Preview 배포

- PR 생성 시 자동으로 Preview 환경 배포
- PR에 Preview URL 자동 댓글 작성

---

## ⚠️ 문제 해결

### Git 커밋이 실패하는 경우

1. **이메일 체크 실패:**

   ```bash
   git config user.email "your-allowed-email@example.com"
   ```

2. **lint-staged 실패:**
   ```bash
   npm run lint:fix
   npm run format
   ```

### GitHub Actions가 실패하는 경우

1. **GEMINI_API_KEY 확인:**
   - GitHub Secrets에 올바르게 설정되었는지 확인
   - API 키가 유효한지 확인

2. **Vercel 배포 실패:**
   - VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID 확인
   - Vercel 프로젝트가 올바르게 연결되었는지 확인

### 빌드 실패

```bash
# 의존성 재설치
rm -rf node_modules package-lock.json
npm install

# 캐시 클리어
rm -rf .next
npm run build
```

---

## 📚 추가 리소스

- [Next.js 문서](https://nextjs.org/docs)
- [Tailwind CSS 문서](https://tailwindcss.com/docs)
- [shadcn/ui 문서](https://ui.shadcn.com)
- [Zustand 문서](https://docs.pmnd.rs/zustand)
- [GitHub Actions 문서](https://docs.github.com/en/actions)

---

## ✅ 체크리스트

설정 완료 후 다음 항목들을 확인하세요:

- [ ] `npm install` 완료
- [ ] Git 사용자 정보 설정 완료
- [ ] GitHub 저장소 연결 완료
- [ ] GitHub Secrets 설정 완료 (최소 `GEMINI_API_KEY`)
- [ ] Vercel 프로젝트 생성 및 연결 완료 (선택)
- [ ] `.env.local` 파일 생성 완료 (필요한 경우)
- [ ] `npm run dev` 실행 성공
- [ ] `npm run build` 실행 성공
- [ ] 첫 커밋 및 푸시 성공

---

**설정 중 문제가 발생하면 이슈를 생성하거나 팀에 문의하세요!** 🚀
