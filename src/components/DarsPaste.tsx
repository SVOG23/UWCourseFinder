import { useState } from "react";
import type { Catalog } from "../lib/courses";
import { parseCompletedCodes } from "../lib/dars";

interface Props {
  catalog: Catalog;
  onImport: (ids: string[]) => void;
}

export function DarsPaste({ catalog, onImport }: Props) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [count, setCount] = useState<number | null>(null);

  const handleImport = () => {
    const ids = parseCompletedCodes(text, (id) => catalog.byId.has(id));
    onImport(ids);
    setCount(ids.length);
  };

  return (
    <div className="dars">
      <button className="link-btn" onClick={() => setOpen((o) => !o)}>
        {open ? "▾" : "▸"} Import from a DARS audit / transcript
      </button>
      {open && (
        <div className="dars-body">
          <p className="muted small">
            Open your audit at{" "}
            <a href="https://myplan.uw.edu" target="_blank" rel="noreferrer">
              myplan.uw.edu
            </a>{" "}
            (or your unofficial transcript), select all, and paste it below. We
            scan it for course codes and add the ones we recognize — nothing
            leaves your browser.
          </p>
          <textarea
            className="dars-text"
            rows={6}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste your DARS audit or transcript text here…"
          />
          <div className="row gap">
            <button className="btn" onClick={handleImport} disabled={!text.trim()}>
              Scan &amp; add courses
            </button>
            {count !== null && (
              <span className="muted small">
                {count > 0
                  ? `Added ${count} recognized course${count === 1 ? "" : "s"}.`
                  : "No recognizable course codes found."}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
