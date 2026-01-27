# 🔄 프로젝트 설정 이관 프롬프트

이 프롬프트를 사용하여 현재 프로젝트의 모든 설정을 다른 Next.js 프로젝트로 이관할 수 있습니다.

---

## 📋 사용 방법

1. 새로운 Next.js 프로젝트를 생성하거나 기존 프로젝트를 준비합니다
2. 아래 프롬프트를 복사하여 AI 어시스턴트에게 전달합니다
3. 단계별로 진행하면서 필요한 파일들을 생성합니다

---

## 🚀 이관 프롬프트

````
다음 설정을 Next.js 프로젝트에 적용해줘. 단계별로 진행하고 각 단계가 완료되면 다음 단계로 진행해줘.

# 프로젝트 개요
- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS 4.x + shadcn/ui
- Zustand (상태관리)
- ESLint + Prettier + Husky + lint-staged + commitlint
- GitHub Actions (AI 코드 리뷰, QA 시나리오 자동 생성)
- Vercel 배포 설정

# 1단계: package.json 설정

다음 dependencies와 devDependencies를 추가하고 scripts를 설정해줘:

dependencies:
- class-variance-authority: ^0.7.1
- clsx: ^2.1.1
- lucide-react: ^0.563.0
- next: 16.1.5
- react: 19.2.3
- react-dom: 19.2.3
- tailwind-merge: ^3.4.0
- zustand: ^5.0.10

devDependencies:
- @commitlint/cli: ^19.8.1
- @commitlint/config-conventional: ^19.8.1
- @tailwindcss/postcss: ^4
- @types/node: ^20
- @types/react: ^19
- @types/react-dom: ^19
- eslint: ^9
- eslint-config-next: 16.1.5
- husky: ^9.1.7
- lint-staged: ^15.2.0
- tailwindcss: ^4
- typescript: ^5

scripts:
- "dev": "next dev"
- "build": "next build"
- "start": "next start"
- "lint": "eslint ."
- "lint:fix": "eslint . --fix"
- "format": "prettier --write \"**/*.{js,jsx,ts,tsx,json,css,md}\""
- "format:check": "prettier --check \"**/*.{js,jsx,ts,tsx,json,css,md}\""
- "prepare": "husky"
- "lint-staged": "lint-staged"

# 2단계: Tailwind CSS 설정

## tailwind.config.ts 생성:
```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
};

export default config;
````

## postcss.config.mjs 생성:

```javascript
/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
```

## app/globals.css 업데이트:

```css
@import "tailwindcss";

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
    --chart-1: 12 76% 61%;
    --chart-2: 173 58% 39%;
    --chart-3: 197 37% 24%;
    --chart-4: 43 74% 66%;
    --chart-5: 27 87% 67%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 212.7 26.8% 83.9%;
    --chart-1: 220 70% 50%;
    --chart-2: 160 60% 45%;
    --chart-3: 30 80% 55%;
    --chart-4: 280 65% 60%;
    --chart-5: 340 75% 55%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

# 3단계: shadcn/ui 설정

## components.json 생성:

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "app/globals.css",
    "baseColor": "slate",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}
```

## lib/utils.ts 생성:

```typescript
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

## 필요한 디렉토리 생성:

- components/ui/
- hooks/

# 4단계: ESLint 설정

## eslint.config.mjs 생성:

```javascript
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
```

# 5단계: Prettier 설정

## .prettierrc.json 생성:

```json
{
  "printWidth": 120,
  "tabWidth": 2,
  "useTabs": false,
  "semi": true,
  "singleQuote": false,
  "quoteProps": "consistent",
  "jsxSingleQuote": false,
  "trailingComma": "es5",
  "bracketSpacing": true,
  "bracketSameLine": false,
  "arrowParens": "avoid",
  "endOfLine": "lf"
}
```

# 6단계: Husky + lint-staged + commitlint 설정

## lint-staged.config.js 생성:

```javascript
module.exports = {
  "*.{js,jsx,ts,tsx}": ["eslint --fix", "prettier --write"],
  "*.{json,md,css,scss}": ["prettier --write"],
};
```

## commitlint.config.js 생성:

```javascript
module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [
      2,
      "always",
      [
        "feat", // 새로운 기능
        "fix", // 버그 수정
        "docs", // 문서 수정
        "style", // 코드 포맷팅, 세미콜론 누락 등
        "refactor", // 코드 리팩토링
        "perf", // 성능 개선
        "test", // 테스트 코드
        "chore", // 빌드 업무 수정, 패키지 매니저 설정 등
        "ci", // CI 설정 파일 수정
      ],
    ],
    "type-case": [2, "always", "lower-case"],
    "type-empty": [2, "never"],
    "scope-empty": [0],
    "scope-case": [2, "always", "lower-case"],
    "subject-empty": [2, "never"],
    "subject-full-stop": [2, "never", "."],
    "header-max-length": [2, "always", 100],
  },
};
```

