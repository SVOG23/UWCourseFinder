import { Catalog, creditsOf } from "../lib/courses";
import { useAppStore } from "../store/useAppStore";
import { displayStatus } from "../lib/plan";
import type { Course } from "../types";

const STATUS_LABEL: Record<string, string> = {
  completed: "Completed",
  planned: "In plan",
  available: "Available",
};

export function PlanGrid({ catalog }: { catalog: Catalog }) {
  const plan = useAppStore((s) => s.plan);
  const quarters = useAppStore((s) => s.quarters);
  const addingTo = useAppStore((s) => s.addingTo);
  const setSelected = useAppStore((s) => s.setSelected);
  const setAddingTo = useAppStore((s) => s.setAddingTo);
  const removeFromPlan = useAppStore((s) => s.removeFromPlan);

  return (
    <div className="plan-grid">
      {quarters.map((q) => {
        const courses = (plan[q.id] ?? [])
          .map((id) => catalog.get(id))
          .filter((c): c is Course => !!c);
        const credits = courses.reduce((s, c) => s + creditsOf(c), 0);
        const isTarget = addingTo === q.id;

        return (
          <div className="quarter" key={q.id}>
            <div className="q-head">
              <div className="left">
                <span className="q-dot" style={{ background: q.accent }} />
                <span className="q-term">{q.term}</span>
              </div>
              <span className="q-credits">{credits} cr</span>
            </div>
            <div className="q-cards">
              {courses.map((c) => {
                const status = displayStatus(c.id, plan, quarters);
                const meta = c.areas || c.dept;
                return (
                  <div className="pcard" key={c.id} onClick={() => setSelected(c.id)}>
                    <div className="pcard-head">
                      <span className="pcard-code">{c.id}</span>
                      <div className="pcard-right">
                        <span className="credit-badge">{creditsOf(c)} cr</span>
                        <button
                          className="pcard-x"
                          title="Remove"
                          aria-label={`Remove ${c.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFromPlan(c.id);
                          }}
                        >
                          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2">
                            <line x1="6" y1="6" x2="18" y2="18" />
                            <line x1="18" y1="6" x2="6" y2="18" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className="pcard-title">{c.title}</div>
                    <div className="pcard-meta">
                      <span className="pcard-prof">{meta}</span>
                      <span className={`pill pill-${status}`}>{STATUS_LABEL[status]}</span>
                    </div>
                  </div>
                );
              })}
              <button
                className={`q-add${isTarget ? " target" : ""}`}
                onClick={() => setAddingTo(isTarget ? null : q.id)}
              >
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <line x1="12" y1="6" x2="12" y2="18" />
                  <line x1="6" y1="12" x2="18" y2="12" />
                </svg>
                {isTarget ? "Pick a course from the catalog" : "Add course"}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
