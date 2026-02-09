export function HomeView() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 font-sans">
      <p className="text-foreground">Today&apos;s Date: {new Date().toLocaleDateString()}</p>
    </div>
  );
}