## Husky hooks 생성:

### .husky/pre-commit 생성:

```bash
ALLOWED_EMAIL="your-email@example.com"

CURRENT_EMAIL=$(git config user.email)
if [ "$CURRENT_EMAIL" != "$ALLOWED_EMAIL" ]; then
  echo "🛑 [Emergency] 회사 계정으로 커밋하려고 합니다"
  echo "   현재 설정된 이메일: $CURRENT_EMAIL"
  echo "   허용된 이메일: $ALLOWED_EMAIL"
  echo "👉 'git config user.email 네이메일' 명령어로 수정하고 다시 시도해."
  exit 1
fi

npx lint-staged
```

### .husky/pre-push 생성:

```bash
#!/bin/sh
. "$(dirname -- "$0")/_/husky.sh"

# 현재 푸시하려는 브랜치 이름 가져오기
current_branch=$(git symbolic-ref HEAD | sed -e 's,.*/\(.*\),\1,')

# 금지할 브랜치 리스트 (main)
protected_branch='^(main)$'

# 만약 현재 브랜치가 main이면 막아버리기
if [[ $current_branch =~ $protected_branch ]]; then
  echo "🛑 [STOP] 메인 브랜치($current_branch)에 직접 푸시할 수 없습니다"
  echo "👉 제발 브랜치를 따로 따서 작업하고 PR을 날려주세요."
  echo "   (git checkout -b feat/새기능)"
  exit 1
fi
```

### .husky/commit-msg 생성:

```bash
npx --no -- commitlint --edit ${1}
```

# 7단계: VSCode 설정

## .vscode/settings.json 생성:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[javascriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[json]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[jsonc]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[css]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[scss]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[html]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[markdown]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "prettier.requireConfig": true,
  "prettier.useEditorConfig": false,
  "css.lint.unknownAtRules": "ignore",
  "scss.lint.unknownAtRules": "ignore"
}
```

## .vscode/extensions.json 생성:

```json
{
  "recommendations": [
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-typescript-next",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense",
    "ms-vscode.vscode-json"
  ]
}
```

# 8단계: GitHub Actions 설정

## .github/scripts/qa_bot.py 생성:

(원본 파일 내용 전체 복사)

## .github/scripts/review_bot.py 생성:

(원본 파일 내용 전체 복사)

## .github/scripts/post_qa_comment.js 생성:

(원본 파일 내용 전체 복사)

## .github/scripts/post_inline_review.js 생성:

(원본 파일 내용 전체 복사)

## .github/workflows/ci.yml 생성:

(원본 파일 내용 전체 복사)

# 9단계: .gitignore 업데이트

다음 항목들을 .gitignore에 추가:

```
# python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
*.txt
qa_comment.txt
review_comment.txt
review_comments.json
```

# 10단계: 최종 확인

1. npm install 실행
2. Husky 초기화 확인 (prepare 스크립트 자동 실행)
3. tsconfig.json의 paths 설정 확인 (@/\* alias)
4. 모든 파일이 올바르게 생성되었는지 확인

각 단계를 완료하면 다음 단계로 진행해줘.

```

---

## 📝 사용 시 주의사항

1. **이메일 설정**: `.husky/pre-commit` 파일의 `ALLOWED_EMAIL` 값을 실제 사용할 이메일로 변경하세요.

2. **GitHub Actions 스크립트**: 8단계에서 원본 파일 내용을 복사할 때, 다음 파일들을 참조하세요:
   - `.github/scripts/qa_bot.py`
   - `.github/scripts/review_bot.py`
   - `.github/scripts/post_qa_comment.js`
   - `.github/scripts/post_inline_review.js`
   - `.github/workflows/ci.yml`

3. **환경 변수**: GitHub Secrets 설정은 수동으로 해야 합니다:
   - `GEMINI_API_KEY` (필수)
   - `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` (선택)

4. **tsconfig.json 확인**: `@/*` alias가 올바르게 설정되어 있는지 확인하세요.

---

## ✅ 완료 체크리스트

- [ ] package.json 업데이트 완료
- [ ] Tailwind CSS 설정 완료
- [ ] shadcn/ui 설정 완료
- [ ] ESLint 설정 완료
- [ ] Prettier 설정 완료
- [ ] Husky + lint-staged + commitlint 설정 완료
- [ ] VSCode 설정 완료
- [ ] GitHub Actions 설정 완료
- [ ] .gitignore 업데이트 완료
- [ ] npm install 실행 완료
- [ ] 빌드 테스트 완료

---

이 프롬프트를 사용하면 모든 설정을 한 번에 이관할 수 있습니다! 🚀
```
