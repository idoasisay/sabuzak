import { BlogWriteView, getCategories, getTags, getPostForEdit } from "@/features/blog";

type BlogWritePageProps = {
  searchParams: Promise<{ slug?: string }>;
};

export default async function BlogWritePage({ searchParams }: BlogWritePageProps) {
  const { slug } = await searchParams;
  const [categories, tags, initialPost] = await Promise.all([
    getCategories(),
    getTags(),
    slug ? getPostForEdit(slug) : Promise.resolve(null),
  ]);
  return <BlogWriteView categories={categories} tags={tags} initialPost={initialPost ?? undefined} />;
}
