import type { Session } from "@supabase/supabase-js";
import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";

type AuthStore = {
  session: Session | null;
  setSession: (session: Session | null) => void;
  /** 클라이언트에서 한 번 호출해 세션 동기화 시작. 구독 해제 함수 반환. */
  subscribeToAuth: () => () => void;
};

export const useAuthStore = create<AuthStore>(set => ({
  session: null,
  setSession: session => set({ session }),
  subscribeToAuth: () => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => set({ session }));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => set({ session }));
    return () => subscription.unsubscribe();
  },
}));
