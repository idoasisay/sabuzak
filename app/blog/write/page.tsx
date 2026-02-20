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

  if (!user) {
    return <LoginView slug={slug ?? undefined} returnTo={returnTo ?? undefined} />;
  }

  const [categories, tags, initialPost, drafts] = await Promise.all([
    getCategories(),
    getTags(),
    slug ? getPostForEdit(slug) : Promise.resolve(null),
    getDraftPosts(),
  ]);
  return <BlogWriteView categories={categories} tags={tags} initialPost={initialPost ?? undefined} drafts={drafts} />;
}
