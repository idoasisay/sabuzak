import type { Metadata } from "next";
import { BlogArticleView } from "@/features/blog";
import { getPostBySlug } from "@/features/blog/api/getPosts";
import { INFO_SLUG } from "@/features/blog/constants";

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;

  if (slug === INFO_SLUG) {
    return {
      title: "info",
      description: "블로그 소개",
    };
  }

  const post = await getPostBySlug(slug);
  if (!post) return { title: "글을 찾을 수 없음" };

  const description = post.excerpt?.slice(0, 160) ?? undefined;
  return {
    title: post.title,
    description,
    openGraph: {
      title: post.title,
      description,
      type: "article",
      ...(post.thumbnail_url && { images: [{ url: post.thumbnail_url }] }),
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  return <BlogArticleView params={params} />;
}
