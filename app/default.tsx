export default function Default() {
  return (
    <div className="flex min-h-[10rem] flex-col items-center justify-center gap-2 bg-background font-sans">
      <div
        className="h-6 w-6 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-foreground"
        aria-hidden
      />
      <span className="text-xs text-muted-foreground">Loading...</span>
    </div>
  );
}
