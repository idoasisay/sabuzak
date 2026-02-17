import Link from "next/link";
import { notFound } from "next/navigation";
import { INFO_SLUG } from "./constants";
import { Info } from "./content/Info";
import { getPostBySlug } from "./api/getPosts";
import { ArticleActions } from "./components/ArticleActions";

type BlogArticleViewProps = {
  params: Promise<{ slug: string }>;
};

export async function BlogArticleView({ params }: BlogArticleViewProps) {
  const { slug } = await params;

  if (slug === INFO_SLUG) return <Info />;

  const post = await getPostBySlug(slug);
  if (!post) notFound();

  return (
    <article>
      <div className="font-sans border-b border-border py-8 text-center flex flex-col items-center">
        <h1 className="text-3xl font-semibold text-foreground">{post.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{new Date(post.created_at).toLocaleDateString("ko-KR")}</p>
        {post.tags && post.tags.length > 0 && (
          <ul className="mt-2 flex flex-wrap justify-center gap-2">
            {post.tags.map(tag => (
              <li key={tag.id}>
                <Link
                  href={`/blog?tag=${encodeURIComponent(tag.slug)}`}
                  className="rounded-md border border-border bg-muted/50 px-2 py-0.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  {tag.name}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="border-b border-border flex justify-center">
        <ArticleActions slug={slug} />
      </div>
      <div
        className="p-4 prose max-w-none text-foreground tiptap-editor"
        dangerouslySetInnerHTML={{ __html: post.content ?? "" }}
      />
    </article>
  );
}
