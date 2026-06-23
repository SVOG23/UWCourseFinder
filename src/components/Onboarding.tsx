import { useState } from "react";
import type { Catalog } from "../lib/courses";
import { PROGRAMS, getProgram } from "../data/programs";
import { useAppStore } from "../store/useAppStore";
import { CoursePicker } from "./CoursePicker";
import { DarsPaste } from "./DarsPaste";

interface Props {
  catalog: Catalog;
}

export function Onboarding({ catalog }: Props) {
  const completed = useAppStore((s) => s.completed);
  const startYear = useAppStore((s) => s.startYear);
  const addCompleted = useAppStore((s) => s.addCompleted);
  const addManyCompleted = useAppStore((s) => s.addManyCompleted);
  const removeCompleted = useAppStore((s) => s.removeCompleted);
  const setStartYear = useAppStore((s) => s.setStartYear);
  const setProgram = useAppStore((s) => s.setProgram);
  const setSpec = useAppStore((s) => s.setSpec);

  const [programId, setProgramId] = useState(PROGRAMS[0].id);
  const [specId, setSpecId] = useState("none");
  const program = getProgram(programId)!;

  const finish = () => {
    setProgram(programId);
    setSpec(specId);
  };

  const thisYear = new Date().getFullYear();
  const years = [thisYear - 4, thisYear - 3, thisYear - 2, thisYear - 1, thisYear, thisYear + 1];

  return (
    <div className="onboarding">
      <header className="hero">
        <div className="hero-badge">University of Washington</div>
        <h1>Course Finder</h1>
        <p className="hero-sub">
          Map a quarter-by-quarter path to your degree. Tell us your major and
          what you&apos;ve already taken — we&apos;ll plan the rest and show how
          every course unlocks the next.
        </p>
      </header>

      <section className="card step">
        <h2>
          <span className="step-num">1</span> Choose your degree
        </h2>
        <div className="program-grid">
          {PROGRAMS.map((p) => (
            <button
              key={p.id}
              className={`program-card ${p.id === programId ? "selected" : ""}`}
              onClick={() => setProgramId(p.id)}
            >
              <div className="program-name">{p.name}</div>
              <div className="program-school">{p.school}</div>
            </button>
          ))}
          <div className="program-card soon" aria-disabled>
            <div className="program-name">More majors coming</div>
            <div className="program-school">
              Programs are data-driven — see the README to add yours.
            </div>
          </div>
        </div>

        {program.specializations && program.specializations.length > 0 && (
          <label className="field">
            <span>Specialization</span>
            <select value={specId} onChange={(e) => setSpecId(e.target.value)}>
              {program.specializations.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
        )}
      </section>

      <section className="card step">
        <h2>
          <span className="step-num">2</span> Add courses you&apos;ve completed
        </h2>
        <p className="muted">
          Search and add them, or paste a DARS audit. Leave it empty if
          you&apos;re just starting — we&apos;ll plan from quarter one.
        </p>
        <CoursePicker
          catalog={catalog}
          completed={completed}
          onAdd={addCompleted}
          onRemove={removeCompleted}
        />
        <DarsPaste catalog={catalog} onImport={addManyCompleted} />
        <p className="muted small">
          {completed.length} course{completed.length === 1 ? "" : "s"} marked
          complete.
        </p>
      </section>

      <section className="card step">
        <h2>
          <span className="step-num">3</span> When did you start?
        </h2>
        <label className="field">
          <span>Entered UW in Autumn</span>
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
      </section>

      <div className="cta-row">
        <button className="btn btn-primary btn-lg" onClick={finish}>
          Build my degree map →
        </button>
      </div>
    </div>
  );
}
