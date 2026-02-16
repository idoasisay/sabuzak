import { Suspense } from "react";
import { BlogSelectionBox } from "./components/BlogSelectionBox";
import { BlogSidebar } from "./components/BlogSidebar";
import { getCategoriesWithPosts } from "./api/getCategories";
import { INFO_LIST_ITEM } from "./constants";

const SIDEBAR_POSTS = [INFO_LIST_ITEM];

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
  const categoriesWithPosts = await getCategoriesWithPosts();

  return (
    <BlogSelectionBox>
      <Suspense fallback={<SidebarFallback />}>
        <BlogSidebar categories={categoriesWithPosts} posts={SIDEBAR_POSTS} />
      </Suspense>
      <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">{children}</main>
    </BlogSelectionBox>
  );
}
