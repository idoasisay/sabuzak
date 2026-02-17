import { redirect } from "next/navigation";
import { BlogCategoryView } from "./BlogCategoryView";
import { getCategoryBySlug } from "./api/getCategories";
import { getTagBySlug } from "./api/getTags";
import { getPostsByCategorySlug, getPostsByTagSlug } from "./api/getPosts";
import { INFO_SLUG } from "./constants";

type BlogViewProps = {
  searchParams: Promise<{ category?: string; tag?: string }>;
};

export async function BlogView({ searchParams }: BlogViewProps) {
  const { category: categorySlug, tag: tagSlug } = await searchParams;

  if (tagSlug) {
    const [tag, posts] = await Promise.all([getTagBySlug(tagSlug), getPostsByTagSlug(tagSlug)]);
    if (!tag) redirect(`/blog/${INFO_SLUG}`);
    return <BlogCategoryView categoryName={`태그: ${tag.name}`} posts={posts} />;
  }

  if (categorySlug) {
    const [category, posts] = await Promise.all([
      getCategoryBySlug(categorySlug),
      getPostsByCategorySlug(categorySlug),
    ]);
    if (!category) redirect(`/blog/${INFO_SLUG}`);
    return <BlogCategoryView categoryName={category.name} posts={posts} />;
  }

  redirect(`/blog/${INFO_SLUG}`);
}
