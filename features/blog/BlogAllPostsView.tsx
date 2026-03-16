import Image from "next/image";
import { redirect } from "next/navigation";
import { FileText, ChevronsLeftRight, BookDashed, ChevronLeft, ChevronRight } from "lucide-react";
import BlogLink from "./components/BlogLink";
import { ALL_POSTS_SLUG } from "./constants";
import { getPublishedPostsPage } from "./api/getPosts";

const POSTS_PER_PAGE = 12;

type BlogAllPostsViewProps = {
  searchParams: Promise<{ page?: string }>;
};

export async function BlogAllPostsView({ searchParams }: BlogAllPostsViewProps) {
  const { page } = await searchParams;
  const parsedPage = Number(page ?? "1");
  const currentPage = Number.isFinite(parsedPage) && parsedPage > 0 ? Math.floor(parsedPage) : 1;
  const { posts, totalCount, totalPages } = await getPublishedPostsPage(currentPage, POSTS_PER_PAGE);

  if (totalPages > 0 && currentPage > totalPages) {
    redirect(`/blog/${ALL_POSTS_SLUG}?page=${totalPages}`);
  }

  const startIndex = totalCount === 0 ? 0 : (currentPage - 1) * POSTS_PER_PAGE + 1;
  const endIndex = totalCount === 0 ? 0 : startIndex + posts.length - 1;
  const previousHref = currentPage <= 2 ? `/blog/${ALL_POSTS_SLUG}` : `/blog/${ALL_POSTS_SLUG}?page=${currentPage - 1}`;
  const nextHref = `/blog/${ALL_POSTS_SLUG}?page=${currentPage + 1}`;

  return (
    <div className="flex h-full flex-col bg-background">
      <header className="flex flex-wrap items-center gap-x-2 gap-y-1 border-b px-3 py-[5.5px]">
        <h1 className="text-lg font-semibold text-foreground">전체 보기</h1>
        <p className="mt-1 text-sm text-muted-foreground">{totalCount}개의 글</p>
        {totalCount > 0 && (
          <p className="mt-1 text-sm text-muted-foreground">
            {startIndex}-{endIndex}
          </p>
        )}
      </header>

      {posts.length === 0 ? (
        <div className="flex h-full flex-col items-center justify-center bg-accent/30">
          <BookDashed className="text-muted-foreground/20" size={44} />
        </div>
      ) : (
        <>
          <ul className="grid min-w-[800px] flex-1 grid-cols-2 gap-4 overflow-y-auto bg-accent/30 px-10 py-4 list-none">
            {posts.map(({ slug, title, excerpt, created_at, thumbnail_url, tags }) => (
              <li
                key={slug}
                className="relative min-w-62 shrink-0 rounded-md border transition-all duration-300 ease-out hover:-translate-y-[2px] hover:bg-accent group"
              >
                <div className="absolute right-2 top-3 flex h-4 w-4 items-center justify-center rounded-full bg-chart-2/70 pointer-events-none">
                  <ChevronsLeftRight
                    size={12}
                    className="text-white opacity-10 transition-opacity duration-200 group-hover:opacity-100"
                  />
                </div>
                <BlogLink href={`/blog/${encodeURIComponent(slug)}`}>
                  <article className="flex h-48 flex-col">
                    <div className="flex min-h-0 shrink-0 flex-row items-center gap-2 rounded-t-md bg-secondary p-2">
                      <FileText className="shrink-0 text-muted-foreground" size={16} />
                      <span className="min-w-0 truncate rounded-md px-2 font-semibold transition-all duration-300 ease-out group-hover:bg-chart-2/30">
                        {title}
                      </span>
                      {created_at != null && (
                        <time dateTime={created_at} className="shrink-0 pl-4 text-xs">
                          {new Date(created_at).toLocaleDateString("ko-KR")}
                        </time>
                      )}
                    </div>
                    <div className="flex h-full min-h-0 flex-col justify-between p-3">
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
                            {excerpt.length > 150 ? `${excerpt.slice(0, 150)}...` : excerpt}
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
                </BlogLink>
              </li>
            ))}
          </ul>

          <div className="flex items-center justify-between border-t bg-background px-6 py-3">
            <p className="text-sm text-muted-foreground">
              {currentPage} / {Math.max(totalPages, 1)} 페이지
            </p>
            <div className="flex items-center gap-2">
              {currentPage > 1 ? (
                <BlogLink
                  href={previousHref}
                  className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  <ChevronLeft size={16} />
                  이전
                </BlogLink>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-sm text-muted-foreground/40">
                  <ChevronLeft size={16} />
                  이전
                </span>
              )}
              {currentPage < totalPages ? (
                <BlogLink
                  href={nextHref}
                  className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  다음
                  <ChevronRight size={16} />
                </BlogLink>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-sm text-muted-foreground/40">
                  다음
                  <ChevronRight size={16} />
                </span>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
