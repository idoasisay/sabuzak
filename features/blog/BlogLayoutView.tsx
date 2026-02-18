import { Suspense } from "react";
import { BlogSelectionBox } from "./components/BlogSelectionBox";
import { BlogSidebar } from "./components/BlogSidebar";
import { BlogMain } from "./components/BlogMain";
import { getCategoriesWithPosts } from "./api/getCategories";
import { getRecentPosts } from "./api/getPosts";

function SidebarFallback() {
  return (
    <aside
      className="flex shrink-0 flex-col overflow-hidden border-r border-border bg-background"
      style={{ width: "14rem" }}
    >
      <div className="flex h-10 shrink-0 items-center border-b border-border bg-accent" />
      <div className="min-w-0 flex-1 bg-accent/30" />
    </aside>
  );
}

export default async function BlogLayoutView({ children }: { children: React.ReactNode }) {
  const [categoriesWithPosts, recentPosts] = await Promise.all([getCategoriesWithPosts(), getRecentPosts(7)]);

  return (
    <BlogSelectionBox>
      <Suspense fallback={<SidebarFallback />}>
        <BlogSidebar categories={categoriesWithPosts} posts={recentPosts} />
      </Suspense>
      <BlogMain>{children}</BlogMain>
    </BlogSelectionBox>
  );
}
