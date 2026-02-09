export default function PostsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="posts-layout">
      <nav className="border-b border-border px-4 py-3">
        <p className="text-sm font-medium text-muted-foreground">Posts 레이아웃 (이 구간 공통)</p>
      </nav>
      <main>{children}</main>
    </div>
  );
}
