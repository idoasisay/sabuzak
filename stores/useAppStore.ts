import { create } from "zustand";

type Theme = "light" | "dark";

interface AppState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

export const useAppStore = create<AppState>(set => ({
  theme: "light",
  setTheme: theme => set({ theme }),
  toggleTheme: () => set(state => ({ theme: state.theme === "light" ? "dark" : "light" })),
}));
