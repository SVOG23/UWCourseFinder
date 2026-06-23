import { useAppStore } from "../store/useAppStore";
import { currentTermShort } from "../lib/plan";

export function Header() {
  const query = useAppStore((s) => s.query);
  const setQuery = useAppStore((s) => s.setQuery);

  return (
    <header className="app-header">
      <div className="header-inner">
        <div className="brand">
          <div className="brand-mark serif">W</div>
          <span className="brand-name">Course Finder</span>
        </div>
        <div className="header-search">
          <div className="wrap">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#9a93a8" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.5" y2="16.5" />
            </svg>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search courses, e.g. CSE 332"
              aria-label="Search courses"
            />
          </div>
        </div>
        <div className="header-right">
          <span className="term-badge">{currentTermShort()}</span>
          <div className="avatar" aria-hidden>UW</div>
        </div>
      </div>
    </header>
  );
}
