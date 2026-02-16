import { BlogArticleView } from "@/features/blog";

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  return <BlogArticleView params={params} />;
}
