import { useMemo } from "react";
import { QUARTER_NAME, type PlanItem, type Program } from "../types";
import { Catalog } from "../lib/courses";
import { buildPlan } from "../lib/planner";
import { effectiveRequirements } from "../data/programs";
import { useAppStore } from "../store/useAppStore";

interface Props {
  catalog: Catalog;
  program: Program;
  specId: string | null;
}

export function PlanBoard({ catalog, program, specId }: Props) {
  const completed = useAppStore((s) => s.completed);
  const startYear = useAppStore((s) => s.startYear);
  const creditCap = useAppStore((s) => s.creditCap);
  const toggleCompleted = useAppStore((s) => s.toggleCompleted);

  const reqLabels = useMemo(() => {
    const m = new Map<string, string>();
    for (const r of effectiveRequirements(program, specId)) m.set(r.id, r.label);
    m.set("implied", "Prerequisite");
    return m;
  }, [program, specId]);

  const plan = useMemo(
    () =>
      buildPlan(catalog, program, specId, new Set(completed), {
        startYear,
        creditCap,
      }),
    [catalog, program, specId, completed, startYear, creditCap],
  );

  const last = plan.terms[plan.terms.length - 1];

  if (plan.terms.length === 0) {
    return (
      <div className="planboard">
        <div className="empty-plan card">
          🎉 Every modeled requirement is covered by the courses you&apos;ve
          completed. Double-check the details against an official DARS audit.
        </div>
      </div>
    );
  }

  return (
    <div className="planboard">
      <div className="plan-summary">
        <div className="stat">
          <div className="stat-value">{plan.terms.length}</div>
          <div className="stat-label">quarters to plan</div>
        </div>
        <div className="stat">
          <div className="stat-value">{plan.totalPlannedCredits}</div>
          <div className="stat-label">credits ahead</div>
        </div>
        <div className="stat">
          <div className="stat-value">
            {last ? `${QUARTER_NAME[last.quarter]} ${last.year}` : "—"}
          </div>
          <div className="stat-label">estimated finish</div>
        </div>
      </div>

      <div className="terms">
        {plan.terms.map((t) => (
          <div className="term" key={t.index}>
            <div className="term-head">
              <span className="term-name">
                {QUARTER_NAME[t.quarter]} {t.year}
              </span>
              <span className="term-cr">{t.credits} cr</span>
            </div>
            <div className="term-items">
              {t.items.map((it) => (
                <PlanCard
                  key={it.id}
                  item={it}
                  reqLabel={reqLabels.get(it.requirementId) ?? "Elective"}
                  onComplete={
                    it.isPlaceholder ? undefined : () => toggleCompleted(it.id)
                  }
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {plan.leftover.length > 0 && (
        <div className="leftover card">
          <strong>Heads up:</strong> {plan.leftover.length} item(s) couldn&apos;t
          be auto-scheduled within the term limit — usually due to limited
          “offered” data. They&apos;re still required:{" "}
          {plan.leftover.map((i) => i.title).join(", ")}.
        </div>
      )}
    </div>
  );
}

function PlanCard({
  item,
  reqLabel,
  onComplete,
}: {
  item: PlanItem;
  reqLabel: string;
  onComplete?: () => void;
}) {
  return (
    <div className={`pcard ${item.isPlaceholder ? "pcard-flex" : ""}`}>
      <div className="pcard-top">
        {item.isPlaceholder ? (
          <span className="pcard-flexlabel">{item.title}</span>
        ) : (
          <span className="mono pcard-id">{item.id}</span>
        )}
        <span className="pcard-cr">{item.credits}</span>
      </div>
      {!item.isPlaceholder && <div className="pcard-title">{item.title}</div>}
      <div className="pcard-bottom">
        <span className="pcard-tag">{reqLabel}</span>
        {onComplete && (
          <button className="pcard-done" onClick={onComplete}>
            ✓ done
          </button>
        )}
      </div>
    </div>
  );
}
