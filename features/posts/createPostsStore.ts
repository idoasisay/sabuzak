import { createStore } from "zustand/vanilla";

export type PostsStore = {
  count: number;
  increment: () => void;
};

/**
 * Provider가 마운트될 때마다 새로 호출해서 "이 트리 전용" 스토어를 만든다.
 * 페이지를 나갔다 들어오면 새 인스턴스 → 값 초기화.
 */
export function createPostsStore() {
  return createStore<PostsStore>(set => ({
    count: 0,
    increment: () => set(s => ({ count: s.count + 1 })),
  }));
}

export type PostsStoreApi = ReturnType<typeof createPostsStore>;
