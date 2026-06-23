import { useMemo } from "react";
import type { Program } from "../types";
import { Catalog } from "../lib/courses";
import { completedCredits, requirementProgress } from "../lib/planner";
import { useAppStore } from "../store/useAppStore";
import { CoursePicker } from "./CoursePicker";
import { DarsPaste } from "./DarsPaste";

interface Props {
  catalog: Catalog;
  program: Program;
  specId: string | null;
}

export function Sidebar({ catalog, program, specId }: Props) {
  const completed = useAppStore((s) => s.completed);
  const addCompleted = useAppStore((s) => s.addCompleted);
  const addManyCompleted = useAppStore((s) => s.addManyCompleted);
  const removeCompleted = useAppStore((s) => s.removeCompleted);
  const startYear = useAppStore((s) => s.startYear);
  const setStartYear = useAppStore((s) => s.setStartYear);
  const creditCap = useAppStore((s) => s.creditCap);
  const setCreditCap = useAppStore((s) => s.setCreditCap);
  const setSpec = useAppStore((s) => s.setSpec);

  const completedSet = useMemo(() => new Set(completed), [completed]);
  const progress = useMemo(
    () => requirementProgress(catalog, program, specId, completedSet),
    [catalog, program, specId, completedSet],
  );
  const doneCredits = useMemo(
    () => completedCredits(catalog, completedSet),
    [catalog, completedSet],
  );
  const pct = Math.min(
    100,
    Math.round((doneCredits / program.totalCreditsForDegree) * 100),
  );

  const thisYear = new Date().getFullYear();
  const years = [thisYear - 5, thisYear - 4, thisYear - 3, thisYear - 2, thisYear - 1, thisYear, thisYear + 1];

  return (
    <aside className="sidebar">
      <section className="side-block">
        <h3 className="side-prog">{program.name}</h3>
        <div className="muted small">{program.school}</div>
        {program.specializations && (
          <label className="field tight">
            <span>Specialization</span>
            <select
              value={specId ?? "none"}
              onChange={(e) => setSpec(e.target.value)}
            >
              {program.specializations.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
        )}
      </section>

      <section className="side-block">
        <div className="overall-top">
          <span className="overall-cr">
            {doneCredits} / {program.totalCreditsForDegree} cr
          </span>
          <span className="muted small">{pct}% to degree</span>
        </div>
        <div className="bar">
          <div className="bar-fill" style={{ width: `${pct}%` }} />
        </div>

        <ul className="reqs">
          {progress.map((p) => (
            <li className={`req ${p.satisfied ? "done" : ""}`} key={p.requirement.id}>
              <div className="req-top">
                <span className="req-label">
                  {p.satisfied ? "✓ " : ""}
                  {p.requirement.label}
                </span>
                <span className="muted small">{p.detail}</span>
              </div>
              <div className="bar sm">
                <div
                  className="bar-fill"
                  style={{ width: `${Math.round(p.fraction * 100)}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="side-block">
        <h4>Completed courses</h4>
        <CoursePicker
          catalog={catalog}
          completed={completed}
          onAdd={addCompleted}
          onRemove={removeCompleted}
        />
        <DarsPaste catalog={catalog} onImport={addManyCompleted} />
      </section>

      <section className="side-block">
        <h4>Planning settings</h4>
        <label className="field tight">
          <span>Entered UW (Autumn)</span>
          <select
            value={startYear}
            onChange={(e) => setStartYear(Number(e.target.value))}
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </label>
        <label className="field tight">
          <span>Max credits / quarter</span>
          <select
            value={creditCap}
            onChange={(e) => setCreditCap(Number(e.target.value))}
          >
            {[12, 13, 14, 15, 16, 17, 18].map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
      </section>
    </aside>
  );
}
