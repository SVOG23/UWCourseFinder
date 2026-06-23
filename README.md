# UW Course Finder 🐾

**Visualize a quarter-by-quarter path to your University of Washington degree.**

Tell the app your major (and specialization) and the courses you've already
taken, and it builds you a prerequisite-aware schedule from now until
graduation — plus an interactive mind map of how each course unlocks the next.

> Built as a submission for the **UW-IT Student Innovation Lab Community Project
> Showcase**. It addresses a real challenge every Husky faces: turning a wall of
> degree requirements and prerequisites into a clear, personal plan.

---

## Why it exists

UW gives students MyPlan, a DARS audit, and the course catalog — but stitching
them into "so what do I actually take, and when?" is left as an exercise to the
student. UW-IT's own [prereq-map](https://github.com/uw-it-aca/prereq-map) (now
archived) visualized prerequisites but didn't plan a degree. UW Course Finder
adds the missing pieces:

- **A starting plan** — an auto-scheduler seeds a prerequisite-valid, quarter-by-quarter
  plan the moment you pick a major.
- **Direct editing** — browse the course catalog and add, remove, or move courses
  between quarters; the plan and progress update live.
- **Exploration** — an interactive prerequisite map where every course flows into
  the ones it unlocks.

## Features

- 🎓 **Degree dashboard** — a degree hero with a live progress ring (credits
  earned vs. UW's 180), estimated graduation term, and a one-click major /
  specialization switcher across all four programs.
- 🗓️ **Editable quarter plan** — seeded by a greedy, prerequisite-aware
  scheduler, then fully editable: a course catalog sidebar and per-quarter
  "add course" controls let you shape the plan yourself.
- 🧠 **Interactive prerequisite map** — a custom pannable / zoomable / draggable
  canvas (no heavy graph library) with bézier prerequisite edges; nodes are
  colored *completed / planned / available later*.
- 🪟 **Course detail drawer** — click any course for its credits, area, quarters
  offered, prerequisites, and add-to-quarter controls.
- 📋 **Progress tracking** — completed vs. planned credits, derived from where
  each course sits on your timeline.
- 💾 **Local persistence** — your plan is saved to `localStorage`.

## Data sources

This project deliberately uses **public, real UW data** and is transparent about
its limits:

| Data | Source | Notes |
| --- | --- | --- |
| Course catalog (titles, credits, prerequisites, quarters offered, areas of knowledge) | [UW Course Descriptions](https://www.washington.edu/students/crscat/), scraped by the open-source [`kjiwa/uw-course-catalog`](https://github.com/kjiwa/uw-course-catalog) project | 14,171 Seattle-campus courses. Normalized by `scripts/build_data.py`. |
| Degree requirements | Hand-encoded from official department pages: [Allen School CS](https://www.cs.washington.edu/academics/undergraduate/degree-requirements/), [iSchool Informatics](https://ischool.uw.edu/programs/informatics/curriculum), [Mathematics](https://math.washington.edu/bs-mathematics-major-requirements), and [ACMS](https://acms.washington.edu/graduation) | See `src/data/programs.ts`. Simplified for planning — **not** an official audit. |
| Completed courses | You — courses scheduled in past quarters count as completed; move them to reflect your real timeline | UW's [DARS](https://myplan.uw.edu)/MyPlan APIs require institutional authentication, so live import isn't possible for a public app. |

### Known limitations (read before you trust it)

- The scraped catalog stores prerequisites as a **flat list of course codes** and
  cannot express UW's "one of / all of" logic (e.g. CSE 311 really needs CSE 143
  **and** *either* MATH 126 *or* 136). The app treats prerequisites within your
  curated program as ordering constraints and surfaces the rest for review.
- "Quarters offered" data is sparse upstream; when unknown, the scheduler assumes
  a course can be taken any quarter.
- **This is a planning aid, not an official audit.** Always confirm with an
  official DARS audit and your departmental adviser.

## Tech stack

- **React 18 + TypeScript + Vite** — fast static SPA (~58 KB gzipped),
  deployable anywhere.
- **[zustand](https://github.com/pmndrs/zustand)** — tiny persisted state store.
- **No graph/UI framework** — the prerequisite map is a hand-built pannable
  canvas; fonts are Newsreader / Hanken Grotesk / Space Mono.
- **Python 3** — `scripts/build_data.py` builds the bundled course dataset;
  `scripts/build_deck.py` generates the showcase slide deck.

## Getting started

```bash
npm install
npm run dev        # local dev server
npm run build      # type-check + production build to dist/
npm run preview    # preview the production build
```

The app loads `public/data/courses.json` (committed). To refresh it from the
upstream catalog:

```bash
npm run data       # downloads the latest catalog CSV and rebuilds the JSON
# or, from a local CSV:
python3 scripts/build_data.py --csv path/to/uwcourses.csv
```

## Adding your major

Programs are pure data. Add a `Program` object to `PROGRAMS` in
[`src/data/programs.ts`](src/data/programs.ts) — list the required courses,
"choose N" groups, credit buckets, and any specializations. The scheduler, map,
and progress ring pick it up automatically. Use real course ids from the
catalog (e.g. `"CSE 311"`); IDs that don't resolve are skipped.

## Deployment

A GitHub Actions workflow ([`.github/workflows/deploy.yml`](.github/workflows/deploy.yml))
builds the app and publishes it to **GitHub Pages** on every push. Enable it
under *Settings → Pages → Source: GitHub Actions*. The site is served at
`https://<user>.github.io/uwcoursefinder/`. The Vite build uses a relative base,
so it also works at a domain root (Vercel, Netlify, etc.) with no changes.

## Project structure

```
scripts/build_data.py     # catalog CSV -> public/data/courses.json
scripts/build_deck.py     # generates the showcase slide deck (.pptx)
public/data/courses.json  # generated course dataset (committed)
src/
  data/programs.ts        # degree program definitions (add majors here)
  lib/
    courses.ts            # catalog index, search, prereq helpers
    planner.ts            # quarter scheduler (seeds the plan)
    plan.ts               # plan/timeline helpers (status, credits, seeding)
  store/useAppStore.ts    # persisted dashboard state
  components/             # Header, Hero, CatalogSidebar, PlanGrid,
                          #   PrereqMap, CourseDrawer
```

## License

MIT. Course data belongs to the University of Washington; this project is an
unofficial, student-built planning aid and is not affiliated with or endorsed by
UW.
