import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Catalog } from "../lib/courses";
import { useAppStore } from "../store/useAppStore";
import { displayStatus } from "../lib/plan";

const NW = 156;
const NH = 64;
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

type Pos = Record<string, { x: number; y: number }>;
type Drag =
  | { type: "pan"; sx: number; sy: number; px: number; py: number }
  | { type: "node"; id: string; ox: number; oy: number; moved: boolean; sx: number; sy: number };

export function PrereqMap({ catalog }: { catalog: Catalog }) {
  const plan = useAppStore((s) => s.plan);
  const quarters = useAppStore((s) => s.quarters);
  const setSelected = useAppStore((s) => s.setSelected);

  const canvasRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<Drag | null>(null);

  const [zoom, setZoom] = useState(0.62);
  const [pan, setPan] = useState({ x: 28, y: 14 });
  const [nodePos, setNodePos] = useState<Pos | null>(null);
  const [grabbing, setGrabbing] = useState(false);

  // Default positions: one column per quarter, courses stacked & centered.
  const defaultPos = useMemo<Pos>(() => {
    const pitchX = 196;
    const x0 = 24;
    const totalH = 540;
    const vGap = 20;
    const padTop = 16;
    const pos: Pos = {};
    quarters.forEach((q, ti) => {
      const ids = plan[q.id] ?? [];
      const block = ids.length * NH + (ids.length - 1) * vGap;
      const startY = padTop + (totalH - 2 * padTop - block) / 2;
      ids.forEach((id, i) => {
        pos[id] = { x: x0 + ti * pitchX, y: startY + i * (NH + vGap) };
      });
    });
    return pos;
  }, [plan, quarters]);

  const pos = nodePos ?? defaultPos;

  // mirror live values into refs so pointer handlers stay stable
  const zoomRef = useRef(zoom);
  const panRef = useRef(pan);
  const posRef = useRef(pos);
  zoomRef.current = zoom;
  panRef.current = pan;
  posRef.current = pos;

  const edges = useMemo(() => {
    const out: string[] = [];
    for (const id of Object.keys(pos)) {
      const c = catalog.get(id);
      if (!c) continue;
      for (const p of c.prereqs) {
        if (pos[p] && pos[id]) {
          const x1 = pos[p].x + NW;
          const y1 = pos[p].y + NH / 2;
          const x2 = pos[id].x;
          const y2 = pos[id].y + NH / 2;
          const mx = (x1 + x2) / 2;
          out.push(`M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`);
        }
      }
    }
    return out;
  }, [pos, catalog]);

  const fitView = useCallback(() => {
    const el = canvasRef.current;
    if (!el) return;
    const cw = el.clientWidth;
    const ch = el.clientHeight;
    if (cw < 40) {
      requestAnimationFrame(fitView);
      return;
    }
    const p = posRef.current;
    const ids = Object.keys(p);
    let worldW = 1200;
    let worldH = 540;
    if (ids.length) {
      let mx = 0;
      let my = 0;
      for (const id of ids) {
        mx = Math.max(mx, p[id].x + NW);
        my = Math.max(my, p[id].y + NH);
      }
      worldW = Math.max(200, mx + 24);
      worldH = Math.max(200, my + 24);
    }
    const z = clamp(Math.min((cw - 36) / worldW, (ch - 36) / worldH), 0.25, 1.1);
    setZoom(z);
    setPan({ x: (cw - worldW * z) / 2, y: (ch - worldH * z) / 2 });
  }, []);

  const zoomAtCenter = useCallback((factor: number) => {
    const el = canvasRef.current;
    const old = zoomRef.current;
    const nz = clamp(old * factor, 0.25, 2.4);
    if (el) {
      const sx = el.clientWidth / 2;
      const sy = el.clientHeight / 2;
      const p = panRef.current;
      setPan({ x: sx - ((sx - p.x) / old) * nz, y: sy - ((sy - p.y) / old) * nz });
    }
    setZoom(nz);
  }, []);

  const onMove = useCallback((e: PointerEvent) => {
    const d = dragRef.current;
    const el = canvasRef.current;
    if (!d || !el) return;
    if (d.type === "pan") {
      setPan({ x: d.px + (e.clientX - d.sx), y: d.py + (e.clientY - d.sy) });
    } else {
      if (Math.abs(e.clientX - d.sx) + Math.abs(e.clientY - d.sy) > 3) d.moved = true;
      const z = zoomRef.current;
      const p = panRef.current;
      const rect = el.getBoundingClientRect();
      const wx = (e.clientX - rect.left - p.x) / z;
      const wy = (e.clientY - rect.top - p.y) / z;
      setNodePos({ ...posRef.current, [d.id]: { x: wx - d.ox, y: wy - d.oy } });
    }
  }, []);

  const onUp = useCallback(() => {
    const d = dragRef.current;
    dragRef.current = null;
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerup", onUp);
    setGrabbing(false);
    if (d && d.type === "node" && !d.moved) setSelected(d.id);
  }, [onMove, setSelected]);

  const startPan = useCallback(
    (e: React.PointerEvent) => {
      if (e.button !== 0) return;
      const p = panRef.current;
      dragRef.current = { type: "pan", sx: e.clientX, sy: e.clientY, px: p.x, py: p.y };
      setGrabbing(true);
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    },
    [onMove, onUp],
  );

  const startNode = useCallback(
    (id: string, e: React.PointerEvent) => {
      e.stopPropagation();
      const el = canvasRef.current;
      if (!el) return;
      const z = zoomRef.current;
      const p = panRef.current;
      const rect = el.getBoundingClientRect();
      const wx = (e.clientX - rect.left - p.x) / z;
      const wy = (e.clientY - rect.top - p.y) / z;
      const np = posRef.current[id];
      if (!np) return;
      dragRef.current = { type: "node", id, ox: wx - np.x, oy: wy - np.y, moved: false, sx: e.clientX, sy: e.clientY };
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    },
    [onMove, onUp],
  );

  // wheel-to-zoom (attached non-passively so we can preventDefault)
  const onWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const el = canvasRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;
    const old = zoomRef.current;
    const nz = clamp(old * (e.deltaY < 0 ? 1.12 : 0.89), 0.25, 2.4);
    const p = panRef.current;
    setPan({ x: sx - ((sx - p.x) / old) * nz, y: sy - ((sy - p.y) / old) * nz });
    setZoom(nz);
  }, []);

  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [onWheel]);

  // Reset drags and refit whenever the set of plan nodes changes.
  const nodeKey = quarters.map((q) => `${q.id}:${(plan[q.id] ?? []).join("|")}`).join(";");
  useEffect(() => {
    setNodePos(null);
    const t = setTimeout(fitView, 60);
    return () => clearTimeout(t);
  }, [nodeKey, fitView]);

  const ids = Object.keys(pos);

  return (
    <div className="map-panel">
      <div className="map-legend">
        <span className="lt">Legend</span>
        <span className="leg"><i className="completed" />Completed</span>
        <span className="leg"><i className="planned" />Planned</span>
        <span className="leg"><i className="available" />Available later</span>
      </div>

      <div
        ref={canvasRef}
        className={`map-canvas${grabbing ? " grabbing" : ""}`}
        onPointerDown={startPan}
      >
        <div className="map-world" style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}>
          <svg width="2400" height="1400" style={{ position: "absolute", left: 0, top: 0, overflow: "visible", pointerEvents: "none" }}>
            {edges.map((d, i) => (
              <path key={i} d={d} fill="none" stroke="#cfc8b9" strokeWidth={2} />
            ))}
          </svg>
          {ids.map((id) => {
            const c = catalog.get(id);
            if (!c) return null;
            const st = displayStatus(id, plan, quarters);
            const p = pos[id];
            return (
              <div
                key={id}
                className={`map-node node-${st}`}
                style={{ left: p.x, top: p.y }}
                onPointerDown={(e) => startNode(id, e)}
              >
                <div className="code">{c.id}</div>
                <div className="ntitle">{c.title}</div>
              </div>
            );
          })}
        </div>

        <div className="map-controls" onPointerDown={(e) => e.stopPropagation()}>
          <button className="map-ctl" title="Zoom in" onClick={() => zoomAtCenter(1.18)}>+</button>
          <button className="map-ctl" title="Zoom out" onClick={() => zoomAtCenter(0.85)}>−</button>
          <button className="map-ctl" title="Fit to view" onClick={fitView}>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
            </svg>
          </button>
        </div>

        {ids.length === 0 && <div className="map-empty">No courses in your plan yet.</div>}
        <div className="map-hint">Drag a node to move it · scroll to zoom · drag canvas to pan</div>
      </div>
    </div>
  );
}
