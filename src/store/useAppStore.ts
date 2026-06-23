import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PlanMap, QuarterMeta } from "../types";
import { Catalog } from "../lib/courses";
import { getProgram } from "../data/programs";
import { buildDashPlan } from "../lib/plan";

type Tab = "plan" | "map";

interface AppState {
  programId: string;
  specId: string;
  plan: PlanMap;
  quarters: QuarterMeta[];
  startYear: number;
  seededFor: string | null;

  // ephemeral UI state
  tab: Tab;
  selected: string | null;
  addingTo: string | null;
  query: string;

  ensureSeed: (catalog: Catalog) => void;
  setProgram: (catalog: Catalog, id: string) => void;
  setSpec: (catalog: Catalog, id: string) => void;
  regenerate: (catalog: Catalog) => void;
  addToQuarter: (courseId: string, quarterId: string) => void;
  removeFromPlan: (courseId: string) => void;
  setTab: (t: Tab) => void;
  setSelected: (id: string | null) => void;
  setAddingTo: (id: string | null) => void;
  setQuery: (q: string) => void;
}

const DEFAULT_PROGRAM = "cse-bs";
const DEFAULT_START_YEAR = new Date().getFullYear() - 2;

const key = (p: string, s: string) => `${p}:${s}`;

function seed(
  set: (partial: Partial<AppState>) => void,
  catalog: Catalog,
  programId: string,
  specId: string,
  startYear: number,
) {
  const program = getProgram(programId);
  if (!program) return;
  const { plan, quarters } = buildDashPlan(catalog, program, specId, startYear);
  set({ plan, quarters, seededFor: key(programId, specId), selected: null, addingTo: null });
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      programId: DEFAULT_PROGRAM,
      specId: "none",
      plan: {},
      quarters: [],
      startYear: DEFAULT_START_YEAR,
      seededFor: null,

      tab: "plan",
      selected: null,
      addingTo: null,
      query: "",

      ensureSeed: (catalog) => {
        const s = get();
        if (s.seededFor !== key(s.programId, s.specId) || s.quarters.length === 0) {
          seed(set, catalog, s.programId, s.specId, s.startYear);
        }
      },

      setProgram: (catalog, id) => {
        const program = getProgram(id);
        const specId = program?.specializations?.[0]?.id ?? "none";
        set({ programId: id, specId, query: "" });
        seed(set, catalog, id, specId, get().startYear);
      },

      setSpec: (catalog, id) => {
        set({ specId: id });
        seed(set, catalog, get().programId, id, get().startYear);
      },

      regenerate: (catalog) => {
        const s = get();
        seed(set, catalog, s.programId, s.specId, s.startYear);
      },

      addToQuarter: (courseId, quarterId) =>
        set((s) => {
          const plan: PlanMap = {};
          for (const q of Object.keys(s.plan)) {
            plan[q] = s.plan[q].filter((x) => x !== courseId);
          }
          plan[quarterId] = [...(plan[quarterId] ?? []), courseId];
          return { plan, addingTo: null };
        }),

      removeFromPlan: (courseId) =>
        set((s) => {
          const plan: PlanMap = {};
          for (const q of Object.keys(s.plan)) {
            plan[q] = s.plan[q].filter((x) => x !== courseId);
          }
          return { plan };
        }),

      setTab: (tab) => set({ tab }),
      setSelected: (selected) => set({ selected }),
      setAddingTo: (addingTo) => set({ addingTo }),
      setQuery: (query) => set({ query }),
    }),
    {
      name: "uwcf-dash-v1",
      partialize: (s) => ({
        programId: s.programId,
        specId: s.specId,
        plan: s.plan,
        quarters: s.quarters,
        startYear: s.startYear,
        seededFor: s.seededFor,
        tab: s.tab,
      }),
    },
  ),
);
