import type { Course, CourseData, CourseStatus, Quarter } from "../types";

/** Indexed, queryable view over the course catalog. */
export class Catalog {
  readonly byId: Map<string, Course>;
  readonly generatedAt: string;
  readonly source: string;
  /** course id -> ids of courses that list it as a prerequisite ("unlocks"). */
  private dependents: Map<string, string[]>;

  constructor(data: CourseData) {
    this.byId = new Map();
    this.dependents = new Map();
    this.generatedAt = data.generatedAt;
    this.source = data.source;
    for (const c of data.courses) this.byId.set(c.id, c);
    for (const c of data.courses) {
      for (const p of c.prereqs) {
        if (!this.dependents.has(p)) this.dependents.set(p, []);
        this.dependents.get(p)!.push(c.id);
      }
    }
  }

  get(id: string): Course | undefined {
    return this.byId.get(id);
  }

  /** Courses that become reachable after `id` (i.e. list `id` as a prereq). */
  unlocks(id: string): Course[] {
    return (this.dependents.get(id) ?? [])
      .map((d) => this.byId.get(d))
      .filter((c): c is Course => !!c)
      .sort((a, b) => a.id.localeCompare(b.id));
  }

  /** Fuzzy search by id or title for the course picker. */
  search(query: string, limit = 25): Course[] {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const compact = q.replace(/\s+/g, "");
    const out: { c: Course; score: number }[] = [];
    for (const c of this.byId.values()) {
      const id = c.id.toLowerCase();
      const idCompact = id.replace(/\s+/g, "");
      const title = c.title.toLowerCase();
      let score = -1;
      if (idCompact === compact) score = 0;
      else if (idCompact.startsWith(compact)) score = 1;
      else if (title.startsWith(q)) score = 2;
      else if (id.includes(q) || idCompact.includes(compact)) score = 3;
      else if (title.includes(q)) score = 4;
      if (score >= 0) out.push({ c, score });
    }
    out.sort((a, b) => a.score - b.score || a.c.id.localeCompare(b.c.id));
    return out.slice(0, limit).map((o) => o.c);
  }
}

/** Parse a usable integer credit value from the catalog's raw credits string. */
export function creditsOf(course: Course | undefined): number {
  if (!course) return 0;
  const nums = (course.credits.match(/\d+/g) ?? []).map(Number);
  if (nums.length === 0) return 5;
  // Ranges like "1-5" -> take the higher, capped at 5 (typical full load).
  const value = Math.max(...nums);
  return Math.min(Math.max(value, 1), 5);
}

/** Classify a course relative to the set of completed course ids. */
export function statusOf(
  course: Course,
  completed: Set<string>,
): CourseStatus {
  if (completed.has(course.id)) return "completed";
  if (course.prereqs.length === 0) return "available";
  return course.prereqs.every((p) => completed.has(p)) ? "available" : "locked";
}

/** True if every prerequisite of `id` is in `have`. Unknown courses are permissive. */
export function prereqsSatisfied(
  catalog: Catalog,
  id: string,
  have: Set<string>,
): boolean {
  const c = catalog.get(id);
  if (!c) return true;
  return c.prereqs.every((p) => have.has(p));
}

export async function loadCatalog(): Promise<Catalog> {
  const url = `${import.meta.env.BASE_URL}data/courses.json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load course data (${res.status})`);
  const data = (await res.json()) as CourseData;
  return new Catalog(data);
}

export const ALL_QUARTERS: Quarter[] = ["A", "W", "Sp", "S"];
