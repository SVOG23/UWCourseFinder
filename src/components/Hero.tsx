import { useMemo } from "react";
import { Catalog } from "../lib/courses";
import { useAppStore } from "../store/useAppStore";
import { getProgram, PROGRAMS } from "../data/programs";
import { planCredits } from "../lib/plan";

const RADIUS = 52;
const CIRC = 2 * Math.PI * RADIUS;

export function Hero({ catalog }: { catalog: Catalog }) {
  const programId = useAppStore((s) => s.programId);
  const specId = useAppStore((s) => s.specId);
  const plan = useAppStore((s) => s.plan);
  const quarters = useAppStore((s) => s.quarters);
  const setProgram = useAppStore((s) => s.setProgram);
  const setSpec = useAppStore((s) => s.setSpec);

  const program = getProgram(programId);

  const earned = useMemo(
    () => (program ? planCredits(catalog, plan, quarters, "completed") : 0),
    [catalog, plan, quarters, program],
  );
  const planned = useMemo(
    () => (program ? planCredits(catalog, plan, quarters, "planned") : 0),
    [catalog, plan, quarters, program],
  );

  if (!program) return null;

  const total = program.totalCreditsForDegree;
  const remaining = Math.max(0, total - earned);
  const pct = total ? Math.round((earned / total) * 100) : 0;
  const offset = CIRC * (1 - Math.min(1, total ? earned / total : 0));
  const expected = quarters.length ? quarters[quarters.length - 1].term : "—";

  return (
    <section className="hero">
      <div className="hero-blob1" />
      <div className="hero-blob2" />

      <div className="hero-left">
        <div className="hero-kicker">MY DEGREE PLAN</div>
        <h1 className="hero-title">{program.name}</h1>
        <div className="hero-sub">
          {program.school} &nbsp;·&nbsp; Expected <strong>{expected}</strong>
        </div>
        <div className="hero-selectors">
          <select
            className="hero-select"
            value={programId}
            onChange={(e) => setProgram(catalog, e.target.value)}
            aria-label="Degree program"
          >
            {PROGRAMS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          {program.specializations && program.specializations.length > 0 && (
            <select
              className="hero-select"
              value={specId}
              onChange={(e) => setSpec(catalog, e.target.value)}
              aria-label="Specialization"
            >
              {program.specializations.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          )}
        </div>
        <div className="hero-chips">
          <span className="hero-chip">
            <span className="dot" />On track to graduate
          </span>
          <span className="hero-chip">{planned} credits planned</span>
        </div>
      </div>

      <div className="hero-stats">
        <div className="ring">
          <svg viewBox="0 0 120 120" width="100%" height="100%">
            <circle cx="60" cy="60" r={RADIUS} fill="none" stroke="rgba(255,255,255,0.16)" strokeWidth="11" />
            <circle
              cx="60"
              cy="60"
              r={RADIUS}
              fill="none"
              stroke="#b7a57a"
              strokeWidth="11"
              strokeLinecap="round"
              strokeDasharray={CIRC}
              strokeDashoffset={offset}
            />
          </svg>
          <div className="ring-center">
            <div className="ring-pct">{pct}%</div>
            <div className="ring-lbl">COMPLETE</div>
          </div>
        </div>
        <div className="hero-stat-col">
          <div className="hero-stat">
            <div className="num">
              {earned}
              <small> / {total}</small>
            </div>
            <div className="cap">credits earned</div>
          </div>
          <div className="hero-stat">
            <div className="num">{remaining}</div>
            <div className="cap">credits remaining</div>
          </div>
        </div>
      </div>
    </section>
  );
}
