// Quarters in UW's academic calendar. "S" = Summer (usually skipped in planning).
export type Quarter = "A" | "W" | "Sp" | "S";

export const QUARTER_NAME: Record<Quarter, string> = {
  A: "Autumn",
  W: "Winter",
  Sp: "Spring",
  S: "Summer",
};

/** A single course, as produced by scripts/build_data.py. */
export interface Course {
  id: string; // "CSE 143"
  dept: string; // "CSE"
  num: string; // "143"
  title: string;
  credits: string; // raw catalog string, e.g. "5" or "1-5"
  prereqs: string[]; // course ids this course lists as prerequisites
  offered: Quarter[]; // quarters offered; [] = unknown
  areas: string; // UW Areas of Knowledge, e.g. "NW", "VLPA"
  level: number; // 100, 200, 300, 400, 500
}

export interface CourseData {
  generatedAt: string;
  campus: string;
  source: string;
  count: number;
  courses: Course[];
}

// ---- Degree program model -------------------------------------------------

export type RequirementKind = "all" | "chooseN" | "credits";

export interface Requirement {
  id: string;
  label: string;
  kind: RequirementKind;
  /** Candidate course ids. For "credits" this may be empty (free-choice bucket). */
  courses: string[];
  /** chooseN: number of courses required from `courses`. */
  n?: number;
  /** credits: number of credits required from this category. */
  credits?: number;
  /** When picking for chooseN/credits, prefer 400-level courses (e.g. CSE core). */
  prefer400?: boolean;
  note?: string;
}

export interface Specialization {
  id: string;
  name: string;
  note?: string;
  /** Extra requirements layered on top of the program's base requirements. */
  addsRequirements?: Requirement[];
}

export interface Program {
  id: string;
  name: string;
  school: string;
  degreeType: string;
  description?: string;
  sourceUrl?: string;
  /** Total credits required to earn the degree (UW minimum is 180). */
  totalCreditsForDegree: number;
  requirements: Requirement[];
  specializations?: Specialization[];
}

// ---- Planner output -------------------------------------------------------

export type CourseStatus = "completed" | "available" | "locked";

/** An item placed on the plan: either a real course or a flexible credit slot. */
export interface PlanItem {
  id: string; // course id, or a synthetic id like "bucket:gened:1"
  title: string;
  credits: number;
  isPlaceholder: boolean;
  requirementId: string;
  prereqs: string[]; // only meaningful for real courses
}

export interface PlannedTerm {
  index: number; // 0-based term index
  quarter: Quarter;
  year: number; // calendar year inferred from start
  items: PlanItem[];
  credits: number;
}

export interface Plan {
  terms: PlannedTerm[];
  /** Items that could not be scheduled within the term cap (should be rare). */
  leftover: PlanItem[];
  totalPlannedCredits: number;
}

export interface RequirementProgress {
  requirement: Requirement;
  satisfied: boolean;
  /** Human-readable progress, e.g. "2 / 5 courses" or "10 / 15 credits". */
  detail: string;
  completedCourses: string[];
  remainingCourses: string[]; // concrete remaining candidates (best-effort)
  fraction: number; // 0..1
}

// ---- Dashboard plan model -------------------------------------------------

/** A quarter column in the plan: id like "A2024", label "Autumn 2024". */
export interface QuarterMeta {
  id: string;
  term: string;
  quarter: Quarter;
  year: number;
  accent: string;
}

/** quarterId -> ordered list of course ids scheduled that quarter. */
export type PlanMap = Record<string, string[]>;

/** A course's status relative to "now" and the plan. */
export type DisplayStatus = "completed" | "planned" | "available";
