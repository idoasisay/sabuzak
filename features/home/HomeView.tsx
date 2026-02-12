import { createClient } from "@/lib/supabase/server";

export async function HomeView() {
  // 1. 서버용 Supabase 클라이언트 생성
  const supabase = createClient();

  // 2. 데이터 가져오기 (아까 만든 categories 테이블)
  const { data: categories, error } = await (await supabase).from("categories").select("*");
  // 에러 처리 (필수!)
  if (error) {
    return <div>에러가 발생했어요: {error.message}</div>;
  }
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 font-sans">
      <p className="text-foreground">Today&apos;s Date: {new Date().toLocaleDateString()}</p>
      <p>{categories?.map(category => category.name).join(", ")}</p>
    </div>
  );
}
