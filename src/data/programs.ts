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

const INFORMATICS_BS: Program = {
  id: "info-bs",
  name: "Informatics (B.S.)",
  school: "Information School (iSchool)",
  degreeType: "Bachelor of Science",
  description:
    "The iSchool's Informatics major blends data, design, software development, and the social context of information, culminating in a two-quarter capstone.",
  sourceUrl: "https://ischool.uw.edu/programs/informatics/curriculum",
  totalCreditsForDegree: 180,
  requirements: [
    {
      id: "intro",
      label: "Programming Foundations",
      kind: "all",
      courses: ["CSE 142", "CSE 143"],
      note: "CSE 163 (Intermediate Data Programming) is an accepted alternative path.",
    },
    {
      id: "info-foundations",
      label: "Informatics Foundations",
      kind: "all",
      courses: ["INFO 200", "INFO 201"],
    },
    {
      id: "data",
      label: "Data (databases)",
      kind: "all",
      courses: ["INFO 340"],
    },
    {
      id: "development",
      label: "Development (web/app)",
      kind: "chooseN",
      n: 1,
      courses: ["INFO 343", "INFO 344"],
    },
    {
      id: "design",
      label: "Design",
      kind: "chooseN",
      n: 1,
      courses: ["INFO 360", "INFO 362", "INFO 365"],
    },
    {
      id: "organizations",
      label: "Organizations",
      kind: "all",
      courses: ["INFO 380"],
    },
    {
      id: "society",
      label: "Society & Ethics",
      kind: "chooseN",
      n: 1,
      courses: ["INFO 450", "INFO 402"],
    },
    {
      id: "stats",
      label: "Statistics",
      kind: "chooseN",
      n: 1,
      courses: ["STAT 311", "STAT 390"],
    },
    {
      id: "methods",
      label: "Research Methods",
      kind: "all",
      courses: ["INFO 470"],
    },
    {
      id: "capstone",
      label: "Capstone Sequence",
      kind: "all",
      courses: ["INFO 490", "INFO 491"],
      note: "Two-quarter team project presented at the spring Capstone event.",
    },
    {
      id: "info-electives",
      label: "Informatics Electives (3)",
      kind: "chooseN",
      n: 3,
      prefer400: true,
      courses: [
        "INFO 330",
        "INFO 341",
        "INFO 344",
        "INFO 431",
        "INFO 445",
        "INFO 448",
        "INFO 461",
        "INFO 463",
        "INFO 474",
        "INFO 481",
      ],
    },
    {
      id: "english",
      label: "English Composition",
      kind: "chooseN",
      n: 1,
      courses: ["ENGL 131", "ENGL 121"],
    },
    {
      id: "science",
      label: "Natural Sciences",
      kind: "credits",
      credits: 10,
      courses: ["PHYS 121", "CHEM 142", "BIOL 180"],
    },
    {
      id: "gened",
      label: "General Education (VLPA / SSc / DIV)",
      kind: "credits",
      credits: 30,
      courses: [],
      note: "Breadth credits across Arts & Humanities, Social Sciences, and Diversity.",
    },
  ],
  specializations: [
    { id: "none", name: "General / Undecided" },
    {
      id: "data-science",
      name: "Data Science",
      addsRequirements: [
        {
          id: "spec-ds",
          label: "Data Science Depth (2)",
          kind: "chooseN",
          n: 2,
          prefer400: true,
          courses: ["INFO 370", "INFO 371", "INFO 474", "INFO 445"],
        },
      ],
    },
    {
      id: "hci",
      name: "Human–Computer Interaction",
      addsRequirements: [
        {
          id: "spec-hci",
          label: "HCI Depth (2)",
          kind: "chooseN",
          n: 2,
          prefer400: true,
          courses: ["INFO 463", "INFO 461", "INFO 467", "INFO 474"],
        },
      ],
    },
    {
      id: "info-arch",
      name: "Information Architecture",
      addsRequirements: [
        {
          id: "spec-ia",
          label: "Information Architecture Depth (2)",
          kind: "chooseN",
          n: 2,
          prefer400: true,
          courses: ["INFO 330", "INFO 431", "INFO 432", "INFO 445"],
        },
      ],
    },
    {
      id: "software",
      name: "Software Development",
      addsRequirements: [
        {
          id: "spec-sw",
          label: "Software Development Depth (2)",
          kind: "chooseN",
          n: 2,
          prefer400: true,
          courses: ["INFO 344", "INFO 448", "INFO 449", "INFO 461"],
        },
      ],
    },
  ],
};

