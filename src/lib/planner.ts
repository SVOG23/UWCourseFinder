import type {
  Plan,
  PlanItem,
  PlannedTerm,
  Program,
  Quarter,
  Requirement,
  RequirementProgress,
} from "../types";
import { Catalog, creditsOf } from "./courses";
import { effectiveRequirements } from "../data/programs";

const PLAN_QUARTERS: Quarter[] = ["A", "W", "Sp"]; // summer skipped by default
const DEFAULT_CAP = 15; // credits per quarter (UW full-time ≈ 12–18)
const MAX_TERMS = 18; // safety cap (6 years)

export interface PlanOptions {
  creditCap?: number;
  startQuarter?: Quarter; // currently Autumn-start is fully supported
  startYear?: number;
}

function makeCourseItem(
  catalog: Catalog,
  id: string,
  requirementId: string,
): PlanItem {
  const c = catalog.get(id);
  return {
    id,
    title: c?.title ?? id,
    credits: creditsOf(c),
    isPlaceholder: false,
    requirementId,
    prereqs: c?.prereqs ?? [],
  };
}

/** Order candidate courses for *selection* within a requirement. */
function selectionSort(catalog: Catalog, prefer400: boolean) {
  return (a: string, b: string) => {
    const ca = catalog.get(a);
    const cb = catalog.get(b);
    const la = ca?.level ?? 0;
    const lb = cb?.level ?? 0;
    if (prefer400 && la !== lb) return lb - la; // higher level first
    if (!prefer400 && la !== lb) return la - lb; // lower level first
    return a.localeCompare(b);
  };
}

/** Concrete remaining items needed to satisfy a single requirement. */
function remainingForRequirement(
  catalog: Catalog,
  req: Requirement,
  completed: Set<string>,
): PlanItem[] {
  if (req.kind === "all") {
    return req.courses
      .filter((id) => !completed.has(id))
      .map((id) => makeCourseItem(catalog, id, req.id));
  }

  if (req.kind === "chooseN") {
    const n = req.n ?? 1;
    const doneCount = req.courses.filter((id) => completed.has(id)).length;
    const need = Math.max(0, n - doneCount);
    if (need === 0) return [];
    const picks = req.courses
      .filter((id) => !completed.has(id))
      .sort(selectionSort(catalog, !!req.prefer400))
      .slice(0, need);
    return picks.map((id) => makeCourseItem(catalog, id, req.id));
  }

  // credits bucket
  const target = req.credits ?? 0;
  let done = 0;
  for (const id of req.courses) {
    if (completed.has(id)) done += creditsOf(catalog.get(id));
  }
  let remaining = target - done;
  if (remaining <= 0) return [];

  const items: PlanItem[] = [];
  const candidates = req.courses
    .filter((id) => !completed.has(id))
    .sort(selectionSort(catalog, !!req.prefer400));
  for (const id of candidates) {
    if (remaining <= 0) break;
    const item = makeCourseItem(catalog, id, req.id);
    items.push(item);
    remaining -= item.credits;
  }
  // Free-choice credits (no concrete courses) become flexible slots.
  let slot = 0;
  while (remaining > 0) {
    const credits = Math.min(5, remaining);
    items.push({
      id: `bucket:${req.id}:${slot++}`,
      title: `${req.label} — pick ${credits} cr`,
      credits,
      isPlaceholder: true,
      requirementId: req.id,
      prereqs: [],
    });
    remaining -= credits;
  }
  return items;
}

function offeredOK(item: PlanItem, q: Quarter, catalog: Catalog, relaxed: boolean) {
  if (relaxed || item.isPlaceholder) return true;
  const c = catalog.get(item.id);
  if (!c || c.offered.length === 0) return true;
  return c.offered.includes(q);
}

