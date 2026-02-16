import Link from "next/link";
import type { PostListItem } from "./api/getPosts";

type BlogCategoryViewProps = {
  categoryName: string;
  posts: PostListItem[];
};

export function BlogCategoryView({ categoryName, posts }: BlogCategoryViewProps) {
  return (
    <div className="px-6 py-8 font-sans">
      <h1 className="text-2xl font-semibold text-foreground">{categoryName}</h1>
      <p className="mt-1 text-sm text-muted-foreground">해당 카테고리 글 {posts.length}개</p>
      <ul className="mt-6 list-none space-y-2">
        {posts.map(({ slug, title }) => (
          <li key={slug}>
            <Link href={`/blog/${slug}`} className="text-foreground underline hover:text-muted-foreground">
              {title}
            </Link>
          </li>
        ))}
      </ul>
      {posts.length === 0 && <p className="mt-4 text-muted-foreground">아직 글이 없습니다.</p>}
    </div>
  );
}
