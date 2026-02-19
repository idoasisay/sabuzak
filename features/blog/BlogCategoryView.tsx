import Link from "next/link";
import type { PostListItem } from "./api/getPosts";
import { FileText, NotebookPen, ChevronsLeftRight } from "lucide-react";
import Image from "next/image";

type BlogCategoryViewProps = {
  categoryName: string;
  posts: PostListItem[];
};

export function BlogCategoryView({ categoryName, posts }: BlogCategoryViewProps) {
  console.log(posts);
  return (
    <div className="flex flex-col h-full">
      <header className="flex flex-row items-center p-[5.5px] px-3 gap-2 border-b">
        <h1 className="text-lg font-semibold text-foreground">{categoryName}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{posts.length}개의 글</p>
      </header>

      {posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full">
          <NotebookPen className="size-10 text-muted-foreground" />
          <p className="mt-6 text-muted-foreground">아직 글이 없습니다.</p>
        </div>
      ) : (
        <ul className="min-w-[800px] grid grid-cols-2 gap-4 list-none overflow-y-auto px-10 py-4">
          {posts.map(({ slug, title, excerpt, created_at, thumbnail_url, tags }) => (
            <li
              key={slug}
              className="shrink-0 min-w-62 relative border hover:bg-accent hover:translate-y-[-2px] group transition-all duration-300 ease-out rounded-md"
            >
              <div className="absolute right-2 top-3 flex items-center justify-center rounded-full w-4 h-4 bg-chart-2/70 pointer-events-none">
                <ChevronsLeftRight
                  size={12}
                  className="text-white opacity-10 transition-opacity duration-200 group-hover:opacity-100"
                />
              </div>
              <Link href={`/blog/${encodeURIComponent(slug)}`}>
                <article className="flex flex-col h-48">
                  <div className="flex flex-row items-center p-2 bg-secondary rounded-t-md gap-2 min-h-0 shrink-0">
                    <FileText className="text-muted-foreground shrink-0" size={16} />
                    <span className="font-semibold min-w-0 truncate group-hover:bg-chart-2/30 rounded-md px-2 transition-all duration-300 ease-out">
                      {title}
                    </span>
                    {created_at != null && (
                      <time dateTime={created_at} className="text-xs pl-4 shrink-0">
                        {new Date(created_at).toLocaleDateString("ko-KR")}
                      </time>
                    )}
                  </div>
                  <div className="p-3 flex flex-col justify-between h-full min-h-0">
                    <div className="flex flex-row items-start gap-2">
                      {thumbnail_url && (
                        <Image
                          src={thumbnail_url}
                          alt={title}
                          width={100}
                          height={100}
                          unoptimized={true}
                          className="shrink-0 rounded object-cover"
                          role="presentation"
                        />
                      )}
                      {excerpt != null && excerpt !== "" && (
                        <p className="line-clamp-2 text-sm text-muted-foreground">
                          {excerpt.length > 150 ? `${excerpt.slice(0, 150)}…` : excerpt}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                      {tags != null && tags.length > 0 && (
                        <ul className="flex flex-wrap gap-1.5 pt-2" aria-label="태그">
                          {tags.map(tag => (
                            <li key={tag.id}>
                              <span className="rounded-md border border-border bg-muted/50 px-2 py-0.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground">
                                {tag.name}
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </article>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