const MATH_BS: Program = {
  id: "math-bs",
  name: "Mathematics (B.S.)",
  school: "Department of Mathematics",
  degreeType: "Bachelor of Science",
  description:
    "The standard B.S. builds from calculus through proof-based analysis and algebra, with upper-division electives chosen to taste.",
  sourceUrl: "https://math.washington.edu/bs-mathematics-major-requirements",
  totalCreditsForDegree: 180,
  requirements: [
    {
      id: "calc",
      label: "Calculus",
      kind: "all",
      courses: ["MATH 124", "MATH 125", "MATH 126"],
    },
    {
      id: "reasoning",
      label: "Mathematical Reasoning",
      kind: "all",
      courses: ["MATH 300"],
      note: "The gateway to proof-based mathematics.",
    },
    {
      id: "linalg",
      label: "Linear Algebra",
      kind: "all",
      courses: ["MATH 308"],
    },
    {
      id: "diffeq",
      label: "Differential Equations",
      kind: "chooseN",
      n: 1,
      courses: ["MATH 307", "AMATH 351"],
    },
    {
      id: "analysis",
      label: "Real Analysis Sequence",
      kind: "all",
      courses: ["MATH 327", "MATH 328"],
    },
    {
      id: "algebra",
      label: "Abstract Algebra / Linear Algebra",
      kind: "chooseN",
      n: 1,
      courses: ["MATH 402", "MATH 340"],
    },
    {
      id: "probability",
      label: "Probability",
      kind: "chooseN",
      n: 1,
      courses: ["MATH 394", "STAT 311"],
    },
    {
      id: "upper-electives",
      label: "Upper-Division Math Electives (3)",
      kind: "chooseN",
      n: 3,
      prefer400: true,
      courses: [
        "MATH 324",
        "MATH 309",
        "MATH 340",
        "MATH 381",
        "MATH 407",
        "MATH 409",
        "AMATH 352",
        "AMATH 401",
        "MATH 402",
      ],
    },
    {
      id: "science",
      label: "Natural Sciences",
      kind: "credits",
      credits: 15,
      courses: ["PHYS 121", "PHYS 122", "PHYS 123"],
    },
    {
      id: "english",
      label: "English Composition",
      kind: "chooseN",
      n: 1,
      courses: ["ENGL 131", "ENGL 121"],
    },
    {
      id: "gened",
      label: "General Education (VLPA / SSc / DIV)",
      kind: "credits",
      credits: 35,
      courses: [],
      note: "Breadth credits across Arts & Humanities, Social Sciences, and Diversity.",
    },
  ],
  specializations: [
    { id: "none", name: "Standard Track" },
    {
      id: "applied",
      name: "Applied Mathematics",
      addsRequirements: [
        {
          id: "spec-app",
          label: "Applied Depth (2)",
          kind: "chooseN",
          n: 2,
          prefer400: true,
          courses: ["AMATH 351", "AMATH 352", "AMATH 353", "MATH 309"],
        },
      ],
    },
    {
      id: "pure",
      name: "Pure Mathematics",
      addsRequirements: [
        {
          id: "spec-pure",
          label: "Pure Depth (2)",
          kind: "chooseN",
          n: 2,
          prefer400: true,
          courses: ["MATH 402", "MATH 403", "MATH 340", "MATH 327"],
        },
      ],
    },
    {
      id: "prob-stat",
      name: "Probability & Statistics",
      addsRequirements: [
        {
          id: "spec-ps",
          label: "Probability/Statistics Depth (2)",
          kind: "chooseN",
          n: 2,
          prefer400: true,
          courses: ["MATH 394", "MATH 395", "STAT 311"],
        },
      ],
    },
  ],
};

