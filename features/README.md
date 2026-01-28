# Feature-based 구조

기능 단위로 코드를 모아두는 폴더입니다.

## 규칙

- 한 폴더 = 한 기능(도메인) 예: `home`, `auth`, `dashboard`
- 각 feature 안에는 필요한 것만 둠:
  - `components/` – 해당 기능 전용 UI
  - `hooks/` – 해당 기능 전용 훅 (필요 시)
  - `api/` – 해당 기능 전용 API 호출 (필요 시)
  - `index.ts` / `index.tsx` – 외부에 노출할 것만 export

## 사용

```ts
import { HomeView } from "@/features/home";
```

`app/` 쪽 라우트에서는 위처럼 feature를 import해서 조합해서 쓰면 됩니다.
