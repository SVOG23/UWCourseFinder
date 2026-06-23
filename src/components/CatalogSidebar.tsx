import { useMemo } from "react";
import type { Course } from "../types";
import { Catalog } from "../lib/courses";
import { useAppStore } from "../store/useAppStore";
import { effectiveRequirements, getProgram } from "../data/programs";
import {
  defaultAddQuarter,
  displayStatus,
  quarterContaining,
} from "../lib/plan";

export function CatalogSidebar({ catalog }: { catalog: Catalog }) {
  const programId = useAppStore((s) => s.programId);
  const specId = useAppStore((s) => s.specId);
  const plan = useAppStore((s) => s.plan);
  const quarters = useAppStore((s) => s.quarters);
  const query = useAppStore((s) => s.query);
  const addingTo = useAppStore((s) => s.addingTo);
  const addToQuarter = useAppStore((s) => s.addToQuarter);
  const removeFromPlan = useAppStore((s) => s.removeFromPlan);
  const setSelected = useAppStore((s) => s.setSelected);
  const setAddingTo = useAppStore((s) => s.setAddingTo);

  const program = getProgram(programId);

  const baseCourses = useMemo(() => {
    const ids = new Set<string>();
    if (program) {
      for (const r of effectiveRequirements(program, specId)) {
        for (const c of r.courses) if (catalog.get(c)) ids.add(c);
      }
    }
    for (const arr of Object.values(plan)) for (const id of arr) ids.add(id);
    for (const id of [...ids]) {
      const c = catalog.get(id);
      if (c) for (const p of c.prereqs) if (catalog.get(p)) ids.add(p);
    }
    return [...ids].map((id) => catalog.get(id)).filter((c): c is Course => !!c);
  }, [program, specId, plan, catalog]);

  const groups = useMemo(() => {
    const list = query.trim() ? catalog.search(query, 60) : baseCourses;
    const byDept = new Map<string, Course[]>();
    for (const c of list) {
      if (!byDept.has(c.dept)) byDept.set(c.dept, []);
      byDept.get(c.dept)!.push(c);
    }
    return [...byDept.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([dept, courses]) => ({
        dept,
        courses: courses.sort((a, b) => a.num.localeCompare(b.num, undefined, { numeric: true })),
      }));
  }, [query, baseCourses, catalog]);

  const addingTerm = quarters.find((q) => q.id === addingTo)?.term ?? "";

  const toggle = (id: string) => {
    if (quarterContaining(id, plan)) {
      removeFromPlan(id);
    } else {
      const target = addingTo ?? defaultAddQuarter(quarters);
      if (target) addToQuarter(id, target);
    }
  };

  return (
    <aside className="catalog">
      <div className="catalog-head">
        <div className="t">Course Catalog</div>
        <div className="s">Tap + to add a course to your plan</div>
      </div>

      {addingTo && (
        <div className="adding-banner">
          <span>
            Adding to <strong>{addingTerm}</strong>
          </span>
          <button onClick={() => setAddingTo(null)}>Cancel</button>
        </div>
      )}

      <div className="catalog-list">
        {groups.length === 0 && (
          <div className="catalog-empty">No courses match “{query}”.</div>
        )}
        {groups.map((g) => (
          <div className="cat-group" key={g.dept}>
            <div className="cat-dept">{g.dept}</div>
            {g.courses.map((c) => {
              const status = displayStatus(c.id, plan, quarters);
              const inPlan = !!quarterContaining(c.id, plan);
              return (
                <div className="cat-row" key={c.id} onClick={() => setSelected(c.id)}>
                  <div className={`dot dot-${status}`} />
                  <div className="info">
                    <div className="code">{c.id}</div>
                    <div className="title">{c.title}</div>
                  </div>
                  <button
                    className={`cat-toggle${inPlan ? " in" : ""}`}
                    aria-label={inPlan ? `Remove ${c.id}` : `Add ${c.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggle(c.id);
                    }}
                  >
                    {inPlan ? (
                      <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.4">
                        <polyline points="5 12 10 17 19 7" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2">
                        <line x1="12" y1="6" x2="12" y2="18" />
                        <line x1="6" y1="12" x2="18" y2="12" />
                      </svg>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </aside>
  );
}