const ACMS_BS: Program = {
  id: "acms-bs",
  name: "Applied & Computational Math Sciences (B.S.)",
  school: "ACMS — College of Arts & Sciences",
  degreeType: "Bachelor of Science",
  description:
    "ACMS pairs a shared applied-math core with a focused program option (scientific computing, discrete math & algorithms, statistics, or mathematical biology).",
  sourceUrl: "https://acms.washington.edu/graduation",
  totalCreditsForDegree: 180,
  requirements: [
    {
      id: "calc",
      label: "Calculus",
      kind: "all",
      courses: ["MATH 124", "MATH 125", "MATH 126"],
    },
    {
      id: "programming",
      label: "Programming",
      kind: "all",
      courses: ["CSE 142", "CSE 143"],
    },
    {
      id: "core-math",
      label: "Applied Core (DE + Linear Algebra)",
      kind: "all",
      courses: ["AMATH 351", "AMATH 352"],
    },
    {
      id: "applied-analysis",
      label: "Applied Analysis",
      kind: "chooseN",
      n: 1,
      courses: ["AMATH 353", "AMATH 383", "AMATH 401"],
    },
    {
      id: "probstat",
      label: "Probability & Statistics",
      kind: "all",
      courses: ["STAT 390", "STAT 391"],
    },
    {
      id: "reasoning",
      label: "Analysis / Reasoning",
      kind: "chooseN",
      n: 1,
      courses: ["MATH 300", "MATH 327"],
    },
    {
      id: "options",
      label: "Program Option Courses (3)",
      kind: "chooseN",
      n: 3,
      prefer400: true,
      courses: [
        "MATH 381",
        "MATH 407",
        "MATH 409",
        "AMATH 401",
        "CSE 373",
        "MATH 324",
        "MATH 340",
      ],
    },
    {
      id: "science",
      label: "Natural Sciences",
      kind: "credits",
      credits: 15,
      courses: ["PHYS 121", "PHYS 122", "PHYS 123"],
    },
    {
      id: "english",
      label: "English Composition",
      kind: "chooseN",
      n: 1,
      courses: ["ENGL 131", "ENGL 121"],
    },
    {
      id: "gened",
      label: "General Education (VLPA / SSc / DIV)",
      kind: "credits",
      credits: 30,
      courses: [],
      note: "Breadth credits across Arts & Humanities, Social Sciences, and Diversity.",
    },
  ],
  specializations: [
    { id: "none", name: "Core (choose option later)" },
    {
      id: "scientific-computing",
      name: "Scientific Computing & Numerical Methods",
      addsRequirements: [
        {
          id: "spec-sc",
          label: "Scientific Computing Depth (2)",
          kind: "chooseN",
          n: 2,
          prefer400: true,
          courses: ["AMATH 352", "AMATH 383", "MATH 407", "CSE 373"],
        },
      ],
    },
    {
      id: "discrete",
      name: "Discrete Math & Algorithms",
      addsRequirements: [
        {
          id: "spec-da",
          label: "Discrete & Algorithms Depth (2)",
          kind: "chooseN",
          n: 2,
          prefer400: true,
          courses: ["MATH 381", "MATH 409", "CSE 373", "MATH 407"],
        },
      ],
    },
    {
      id: "statistics",
      name: "Statistics",
      addsRequirements: [
        {
          id: "spec-st",
          label: "Statistics Depth (2)",
          kind: "chooseN",
          n: 2,
          prefer400: true,
          courses: ["STAT 391", "MATH 394", "MATH 395", "STAT 311"],
        },
      ],
    },
  ],
};

export const PROGRAMS: Program[] = [CSE_BS, INFORMATICS_BS, MATH_BS, ACMS_BS];

export function getProgram(id: string): Program | undefined {
  return PROGRAMS.find((p) => p.id === id);
}

/** Resolve the effective requirements for a program + chosen specialization. */
export function effectiveRequirements(program: Program, specId: string | null) {
  const spec = program.specializations?.find((s) => s.id === specId);
  const extra = spec?.addsRequirements ?? [];
  return [...program.requirements, ...extra];
}
