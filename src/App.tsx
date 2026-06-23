import { useEffect, useState } from "react";
import { Catalog, loadCatalog } from "./lib/courses";
import { useAppStore } from "./store/useAppStore";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { CatalogSidebar } from "./components/CatalogSidebar";
import { PlanGrid } from "./components/PlanGrid";
import { PrereqMap } from "./components/PrereqMap";
import { CourseDrawer } from "./components/CourseDrawer";

export default function App() {
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [error, setError] = useState<string | null>(null);

  const tab = useAppStore((s) => s.tab);
  const setTab = useAppStore((s) => s.setTab);
  const ensureSeed = useAppStore((s) => s.ensureSeed);

  useEffect(() => {
    loadCatalog()
      .then(setCatalog)
      .catch((e) => setError(e instanceof Error ? e.message : String(e)));
  }, []);

  useEffect(() => {
    if (catalog) ensureSeed(catalog);
  }, [catalog, ensureSeed]);

  if (error) {
    return (
      <div className="loading">
        <p>Couldn&apos;t load the course catalog.</p>
        <p className="small">{error}</p>
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

  return (
    <>
      <Header />
      <div className="pagewrap">
        <Hero catalog={catalog} />

        <div className="tabs" role="tablist">
          <button
            className={`tab${tab === "plan" ? " active" : ""}`}
            onClick={() => setTab("plan")}
            role="tab"
            aria-selected={tab === "plan"}
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="5" height="16" rx="1" />
              <rect x="10" y="4" width="5" height="16" rx="1" />
              <rect x="17" y="4" width="4" height="16" rx="1" />
            </svg>
            Quarter Plan
          </button>
          <button
            className={`tab${tab === "map" ? " active" : ""}`}
            onClick={() => setTab("map")}
            role="tab"
            aria-selected={tab === "map"}
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="5" cy="12" r="2.5" />
              <circle cx="19" cy="6" r="2.5" />
              <circle cx="19" cy="18" r="2.5" />
              <line x1="7.3" y1="11" x2="16.7" y2="7" />
              <line x1="7.3" y1="13" x2="16.7" y2="17" />
            </svg>
            Prerequisite Map
          </button>
        </div>

        <div className="dash-grid">
          <CatalogSidebar catalog={catalog} />
          <section>
            {tab === "plan" ? <PlanGrid catalog={catalog} /> : <PrereqMap catalog={catalog} />}
          </section>
        </div>
      </div>

      <footer className="disclaimer">
        ⚠️ This is a planning aid, not an official audit. Course data is from the{" "}
        <a href="https://www.washington.edu/students/crscat/" target="_blank" rel="noreferrer">
          UW Course Catalog
        </a>{" "}
        and prerequisite logic is simplified. Always confirm requirements with an
        official{" "}
        <a href="https://myplan.uw.edu" target="_blank" rel="noreferrer">
          DARS audit
        </a>{" "}
        and your adviser.
      </footer>

      <CourseDrawer catalog={catalog} />
    </>
  );
}
