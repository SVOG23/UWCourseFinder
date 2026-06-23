import type { Program } from "../types";
import { useAppStore } from "../store/useAppStore";

export function Header({ program }: { program: Program }) {
  const view = useAppStore((s) => s.view);
  const setView = useAppStore((s) => s.setView);
  const resetAll = useAppStore((s) => s.resetAll);

  return (
    <header className="topbar">
      <div className="brand">
        <span className="brand-mark">W</span>
        <div className="brand-text">
          <span className="brand-title">UW Course Finder</span>
          <span className="brand-sub">{program.name}</span>
        </div>
      </div>

      <nav className="tabs" aria-label="Views">
        <button
          className={`tab ${view === "plan" ? "active" : ""}`}
          onClick={() => setView("plan")}
        >
          Quarter Plan
        </button>
        <button
          className={`tab ${view === "map" ? "active" : ""}`}
          onClick={() => setView("map")}
        >
          Prerequisite Map
        </button>
      </nav>

      <button
        className="btn ghost"
        onClick={() => {
          if (
            window.confirm(
              "Start over? This clears your major and completed courses.",
            )
          ) {
            resetAll();
          }
        }}
      >
        Start over
      </button>
    </header>
  );
}
