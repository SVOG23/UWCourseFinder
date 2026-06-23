import { useMemo, useState } from "react";
import type { Catalog } from "../lib/courses";

interface Props {
  catalog: Catalog;
  completed: string[];
  onAdd: (id: string) => void;
  onRemove: (id: string) => void;
}

export function CoursePicker({ catalog, completed, onAdd, onRemove }: Props) {
  const [q, setQ] = useState("");
  const results = useMemo(() => (q ? catalog.search(q, 12) : []), [q, catalog]);
  const completedSet = useMemo(() => new Set(completed), [completed]);

  return (
    <div className="picker">
      <input
        className="picker-input"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search a course — e.g. “CSE 143” or “calculus”"
        aria-label="Search courses"
      />
      {results.length > 0 && (
        <ul className="picker-results">
          {results.map((c) => {
            const added = completedSet.has(c.id);
            return (
              <li key={c.id}>
                <button
                  className="picker-result"
                  disabled={added}
                  onClick={() => {
                    onAdd(c.id);
                    setQ("");
                  }}
                >
                  <span className="mono">{c.id}</span>
                  <span className="picker-title">{c.title}</span>
                  <span className="picker-add">{added ? "✓ added" : "+ add"}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {completed.length > 0 && (
        <div className="chips" aria-label="Completed courses">
          {completed.map((id) => (
            <span className="chip" key={id}>
              <span className="mono">{id}</span>
              <button
                className="chip-x"
                aria-label={`Remove ${id}`}
                onClick={() => onRemove(id)}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
