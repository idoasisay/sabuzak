import { notFound } from "next/navigation";
import { INFO_SLUG } from "./constants";
import { Info } from "./content/Info";
import { getPostBySlug } from "./api/getPosts";

type BlogArticleViewProps = {
  params: Promise<{ slug: string }>;
};

export async function BlogArticleView({ params }: BlogArticleViewProps) {
  const { slug } = await params;

  if (slug === INFO_SLUG) return <Info />;

  const post = await getPostBySlug(slug);
  if (!post) notFound();

  return (
    <article className="px-6 py-8 font-sans">
      <h1 className="text-2xl font-semibold text-foreground">{post.title}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{new Date(post.created_at).toLocaleDateString("ko-KR")}</p>
      <div className="prose mt-6 max-w-none text-foreground">
        {/* TODO: 마크다운 렌더링 */}
        <pre className="whitespace-pre-wrap font-sans text-sm">{post.content}</pre>
      </div>
    </article>
  );
}
