"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { deletePost } from "@/features/blog/actions/deletePost";

type ArticleActionsProps = {
  slug: string;
};

export function ArticleActions({ slug }: ArticleActionsProps) {
  async function handleDelete() {
    if (!confirm("이 글을 삭제할까요?")) return;
    const result = await deletePost(slug);
    if (result.ok) {
      window.location.href = "/blog/info";
    } else {
      alert(result.error);
    }
  }

  return (
    <div className="flex gap-2 select-none">
      <Button
        variant="ghost"
        size="xs"
        asChild
        className="text-foreground/50 hover:text-foreground hover:bg-transparent"
      >
        <Link href={`/blog/write?slug=${encodeURIComponent(slug)}`}>수정</Link>
      </Button>
      <Button
        variant="ghost"
        size="xs"
        type="button"
        onClick={handleDelete}
        className="text-destructive/50 hover:text-destructive hover:bg-transparent"
      >
        삭제
      </Button>
    </div>
  );
}
