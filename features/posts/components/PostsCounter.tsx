"use client";

import { usePostsStore } from "../PostsStoreContext";

export function PostsCounter() {
  const count = usePostsStore(s => s.count);
  const increment = usePostsStore(s => s.increment);

  return (
    <div className="mt-4 flex items-center gap-3">
      <span className="text-muted-foreground">count: {count}</span>
      <button
        type="button"
        onClick={increment}
        className="rounded-md bg-secondary px-3 py-1.5 text-sm font-medium text-secondary-foreground"
      >
        +1
      </button>
    </div>
  );
}
