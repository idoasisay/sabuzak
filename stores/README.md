# 전역 상태 (Zustand)

여기는 앱 전역에서 쓰는 Zustand 스토어를 둡니다.

## 규칙

- **스토어는 `stores/` 에만** 두고, `stores/index.ts`에서 필요한 것만 export.
- 스토어를 **쓰는 컴포넌트는 반드시 `"use client"`** 를 씁니다. (Zustand 훅은 클라이언트에서만 동작)
- 스토어 파일 자체에는 `"use client"` 를 안 붙여도 됩니다. 훅을 사용하는 쪽에만 붙이면 됩니다.

## 사용 예

```tsx
"use client";

import { useAppStore } from "@/stores";

export function SomeButton() {
  const theme = useAppStore(state => state.theme);
  const setTheme = useAppStore(state => state.setTheme);
  // ...
}
```

필요한 값/액션만 고르면 리렌더도 그만큼만 일어납니다.
