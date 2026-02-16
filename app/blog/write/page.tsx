import { BlogWriteView } from "@/features/blog/BlogWriteView";
import { getCategories } from "@/features/blog/api/getCategories";
import { getTags } from "@/features/blog/api/getTags";

export default async function BlogWritePage() {
  const [categories, tags] = await Promise.all([getCategories(), getTags()]);
  return <BlogWriteView categories={categories} tags={tags} />;
}
