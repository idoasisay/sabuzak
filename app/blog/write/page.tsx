import { BlogWriteView, getCategories, getTags } from "@/features/blog";

export default async function BlogWritePage() {
  const [categories, tags] = await Promise.all([getCategories(), getTags()]);
  return <BlogWriteView categories={categories} tags={tags} />;
}
