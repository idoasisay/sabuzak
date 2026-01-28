import Link from "next/link";
import { PostsStoreProvider } from "../PostsStoreContext";
import { PostsCounter } from "./PostsCounter";

export function PostsView() {
  return (
    <div className="min-h-screen bg-background font-sans">
      <div className="mx-auto max-w-2xl px-4 py-12">
        <PostsStoreProvider>
          <h1 className="text-2xl font-semibold text-foreground">Posts</h1>
          <p className="mt-2 text-muted-foreground">게시글 목록이 들어갈 자리입니다.</p>
          <PostsCounter />
          <Link href="/" className="mt-6 inline-block text-sm text-muted-foreground underline hover:text-foreground">
            ← 홈으로
          </Link>
        </PostsStoreProvider>
      </div>
    </div>
  );
}
