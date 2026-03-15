import { createClient } from "@/lib/supabase/server";
import { BlogWriteView, getCategories, getTags, getPostForEdit, getDraftPosts } from "@/features/blog";
import { LoginView } from "@/features/auth";

type BlogWritePageProps = {
  searchParams: Promise<{ slug?: string; returnTo?: string }>;
};

export default async function BlogWritePage({ searchParams }: BlogWritePageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { slug, returnTo } = await searchParams;
  const requestedSlug = slug?.trim() ?? null;

  if (!user) {
    return <LoginView slug={requestedSlug ?? undefined} returnTo={returnTo ?? undefined} />;
  }

  const [categories, tags, initialPost, drafts] = await Promise.all([
    getCategories(),
    getTags(),
    requestedSlug ? getPostForEdit(requestedSlug) : Promise.resolve(null),
    getDraftPosts(),
  ]);
  return (
    <BlogWriteView
      categories={categories}
      tags={tags}
      initialPost={initialPost ?? undefined}
      drafts={drafts}
      requestedSlug={requestedSlug}
    />
  );
}
