import type { Program } from "../types";

/**
 * Degree program definitions.
 *
 * These encode the *structure* of a UW major: which courses are required, which
 * are chosen from a list, and how many credits each category needs. The course
 * ids reference the catalog in public/data/courses.json.
 *
 * IMPORTANT: requirements are modeled for planning/visualization and are
 * simplified. They are NOT an official audit. Always confirm against an official
 * DARS audit (myplan.uw.edu) and your departmental adviser.
 *
 * To add a program: append a Program object to PROGRAMS below. The planner and
 * UI pick it up automatically.
 */

const CSE_BS: Program = {
  id: "cse-bs",
  name: "Computer Science (B.S.)",
  school: "Paul G. Allen School of Computer Science & Engineering",
  degreeType: "Bachelor of Science",
  description:
    "The Allen School B.S. combines an intro programming sequence, calculus, the CSE foundations core, and a depth of 400-level CSE coursework.",
  sourceUrl:
    "https://www.cs.washington.edu/academics/undergraduate/degree-requirements/",
  totalCreditsForDegree: 180,
  requirements: [
    {
      id: "intro",
      label: "Intro Programming Sequence",
      kind: "all",
      courses: ["CSE 142", "CSE 143"],
      note: "Now offered as CSE 121–123. CSE 143 (or 123) is the gateway to the major.",
    },
    {
      id: "calc",
      label: "Calculus",
      kind: "all",
      courses: ["MATH 124", "MATH 125", "MATH 126"],
    },
    {
      id: "linalg",
      label: "Linear Algebra",
      kind: "chooseN",
      n: 1,
      courses: ["MATH 308", "AMATH 352"],
    },
    {
      id: "foundations",
      label: "CSE Foundations Core",
      kind: "all",
      courses: ["CSE 311", "CSE 312", "CSE 331", "CSE 332", "CSE 351"],
      note: "The required core. CSE 311 unlocks most upper-division CSE courses.",
    },
    {
      id: "core-electives",
      label: "CSE Core & Electives (6 courses)",
      kind: "chooseN",
      n: 6,
      prefer400: true,
      courses: [
        "CSE 333",
        "CSE 341",
        "CSE 344",
        "CSE 369",
        "CSE 401",
        "CSE 416",
        "CSE 421",
        "CSE 440",
        "CSE 442",
        "CSE 446",
        "CSE 447",
        "CSE 451",
        "CSE 452",
        "CSE 455",
        "CSE 457",
        "CSE 461",
        "CSE 481",
      ],
      note: "At least four must be 400-level CSE. Choose courses that build toward your specialization.",
    },
    {
      id: "science",
      label: "Natural Sciences",
      kind: "credits",
      credits: 15,
      courses: ["PHYS 121", "PHYS 122", "PHYS 123", "CHEM 142", "CHEM 152", "BIOL 180"],
    },
    {
      id: "english",
      label: "English Composition",
      kind: "chooseN",
      n: 1,
      courses: ["ENGL 131", "ENGL 121"],
    },
    {
      id: "techwriting",
      label: "Technical Writing",
      kind: "chooseN",
      n: 1,
      courses: ["CSE 391", "HCDE 231", "ENGL 282"],
    },
    {
      id: "gened",
      label: "General Education (VLPA / SSc / DIV)",
      kind: "credits",
      credits: 30,
      courses: [],
      note: "Flexible breadth credits you choose across Arts & Humanities, Social Sciences, and Diversity.",
    },
  ],
  specializations: [
    {
      id: "none",
      name: "General / Undecided",
      note: "No specialization — choose core & electives broadly.",
    },
    {
      id: "ai-ml",
      name: "Artificial Intelligence & Machine Learning",
      addsRequirements: [
        {
          id: "spec-aiml",
          label: "AI/ML Depth (2 courses)",
          kind: "chooseN",
          n: 2,
          prefer400: true,
          courses: ["CSE 446", "CSE 416", "CSE 447", "CSE 455"],
        },
      ],
    },
    {
      id: "systems",
      name: "Systems & Software",
      addsRequirements: [
        {
          id: "spec-sys",
          label: "Systems Depth (2 courses)",
          kind: "chooseN",
          n: 2,
          prefer400: true,
          courses: ["CSE 451", "CSE 461", "CSE 452", "CSE 333"],
        },
      ],
    },
    {
      id: "data",
      name: "Data & Databases",
      addsRequirements: [
        {
          id: "spec-data",
          label: "Data Depth (2 courses)",
          kind: "chooseN",
          n: 2,
          prefer400: true,
          courses: ["CSE 344", "CSE 446", "CSE 416"],
        },
      ],
    },
    {
      id: "hci",
      name: "Human–Computer Interaction",
      addsRequirements: [
        {
          id: "spec-hci",
          label: "HCI Depth (2 courses)",
          kind: "chooseN",
          n: 2,
          prefer400: true,
          courses: ["CSE 440", "CSE 442", "CSE 457"],
        },
      ],
    },
  ],
};

export const PROGRAMS: Program[] = [CSE_BS];

export function getProgram(id: string): Program | undefined {
  return PROGRAMS.find((p) => p.id === id);
}

/** Resolve the effective requirements for a program + chosen specialization. */
export function effectiveRequirements(program: Program, specId: string | null) {
  const spec = program.specializations?.find((s) => s.id === specId);
  const extra = spec?.addsRequirements ?? [];
  return [...program.requirements, ...extra];
}
