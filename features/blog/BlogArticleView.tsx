import { notFound } from "next/navigation";
import { INFO_SLUG } from "./constants";
import { Info } from "./content/Info";
import { getPostBySlug } from "./api/getPosts";
import { ArticleActions } from "./components/ArticleActions";
import { ArticleHeader } from "./components/ArticleHeader";

type BlogArticleViewProps = {
  params: Promise<{ slug: string }>;
};

export async function BlogArticleView({ params }: BlogArticleViewProps) {
  const { slug } = await params;

  if (slug === INFO_SLUG) return <Info />;

  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const dateString = new Date(post.created_at).toLocaleDateString("ko-KR");
  const tags = post.tags ?? [];

  return (
    <article className="bg-background flex min-h-full flex-col">
      <ArticleHeader title={post.title} dateString={dateString} tags={tags} />
      <div className="border-b border-border flex justify-center">
        <ArticleActions slug={slug} />
      </div>
      <div className="flex-1 bg-border/20">
        <div className="max-w-[1080px] mx-auto min-h-full bg-background">
          <div
            className="prose max-w-none text-foreground tiptap-editor"
            dangerouslySetInnerHTML={{ __html: post.content ?? "" }}
          />
        </div>
      </div>
    </article>
  );
}
