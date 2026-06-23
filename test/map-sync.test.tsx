/**
 * Integration / regression test for the core planning loop.
 *
 * Drives the real React components (catalog, plan grid, prerequisite map,
 * course drawer, hero) through a student's actions in jsdom and asserts the
 * mind map stays in sync with the plan after every add/remove — both ways.
 *
 * Run with: npm test
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { JSDOM } from "jsdom";

const dom = new JSDOM("<!doctype html><html><body><div id='root'></div></body></html>", {
  url: "http://localhost/",
  pretendToBeVisual: true,
});
const w = dom.window;
const g = globalThis;
g.window = w;
g.document = w.document;
g.HTMLElement = w.HTMLElement;
g.Node = w.Node;
g.Element = w.Element;
g.SVGElement = w.SVGElement;
g.localStorage = w.localStorage;
g.MouseEvent = w.MouseEvent;
g.Event = w.Event;
g.requestAnimationFrame = () => 0;
g.cancelAnimationFrame = () => {};
g.getComputedStyle = w.getComputedStyle.bind(w);
g.IS_REACT_ACT_ENVIRONMENT = true;

const React = (await import("react")).default;
const { createRoot } = await import("react-dom/client");
const { act } = await import("react");
const { Catalog } = await import("../src/lib/courses.ts");
const { useAppStore } = await import("../src/store/useAppStore.ts");
const { Hero } = await import("../src/components/Hero.tsx");
const { CatalogSidebar } = await import("../src/components/CatalogSidebar.tsx");
const { PlanGrid } = await import("../src/components/PlanGrid.tsx");
const { PrereqMap } = await import("../src/components/PrereqMap.tsx");
const { CourseDrawer } = await import("../src/components/CourseDrawer.tsx");

const data = JSON.parse(readFileSync(path.join(process.cwd(), "public/data/courses.json"), "utf8"));
const cat = new Catalog(data);
const store = () => useAppStore.getState();
const R = React.createElement;

let pass = 0;
let fail = 0;
const check = (name, cond, extra = "") => {
  if (cond) pass++;
  else {
    fail++;
    console.log(`  FAIL  ${name} ${extra}`);
  }
};

const planIds = () => Object.values(store().plan).flat();
const mapCodes = () => Array.from(document.querySelectorAll(".map-node .code")).map((e) => e.textContent);
const planCardCodes = () => Array.from(document.querySelectorAll(".pcard-code")).map((e) => e.textContent);
const edgeCount = () => document.querySelectorAll(".map-canvas path").length;

function expectedShown() {
  const ids = planIds();
  const set = new Set(ids);
  const edges = [];
  for (const id of ids) {
    const c = cat.get(id);
    if (!c) continue;
    for (const p of c.prereqs) if (set.has(p) && p !== id) edges.push([p, id]);
  }
  const conn = new Set();
  for (const [a, b] of edges) {
    conn.add(a);
    conn.add(b);
  }
  return { shown: conn.size ? new Set(ids.filter((id) => conn.has(id))) : new Set(ids), edges: edges.length };
}

function assertConsistent(label) {
  const { shown } = expectedShown();
  const domSet = new Set(mapCodes());
  const match =
    domSet.size === shown.size &&
    [...domSet].every((c) => shown.has(c)) &&
    [...shown].every((c) => domSet.has(c));
  check(`${label}: map == wired set`, match, `dom=${domSet.size} wired=${shown.size}`);
  check(`${label}: every map node is in plan`, [...domSet].every((c) => planIds().includes(c)));
}

function addViaCatalog(code) {
  act(() => store().setQuery(code));
  const row = Array.from(document.querySelectorAll(".cat-row")).find(
    (r) => r.querySelector(".code")?.textContent === code,
  );
  if (!row) throw new Error("catalog row not found: " + code);
  act(() => row.querySelector(".cat-toggle").dispatchEvent(new w.MouseEvent("click", { bubbles: true })));
  act(() => store().setQuery(""));
}

function removeViaPlan(code) {
  const card = Array.from(document.querySelectorAll(".pcard")).find(
    (c) => c.querySelector(".pcard-code")?.textContent === code,
  );
  if (!card) throw new Error("plan card not found: " + code);
  act(() => card.querySelector(".pcard-x").dispatchEvent(new w.MouseEvent("click", { bubbles: true })));
}

function openDrawerFromMap(code) {
  const node = Array.from(document.querySelectorAll(".map-node")).find(
    (n) => n.querySelector(".code")?.textContent === code,
  );
  if (!node) throw new Error("map node not found: " + code);
  act(() => node.dispatchEvent(new w.MouseEvent("pointerdown", { bubbles: true, clientX: 60, clientY: 60, button: 0 })));
  act(() => w.dispatchEvent(new w.MouseEvent("pointerup", {})));
}

function findWiredAddable() {
  const set = new Set(planIds());
  for (const c of data.courses)
    if (c.dept === "CSE" && !set.has(c.id) && c.prereqs.some((p) => set.has(p))) return c.id;
  return null;
}

function findStandaloneAddable() {
  const set = new Set(planIds());
  const isPre = new Set();
  for (const id of planIds()) {
    const c = cat.get(id);
    if (c) c.prereqs.forEach((p) => isPre.add(p));
  }
  for (const c of data.courses)
    if (c.prereqs.length === 0 && !set.has(c.id) && !isPre.has(c.id) && /^(PHIL|MUSIC|ART|DRAMA|ANTH|HSTAA)/.test(c.dept))
      return c.id;
  return null;
}

// ---- boot: student opens the app on the map tab ----
store().setProgram(cat, "cse-bs");
store().setTab("map");
const root = createRoot(document.getElementById("root"));
act(() =>
  root.render(
    R(
      React.Fragment,
      null,
      R(Hero, { catalog: cat }),
      R(CatalogSidebar, { catalog: cat }),
      R(PlanGrid, { catalog: cat }),
      R(PrereqMap, { catalog: cat }),
      R(CourseDrawer, { catalog: cat }),
    ),
  ),
);

console.log(`BOOT: plan=${planIds().length} mapNodes=${mapCodes().length} edges=${edgeCount()}`);
assertConsistent("boot");
check("boot: plan grid shows all plan courses", planCardCodes().length === planIds().length);

// 1) add a wired course via the catalog
const wired = findWiredAddable();
const beforeNodes = mapCodes().length;
addViaCatalog(wired);
check("add-wired: in plan", planIds().includes(wired));
check("add-wired: on the map", mapCodes().includes(wired));
check("add-wired: node count grew", mapCodes().length > beforeNodes);
check("add-wired: in plan grid", planCardCodes().includes(wired));
assertConsistent("add-wired");

// 2) remove it via the plan grid
removeViaPlan(wired);
check("remove-plan: gone from plan", !planIds().includes(wired));
check("remove-plan: gone from map", !mapCodes().includes(wired));
assertConsistent("remove-plan");

// 3) add a standalone (unwired) course
const solo = findStandaloneAddable();
const nodesBeforeSolo = mapCodes().length;
addViaCatalog(solo);
check("add-solo: in plan", planIds().includes(solo));
check("add-solo: NOT on the map (unwired)", !mapCodes().includes(solo));
check("add-solo: map node count unchanged", mapCodes().length === nodesBeforeSolo);
check("add-solo: hidden-courses note shown", !!document.querySelector(".leg-note"));
assertConsistent("add-solo");

// 4) remove standalone via catalog toggle
addViaCatalog(solo);
check("remove-solo: gone from plan", !planIds().includes(solo));

// 5) open drawer from a map node, remove via drawer (map <-> plan)
const hub = "CSE 332";
if (mapCodes().includes(hub)) {
  openDrawerFromMap(hub);
  check("drawer: opened for clicked node", document.querySelector(".drawer-code")?.textContent === hub);
  const rm = document.querySelector(".sched-remove");
  if (rm) act(() => rm.dispatchEvent(new w.MouseEvent("click", { bubbles: true })));
  check("drawer-remove: gone from plan", !planIds().includes(hub));
  check("drawer-remove: gone from map", !mapCodes().includes(hub));
  check("drawer-remove: gone from plan grid", !planCardCodes().includes(hub));
  assertConsistent("drawer-remove");
}

// 6) remove a hub prerequisite, dependents recompute
if (mapCodes().includes("CSE 311")) {
  removeViaPlan("CSE 311");
  check("hub-remove: CSE 311 gone from map", !mapCodes().includes("CSE 311"));
  assertConsistent("hub-remove");
}

// 7) drag a node, edges follow
const someNode = document.querySelector(".map-node");
const e0 = Array.from(document.querySelectorAll(".map-canvas path")).map((p) => p.getAttribute("d"));
if (someNode && e0.length) {
  act(() => someNode.dispatchEvent(new w.MouseEvent("pointerdown", { bubbles: true, clientX: 90, clientY: 90, button: 0 })));
  act(() => w.dispatchEvent(new w.MouseEvent("pointermove", { clientX: 420, clientY: 340 })));
  act(() => w.dispatchEvent(new w.MouseEvent("pointermove", { clientX: 540, clientY: 380 })));
  const e1 = Array.from(document.querySelectorAll(".map-canvas path")).map((p) => p.getAttribute("d"));
  act(() => w.dispatchEvent(new w.MouseEvent("pointerup", {})));
  let changed = 0;
  for (let i = 0; i < Math.min(e0.length, e1.length); i++) if (e0[i] !== e1[i]) changed++;
  check("drag: edges move with the node", changed > 0, `changed=${changed}`);
}

// 8) switch programs, map re-seeds and stays consistent
for (const pid of ["info-bs", "math-bs", "cse-bs"]) {
  act(() => store().setProgram(cat, pid));
  check(`switch ${pid}: map non-empty`, mapCodes().length > 0);
  check(`switch ${pid}: plan grid populated`, planCardCodes().length > 0);
  assertConsistent(`switch ${pid}`);
}

// 9) hero progress reacts to add/remove
const plannedChip = () =>
  Array.from(document.querySelectorAll(".hero-chip"))
    .map((e) => e.textContent || "")
    .find((t) => /credits planned/.test(t)) || "";
const before9 = plannedChip();
const w2 = findWiredAddable();
addViaCatalog(w2);
check("hero: credits-planned changed on add", before9 !== plannedChip());
removeViaPlan(w2);
check("hero: credits-planned reverted on remove", plannedChip() === before9);

console.log(`\n========== ${pass} passed, ${fail} failed ==========`);
process.exit(fail === 0 ? 0 : 1);
