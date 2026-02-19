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
│   ├── (with-header)/      # 헤더 있는 페이지들 (홈, reviews, projects, admin)
│   ├── blog/               # 블로그: layout, 목록, [slug] 글, write
│   └── write/              # 헤더 없는 단순 write 페이지
├── features/               # 기능 단위 모듈
│   ├── auth/               # 로그인 뷰 (LoginView)
│   ├── home/
│   └── blog/               # api/, actions/, components/, content/, styles/
├── components/             # 공용 UI
│   ├── layout/             # Header, Footer
│   ├── ui/                 # 범용 컴포넌트 (Button 등)
│   └── tiptap/             # 에디터 (Toolbar, PublishSidebar, index)
├── stores/                 # 전역 Zustand 스토어
├── styles/                 # 디자인 토큰
├── hooks/                  # 전역 커스텀 훅
└── lib/                    # 유틸리티
```

→ 상세: [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)

## 핵심 패턴 요약

### 임포트

```tsx
// ✅ 경로 별칭 + feature는 배럴(index) 통해
import { HomeView } from "@/features/home";
import { BlogWriteView, getCategories, getTags } from "@/features/blog";
import type { CategoryItem, TagItem } from "@/features/blog";
import { useAppStore } from "@/stores";

// ❌ 내부 경로 직접 임포트 금지
import { HomeView } from "@/features/home/components/HomeView";
import { getCategories } from "@/features/blog/api/getCategories";
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

## 참고

- **blog**: `getCategories`, `getTags`, `getTagBySlug`, `getPosts*`(목록/상세/카테고리/태그, `thumbnail_url` 포함), 뷰·타입은 `@/features/blog` 배럴로. 이미지 업로드는 `uploadImage`(Server Action), 대표 이미지(썸네일)는 에디터에서 본문 이미지 중 지정 → `posts.thumbnail_url` 저장. `savePost`는 서버 전용이라 **클라이언트에서는** `@/features/blog/actions/savePost` 직접 임포트 (배럴 쓰면 next/headers 등이 클라이언트 번들에 섞여 빌드 에러).
- **blog URL**: `/blog`만 오면 미들웨어가 `/blog/info`로 리다이렉트. `?tag=`, `?category=` 있으면 리다이렉트 안 함 → `/blog`에서 BlogView가 태그/카테고리 필터 목록 표시. 글 상세는 `/blog/[slug]`, 글 쓰기/수정은 `/blog/write`. **서브도메인** `blog.(host)`에서는 주소창에 `/blog` 없이 `/`, `/info`, `/?category=...` 형태로 동작(미들웨어 rewrite). 상세는 [docs/learn/BLOG-SUBDOMAIN.md](./docs/learn/BLOG-SUBDOMAIN.md).
- **Header Blog 링크**: 메인 사이트 헤더의 "Blog"는 **env**로 연결. `NEXT_PUBLIC_BLOG_URL`이 있으면 그 URL로, 없으면 개발 시 `http://blog.localhost:3000`, 프로덕션 시 `/blog`로 이동. 로컬/프로덕션 구분은 같은 변수에 환경별로 다른 값을 넣으면 됨.
- **blog 로그인**: 글 쓰기/수정/삭제는 로그인한 사용자만 가능. Supabase Auth 사용. 비로그인 시 `/blog/write`에서는 에디터 대신 **로그인 페이지**(전체 화면)가 나옴. 수정/삭제 버튼은 로그인한 사용자에게만 글 상세에 노출. 인증 흐름·구조는 [docs/AUTH.md](./docs/AUTH.md) 참고.
- **글 보기**: 본문은 `tiptap-editor` 클래스로 에디터와 동일 스타일 적용. 글 헤더에 태그 링크(`/blog?tag=slug`) 표시.
- **에디터**: Tiptap·PublishSidebar·ImageWithBadge·RepresentativeImageContext 등은 여러 기능에서 쓸 수 있는 공용이므로 `components/tiptap/`에 둠.
- **파비콘**: `app/favicon.ico`에 두면 Next.js가 자동으로 인식.

---

## 상세 문서

| 문서                                                      | 내용                                                     |
| --------------------------------------------------------- | -------------------------------------------------------- |
| [ARCHITECTURE.md](./docs/ARCHITECTURE.md)                 | 폴더 구조, 렌더링 플로우, 네이밍 컨벤션                  |
| [ROUTING.md](./docs/ROUTING.md)                           | Next.js App Router, 동적 라우트, Route Group             |
| [STYLING.md](./docs/STYLING.md)                           | 디자인 토큰 정의, 사용 가능한 클래스                     |
| [STATE.md](./docs/STATE.md)                               | Global/Scoped Store 패턴, 코드 예시                      |
| [AUTH.md](./docs/AUTH.md)                                 | Supabase Auth, 로그인 페이지, 서버/클라이언트 보호       |
| [learn/BLOG-SUBDOMAIN.md](./docs/learn/BLOG-SUBDOMAIN.md) | 블로그 서브도메인(미들웨어, BlogLink, Header env) 공부용 |
