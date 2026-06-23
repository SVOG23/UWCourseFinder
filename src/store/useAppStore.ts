import { create } from "zustand";
import { persist } from "zustand/middleware";

export type View = "plan" | "map";

interface AppState {
  programId: string | null;
  specId: string | null;
  completed: string[];
  startYear: number;
  creditCap: number;
  view: View;

  setProgram: (id: string | null) => void;
  setSpec: (id: string | null) => void;
  addCompleted: (id: string) => void;
  addManyCompleted: (ids: string[]) => void;
  removeCompleted: (id: string) => void;
  toggleCompleted: (id: string) => void;
  clearCompleted: () => void;
  setStartYear: (year: number) => void;
  setCreditCap: (cap: number) => void;
  setView: (view: View) => void;
  resetAll: () => void;
}

const currentYear = new Date().getFullYear();

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      programId: null,
      specId: null,
      completed: [],
      startYear: currentYear,
      creditCap: 15,
      view: "plan",

      setProgram: (id) => set({ programId: id, specId: id ? "none" : null }),
      setSpec: (id) => set({ specId: id }),
      addCompleted: (id) =>
        set((s) =>
          s.completed.includes(id)
            ? s
            : { completed: [...s.completed, id].sort() },
        ),
      addManyCompleted: (ids) =>
        set((s) => {
          const next = new Set(s.completed);
          for (const id of ids) next.add(id);
          return { completed: [...next].sort() };
        }),
      removeCompleted: (id) =>
        set((s) => ({ completed: s.completed.filter((c) => c !== id) })),
      toggleCompleted: (id) =>
        set((s) =>
          s.completed.includes(id)
            ? { completed: s.completed.filter((c) => c !== id) }
            : { completed: [...s.completed, id].sort() },
        ),
      clearCompleted: () => set({ completed: [] }),
      setStartYear: (year) => set({ startYear: year }),
      setCreditCap: (cap) => set({ creditCap: cap }),
      setView: (view) => set({ view }),
      resetAll: () =>
        set({
          programId: null,
          specId: null,
          completed: [],
          startYear: currentYear,
          view: "plan",
        }),
    }),
    { name: "uwcf-state-v1" },
  ),
);
