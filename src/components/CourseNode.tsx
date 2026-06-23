import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";
import type { CourseStatus } from "../types";

export type CourseNodeData = {
  courseId: string;
  label: string;
  sub: string;
  credits: number;
  status: CourseStatus;
  completed: boolean;
  expanded: boolean;
  hasUnlocks: boolean;
  onToggle: (id: string) => void;
  onExpand: (id: string) => void;
  [key: string]: unknown;
};

export type CourseFlowNode = Node<CourseNodeData, "course">;

export function CourseNodeView({ data }: NodeProps<CourseFlowNode>) {
  const {
    label,
    sub,
    credits,
    status,
    completed,
    expanded,
    hasUnlocks,
    courseId,
    onToggle,
    onExpand,
  } = data;

  return (
    <div
      className={`cnode cnode-${status}`}
      onClick={() => hasUnlocks && onExpand(courseId)}
    >
      <Handle type="target" position={Position.Left} />
      <div className="cnode-head">
        <span className="mono cnode-id">{label}</span>
        <input
          type="checkbox"
          checked={completed}
          aria-label={`Mark ${label} complete`}
          title="Mark complete"
          onClick={(e) => e.stopPropagation()}
          onChange={() => onToggle(courseId)}
        />
      </div>
      <div className="cnode-title" title={sub}>
        {sub}
      </div>
      <div className="cnode-foot">
        <span className="cnode-cr">{credits} cr</span>
        {hasUnlocks && (
          <button
            className="cnode-expand"
            onClick={(e) => {
              e.stopPropagation();
              onExpand(courseId);
            }}
          >
            {expanded ? "− hide" : "+ unlocks"}
          </button>
        )}
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

export const nodeTypes = { course: CourseNodeView };
