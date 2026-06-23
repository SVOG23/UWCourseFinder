import {
  QUARTER_NAME,
  type DisplayStatus,
  type PlanMap,
  type Program,
  type Quarter,
  type QuarterMeta,
} from "../types";
import { Catalog, creditsOf } from "./courses";
import { buildPlan } from "./planner";

const ACCENT: Record<Quarter, string> = {
  A: "#c9742e", // autumn
  W: "#5b7fb0", // winter
  Sp: "#5e9e6f", // spring
  S: "#9a7bb0", // summer
};

/** Calendar order within a year so Autumn (Sep) sorts after Spring (Apr). */
const SEASON_ORDER: Record<Quarter, number> = { W: 0, Sp: 1, S: 2, A: 3 };

export function termIndex(q: Quarter, year: number): number {
  return year * 4 + SEASON_ORDER[q];
}

/** The index of the quarter we're currently in, from today's date. */
export function currentTermIndex(now = new Date()): number {
  const m = now.getMonth(); // 0-11
  let q: Quarter;
  if (m <= 2) q = "W";
  else if (m <= 5) q = "Sp";
  else if (m <= 7) q = "S";
  else q = "A";
  return termIndex(q, now.getFullYear());
}

export function quarterId(q: Quarter, year: number): string {
  return `${q}${year}`;
}

/** Short label for the current term, e.g. "SPR 2026". */
export function currentTermShort(now = new Date()): string {
  const m = now.getMonth();
  const q = m <= 2 ? "WIN" : m <= 5 ? "SPR" : m <= 7 ? "SUM" : "AUT";
  return `${q} ${now.getFullYear()}`;
}

/** Seed a dashboard plan (real courses only) from the auto-scheduler. */
export function buildDashPlan(
  catalog: Catalog,
  program: Program,
  specId: string | null,
  startYear: number,
): { plan: PlanMap; quarters: QuarterMeta[] } {
  const result = buildPlan(catalog, program, specId, new Set(), { startYear });
  const plan: PlanMap = {};
  const quarters: QuarterMeta[] = [];
  for (const t of result.terms) {
    const real = t.items.filter((i) => !i.isPlaceholder).map((i) => i.id);
    if (real.length === 0) continue;
    const id = quarterId(t.quarter, t.year);
    plan[id] = real;
    quarters.push({
      id,
      term: `${QUARTER_NAME[t.quarter]} ${t.year}`,
      quarter: t.quarter,
      year: t.year,
      accent: ACCENT[t.quarter],
    });
  }
  return { plan, quarters };
}

export function quarterContaining(courseId: string, plan: PlanMap): string | null {
  for (const [qid, ids] of Object.entries(plan)) {
    if (ids.includes(courseId)) return qid;
  }
  return null;
}

/** completed = scheduled in a past quarter · planned = in plan now/future · else available. */
export function displayStatus(
  courseId: string,
  plan: PlanMap,
  quarters: QuarterMeta[],
  nowIndex = currentTermIndex(),
): DisplayStatus {
  const qid = quarterContaining(courseId, plan);
  if (!qid) return "available";
  const q = quarters.find((x) => x.id === qid);
  if (!q) return "planned";
  return termIndex(q.quarter, q.year) < nowIndex ? "completed" : "planned";
}

/** Best default quarter to add a course to: first non-past quarter, else the last. */
export function defaultAddQuarter(quarters: QuarterMeta[]): string | null {
  if (quarters.length === 0) return null;
  const now = currentTermIndex();
  const future = quarters.find((q) => termIndex(q.quarter, q.year) >= now);
  return (future ?? quarters[quarters.length - 1]).id;
}

export function planCredits(
  catalog: Catalog,
  plan: PlanMap,
  quarters: QuarterMeta[],
  which: DisplayStatus,
): number {
  let total = 0;
  for (const ids of Object.values(plan)) {
    for (const id of ids) {
      if (displayStatus(id, plan, quarters) === which) total += creditsOf(catalog.get(id));
    }
  }
  return total;
}
