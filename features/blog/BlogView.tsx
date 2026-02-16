import { redirect } from "next/navigation";
import { BlogCategoryView } from "./BlogCategoryView";
import { getCategoryBySlug } from "./api/getCategories";
import { getPostsByCategorySlug } from "./api/getPosts";
import { INFO_SLUG } from "./constants";

type BlogViewProps = {
  searchParams: Promise<{ category?: string }>;
};

export async function BlogView({ searchParams }: BlogViewProps) {
  const { category: categorySlug } = await searchParams;

  // 카테고리 조회 & 글 목록 조회
  const [category, posts] = await Promise.all([
    getCategoryBySlug(categorySlug ?? ""),
    getPostsByCategorySlug(categorySlug ?? ""),
  ]);

  // DB에 없을 때
  if (!category) {
    redirect(`/blog/${INFO_SLUG}`);
  }

  return <BlogCategoryView categoryName={category.name} posts={posts} />;
}
