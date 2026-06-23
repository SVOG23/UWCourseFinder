import type { Quarter } from "../types";
import { Catalog, creditsOf } from "../lib/courses";
import { useAppStore } from "../store/useAppStore";
import { displayStatus, quarterContaining } from "../lib/plan";

const STATUS_LABEL: Record<string, string> = {
  completed: "Completed",
  planned: "In plan",
  available: "Available",
};

function offeredLabel(offered: Quarter[]): string {
  if (!offered.length) return "Not listed";
  const short: Record<Quarter, string> = { A: "Aut", W: "Win", Sp: "Spr", S: "Sum" };
  return offered.map((q) => short[q]).join(" · ");
}

export function CourseDrawer({ catalog }: { catalog: Catalog }) {
  const selected = useAppStore((s) => s.selected);
  const plan = useAppStore((s) => s.plan);
  const quarters = useAppStore((s) => s.quarters);
  const setSelected = useAppStore((s) => s.setSelected);
  const addToQuarter = useAppStore((s) => s.addToQuarter);
  const removeFromPlan = useAppStore((s) => s.removeFromPlan);

  if (!selected) return null;
  const c = catalog.get(selected);
  if (!c) return null;

  const status = displayStatus(c.id, plan, quarters);
  const curQ = quarterContaining(c.id, plan);
  const curTerm = quarters.find((q) => q.id === curQ)?.term ?? "";
  const prereqs = c.prereqs.map((p) => ({ id: p, label: catalog.get(p)?.id ?? p }));

  return (
    <div className="drawer-overlay" onClick={() => setSelected(null)}>
      <div className="drawer" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-head">
          <button className="drawer-close" aria-label="Close" onClick={() => setSelected(null)}>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2">
              <line x1="6" y1="6" x2="18" y2="18" />
              <line x1="18" y1="6" x2="6" y2="18" />
            </svg>
          </button>
          <div className="drawer-code">{c.id}</div>
          <h2 className="drawer-title">{c.title}</h2>
          <div className="drawer-tags">
            <span className="pill-dark">{STATUS_LABEL[status]}</span>
            <span className="pill-dark">{creditsOf(c)} credits</span>
          </div>
        </div>

        <div className="drawer-body">
          <div className="drawer-meta">
            <div>
              <div className="k">AREA</div>
              <div className="v">{c.areas || "—"}</div>
            </div>
            <div>
              <div className="k">OFFERED</div>
              <div className="v">{offeredLabel(c.offered)}</div>
            </div>
            <div>
              <div className="k">CREDITS</div>
              <div className="v">{c.credits}</div>
            </div>
            <div>
              <div className="k">DEPARTMENT</div>
              <div className="v">{c.dept}</div>
            </div>
          </div>

          <div className="drawer-label">PREREQUISITES</div>
          <div className="prereq-chips">
            {prereqs.length === 0 ? (
              <span className="no-prereq">No prerequisites — open to all students.</span>
            ) : (
              prereqs.map((p) => (
                <button
                  key={p.id}
                  className="prereq-chip"
                  onClick={() => setSelected(catalog.get(p.id) ? p.id : selected)}
                  disabled={!catalog.get(p.id)}
                >
                  {p.label}
                </button>
              ))
            )}
          </div>

          {curQ ? (
            <div className="sched-box">
              <div>
                <div className="k">Scheduled in</div>
                <div className="v">{curTerm}</div>
              </div>
              <button className="sched-remove" onClick={() => removeFromPlan(c.id)}>
                Remove
              </button>
            </div>
          ) : (
            <>
              <div className="drawer-label">ADD TO A QUARTER</div>
              <div className="term-buttons">
                {quarters.map((q) => (
                  <button key={q.id} className="term-btn" onClick={() => addToQuarter(c.id, q.id)}>
                    {q.term}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
