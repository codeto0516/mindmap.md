import { Handle, Position } from "@xyflow/react";

export const LeftHandle = () => {
  return (
    <Handle
      id="left"
      type="target"
      position={Position.Left}
      className="w-3 h-3 bg-zinc-400 dark:bg-zinc-600"
    />
  );
};
