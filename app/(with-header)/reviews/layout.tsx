export default function ReviewsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="reviews-layout">
      <nav className="border-b border-border px-4 py-3">
        <p className="text-sm font-medium text-muted-foreground">Reviews 레이아웃 (이 구간 공통)</p>
      </nav>
      <main>{children}</main>
    </div>
  );
}
