import { createClient } from "@/lib/supabase/server";

export type TagItem = {
  id: string;
  name: string;
  slug: string;
};

export async function getTags(): Promise<TagItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("tags").select("id, name, slug").order("name", { ascending: true });

  if (error) return [];
  return (data ?? []) as TagItem[];
}
