import { createClient } from "@/lib/supabase/server";

export async function HomeView() {
  const supabase = await createClient();
  const { data: categories, error } = await supabase.from("categories").select("*");
  // 에러 처리 (필수!)
  if (error) {
    console.error("Failed to fetch categories:", error.message, error.details);
    return <div>에러가 발생했어요: {error.message}</div>;
  }
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 font-sans">
      <p className="text-foreground">Today&apos;s Date: {new Date().toLocaleDateString()}</p>
      <p>{categories?.map(category => category.name).join(", ")}</p>
    </div>
  );
}