/** Build a quarter-by-quarter plan from the program + completed courses. */
export function buildPlan(
  catalog: Catalog,
  program: Program,
  specId: string | null,
  completed: Set<string>,
  options: PlanOptions = {},
): Plan {
  const cap = options.creditCap ?? DEFAULT_CAP;
  const startYear = options.startYear ?? new Date().getFullYear();

  const reqs = effectiveRequirements(program, specId);

  // 1. Gather concrete remaining items, de-duplicating real courses.
  const seen = new Set<string>();
  let needed: PlanItem[] = [];
  for (const req of reqs) {
    for (const item of remainingForRequirement(catalog, req, completed)) {
      if (!item.isPlaceholder) {
        if (seen.has(item.id)) continue;
        seen.add(item.id);
      }
      needed.push(item);
    }
  }
  // 2. Universe of real courses whose prerequisites we enforce ordering on.
  //    The scraped catalog stores prereqs as a flat list that can't express
  //    UW's "one of / all of" logic, so chasing the full ancestor graph drags
  //    in remedial and alternate-track chains. We instead trust the curated
  //    program coursework and only sequence prerequisites *within* it; prereqs
  //    outside this set are assumed satisfied by placement, gen-eds, or
  //    alternates and are surfaced for review rather than auto-scheduled.
  const universe = new Set<string>(completed);
  for (const it of needed) if (!it.isPlaceholder) universe.add(it.id);

  // 2b. Top up with generic elective credits so the plan reaches the degree
  //     minimum (UW requires 180). This accounts for credits already earned and
  //     everything else we've scheduled.
  let accounted = needed.reduce((s, it) => s + it.credits, 0);
  for (const id of completed) accounted += creditsOf(catalog.get(id));
  let gap = program.totalCreditsForDegree - accounted;
  let fillIndex = 0;
  while (gap > 0) {
    const c = Math.min(5, gap);
    needed.push({
      id: `bucket:elective:${fillIndex++}`,
      title: `Elective — pick ${c} cr`,
      credits: c,
      isPlaceholder: true,
      requirementId: "elective",
      prereqs: [],
    });
    gap -= c;
  }

  // 3. Pre-compute how many needed courses each course unlocks (scheduling weight).
  const unlockWeight = new Map<string, number>();
  for (const it of needed) {
    for (const p of it.prereqs) {
      unlockWeight.set(p, (unlockWeight.get(p) ?? 0) + 1);
    }
  }

  const rank = (it: PlanItem): number => {
    // Lower sorts first. Real courses before placeholders; high-unlock & low level first.
    const placeholderPenalty = it.isPlaceholder ? 1_000_000 : 0;
    const weight = unlockWeight.get(it.id) ?? 0;
    const level = catalog.get(it.id)?.level ?? 999;
    return placeholderPenalty - weight * 1000 + level;
  };

  const done = new Set(completed);
  const terms: PlannedTerm[] = [];
  let index = 0;
  let relaxed = false;

  while (needed.length > 0 && terms.length < MAX_TERMS) {
    const quarter = PLAN_QUARTERS[index % PLAN_QUARTERS.length];
    const academicYearStart = startYear + Math.floor(index / PLAN_QUARTERS.length);
    const year = quarter === "A" ? academicYearStart : academicYearStart + 1;

    const placed = new Set<string>();
    const items: PlanItem[] = [];
    let credits = 0;

    while (true) {
      const candidates = needed.filter(
        (it) =>
          !placed.has(it.id) &&
          credits + it.credits <= cap &&
          it.prereqs.every((p) => !universe.has(p) || done.has(p)) &&
          offeredOK(it, quarter, catalog, relaxed),
      );
      if (candidates.length === 0) break;
      candidates.sort((a, b) => rank(a) - rank(b));
      const pick = candidates[0];
      items.push(pick);
      placed.add(pick.id);
      credits += pick.credits;
    }

    if (items.length === 0) {
      // No progress this quarter — relax the "offered" constraint once, then bail.
      if (!relaxed) {
        relaxed = true;
        continue;
      }
      break;
    }

    for (const it of items) if (!it.isPlaceholder) done.add(it.id);
    needed = needed.filter((it) => !placed.has(it.id));
    terms.push({ index: terms.length, quarter, year, items, credits });
    relaxed = false;
    index++;
  }

  return {
    terms,
    leftover: needed,
    totalPlannedCredits: terms.reduce((s, t) => s + t.credits, 0),
  };
}

// ---- Progress -------------------------------------------------------------

export function requirementProgress(
  catalog: Catalog,
  program: Program,
  specId: string | null,
  completed: Set<string>,
): RequirementProgress[] {
  const reqs = effectiveRequirements(program, specId);
  return reqs.map((req) => {
    const completedCourses = req.courses.filter((id) => completed.has(id));
    const remainingCourses = req.courses.filter((id) => !completed.has(id));

    if (req.kind === "all") {
      const total = req.courses.length;
      const done = completedCourses.length;
      return {
        requirement: req,
        satisfied: done >= total,
        detail: `${done} / ${total} courses`,
        completedCourses,
        remainingCourses,
        fraction: total ? done / total : 1,
      };
    }
    if (req.kind === "chooseN") {
      const n = req.n ?? 1;
      const done = Math.min(n, completedCourses.length);
      return {
        requirement: req,
        satisfied: done >= n,
        detail: `${done} / ${n} courses`,
        completedCourses,
        remainingCourses,
        fraction: n ? done / n : 1,
      };
    }
    // credits
    const target = req.credits ?? 0;
    const done = completedCourses.reduce(
      (s, id) => s + creditsOf(catalog.get(id)),
      0,
    );
    const free = req.courses.length === 0;
    return {
      requirement: req,
      satisfied: !free && done >= target,
      detail: free
        ? `${target} cr (self-tracked)`
        : `${done} / ${target} credits`,
      completedCourses,
      remainingCourses,
      fraction: target ? Math.min(1, done / target) : 1,
    };
  });
}

export function completedCredits(catalog: Catalog, completed: Set<string>): number {
  let total = 0;
  for (const id of completed) total += creditsOf(catalog.get(id));
  return total;
}
