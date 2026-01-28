"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { useStore } from "zustand/react";
import { createPostsStore, type PostsStore, type PostsStoreApi } from "./createPostsStore";

const PostsStoreContext = createContext<PostsStoreApi | null>(null);

/**
 * Provider가 마운트될 때 한 번만 스토어를 만들고, 그 트리 안에서만 쓰인다.
 * 페이지(또는 이 Provider를 쓰는 구간)를 벗어나면 언마운트 → 다시 들어오면 새 스토어 → 값 초기화.
 */
export function PostsStoreProvider({ children }: { children: ReactNode }) {
  const [store] = useState(() => createPostsStore());

  return <PostsStoreContext.Provider value={store}>{children}</PostsStoreContext.Provider>;
}

function usePostsStoreContext() {
  const store = useContext(PostsStoreContext);
  if (!store) {
    throw new Error("usePostsStore must be used within PostsStoreProvider");
  }
  return store;
}

/** Provider 트리 안에서만 호출. posts 구간 전용 스토어. */
export function usePostsStore(): PostsStore;
export function usePostsStore<T>(selector: (state: PostsStore) => T): T;
export function usePostsStore<T>(selector?: (state: PostsStore) => T): PostsStore | T {
  const store = usePostsStoreContext();
  return useStore(store, (selector ?? ((s: PostsStore) => s)) as (s: PostsStore) => T);
}
