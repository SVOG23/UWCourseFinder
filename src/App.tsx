import { useEffect, useState } from "react";
import { Catalog, loadCatalog } from "./lib/courses";
import { getProgram } from "./data/programs";
import { useAppStore } from "./store/useAppStore";
import { Onboarding } from "./components/Onboarding";
import { Header } from "./components/Header";
import { Sidebar } from "./components/Sidebar";
import { PlanBoard } from "./components/PlanBoard";
import { PrereqGraph } from "./components/PrereqGraph";

export default function App() {
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [error, setError] = useState<string | null>(null);

  const programId = useAppStore((s) => s.programId);
  const specId = useAppStore((s) => s.specId);
  const view = useAppStore((s) => s.view);

  useEffect(() => {
    loadCatalog()
      .then(setCatalog)
      .catch((e) => setError(e instanceof Error ? e.message : String(e)));
  }, []);

  if (error) {
    return (
      <div className="loading">
        <p>Couldn&apos;t load the course catalog.</p>
        <p className="muted small">{error}</p>
      </div>
    );
  }

  if (!catalog) {
    return (
      <div className="loading">
        <div className="spinner" />
        <p>Loading the UW course catalog…</p>
      </div>
    );
  }

  const program = programId ? getProgram(programId) : undefined;

  if (!program) {
    return <Onboarding catalog={catalog} />;
  }

  return (
    <div className="app">
      <Header program={program} />
      <div className="main">
        <Sidebar catalog={catalog} program={program} specId={specId} />
        <div className="content">
          {view === "plan" ? (
            <PlanBoard catalog={catalog} program={program} specId={specId} />
          ) : (
            <PrereqGraph catalog={catalog} program={program} specId={specId} />
          )}
          <footer className="disclaimer">
            ⚠️ This is a planning aid, not an official audit. Course data scraped
            from the{" "}
            <a href="https://www.washington.edu/students/crscat/" target="_blank" rel="noreferrer">
              UW Course Catalog
            </a>
            ; prerequisite logic is simplified. Always confirm requirements with
            an official{" "}
            <a href="https://myplan.uw.edu" target="_blank" rel="noreferrer">
              DARS audit
            </a>{" "}
            and your adviser.
          </footer>
        </div>
      </div>
    </div>
  );
}
