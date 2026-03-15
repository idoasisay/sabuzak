"use client";

import Tiptap from "@/components/Tiptap";
import type { CategoryItem, TagItem, PostForEdit, DraftListItem } from "@/features/blog";
import Link from "next/link";

type BlogWriteViewProps = {
  categories: CategoryItem[];
  tags: TagItem[];
  initialPost?: PostForEdit | null;
  drafts?: DraftListItem[];
  requestedSlug?: string | null;
};

export function BlogWriteView({ categories, tags, initialPost, drafts = [], requestedSlug }: BlogWriteViewProps) {
  const isMissingRequestedPost = Boolean(requestedSlug && !initialPost);

  if (isMissingRequestedPost) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center p-6">
        <div className="w-full max-w-lg rounded-xl border border-border bg-card p-6 text-center shadow-sm">
          <p className="text-lg font-semibold text-foreground">편집할 글을 찾지 못했어요.</p>
          <p className="mt-2 text-sm text-muted-foreground break-all">
            요청한 slug: <span className="font-mono text-foreground">{requestedSlug}</span>
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            주소가 잘못되었거나 이미 삭제된 글일 수 있어요. 목록으로 돌아가서 다시 선택해 주세요.
          </p>
          <div className="mt-5 flex justify-center">
            <Link
              href="/blog/info"
              className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              블로그로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <Tiptap categories={categories} tags={tags} initialPost={initialPost} drafts={drafts} />
    </div>
  );
}
