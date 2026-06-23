import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import type { Program } from "../types";
import { Catalog, creditsOf, statusOf } from "../lib/courses";
import { effectiveRequirements } from "../data/programs";
import { layoutGraph } from "../lib/layout";
import { useAppStore } from "../store/useAppStore";
import { nodeTypes, type CourseFlowNode } from "./CourseNode";

interface Props {
  catalog: Catalog;
  program: Program;
  specId: string | null;
}

/**
 * The curated set of courses for a program. We deliberately do NOT chase the
 * full prerequisite ancestor graph here — the scraped prereqs include alternate
 * tracks and remedial chains that clutter the map. Edges are drawn only between
 * courses already in this set; students reveal anything beyond it on demand by
 * clicking a node to expand its real catalog "unlocks".
 */
function programMapIds(
  catalog: Catalog,
  program: Program,
  specId: string | null,
): Set<string> {
  const ids = new Set<string>();
  for (const r of effectiveRequirements(program, specId)) {
    for (const c of r.courses) if (catalog.get(c)) ids.add(c);
  }
  return ids;
}

function GraphInner({ catalog, program, specId }: Props) {
  const completed = useAppStore((s) => s.completed);
  const toggleCompleted = useAppStore((s) => s.toggleCompleted);
  const completedSet = useMemo(() => new Set(completed), [completed]);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const { fitView } = useReactFlow();

  const baseIds = useMemo(
    () => programMapIds(catalog, program, specId),
    [catalog, program, specId],
  );

  const onExpand = useCallback((id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const { nodes, edges } = useMemo(() => {
    const ids = new Set(baseIds);
    for (const id of expanded) {
      for (const u of catalog.unlocks(id).slice(0, 14)) ids.add(u.id);
    }

    const flowNodes: CourseFlowNode[] = [];
    for (const id of ids) {
      const c = catalog.get(id);
      if (!c) continue;
      flowNodes.push({
        id,
        type: "course",
        position: { x: 0, y: 0 },
        data: {
          courseId: id,
          label: id,
          sub: c.title,
          credits: creditsOf(c),
          status: statusOf(c, completedSet),
          completed: completedSet.has(id),
          expanded: expanded.has(id),
          hasUnlocks: catalog.unlocks(id).length > 0,
          onToggle: toggleCompleted,
          onExpand,
        },
      });
    }

    const flowEdges: Edge[] = [];
    for (const id of ids) {
      const c = catalog.get(id);
      if (!c) continue;
      for (const p of c.prereqs) {
        if (!ids.has(p)) continue;
        flowEdges.push({
          id: `${p}->${id}`,
          source: p,
          target: id,
          animated: completedSet.has(p) && !completedSet.has(id),
        });
      }
    }

    return { nodes: layoutGraph(flowNodes, flowEdges), edges: flowEdges };
  }, [baseIds, expanded, completedSet, catalog, onExpand, toggleCompleted]);

  // Refit whenever the set of visible nodes changes.
  useEffect(() => {
    const t = setTimeout(() => fitView({ padding: 0.15, duration: 300 }), 30);
    return () => clearTimeout(t);
  }, [nodes.length, fitView]);

  return (
    <div className="graph-wrap">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        nodesDraggable={false}
        fitView
        minZoom={0.15}
        proOptions={{ hideAttribution: true }}
      >
        <Background gap={20} color="#e7e2f0" />
        <Controls showInteractive={false} />
        <MiniMap pannable zoomable nodeStrokeWidth={2} />
      </ReactFlow>
      <div className="legend">
        <span className="legend-item">
          <i className="dot done" /> Completed
        </span>
        <span className="legend-item">
          <i className="dot avail" /> Available now
        </span>
        <span className="legend-item">
          <i className="dot locked" /> Prereqs needed
        </span>
        <span className="legend-hint">
          Click a course to reveal what it unlocks · check the box to mark it done
        </span>
      </div>
    </div>
  );
}

export function PrereqGraph(props: Props) {
  return (
    <ReactFlowProvider>
      <GraphInner {...props} />
    </ReactFlowProvider>
  );
}
