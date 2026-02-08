import { Handle, Position } from "@xyflow/react";
import React, { memo } from "react";

interface Props {
  collapsed: boolean;
  onToggle: () => void;
  childCount: number;
}

export const RightHandle = memo(({ collapsed, onToggle, childCount }: Props) => {
  const countLabel = childCount > 99 ? "99+" : String(childCount);
  return (
    <React.Fragment>
      {/* 子がある場合は常に表示: 折りたたまれている時は子の数のみ、展開されている時は−のみ */}
      <div className="absolute -right-[14px] -mx-[18px] top-1/2 -translate-y-1/2 pointer-events-auto flex items-center justify-center">
        <button
          type="button"
          className="
            w-4 h-4
            rounded-full
            bg-white dark:bg-zinc-700
            border-2 border-zinc-400 dark:border-zinc-500
            cursor-pointer
            hover:bg-zinc-100 dark:hover:bg-zinc-600
            flex items-center justify-center gap-0.5
            text-xs font-bold
            text-zinc-600 dark:text-zinc-400
            transition-colors duration-150
          "
          title={collapsed ? "展開" : "折りたたみ"}
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onToggle();
          }}
        >
          {collapsed ? (
            <span
              className="tabular-nums"
              title={`子グループ: ${childCount}件`}
            >
              {countLabel}
            </span>
          ) : (
            <span aria-hidden>−</span>
          )}
        </button>
      </div>
      {/* 子がある場合は常に source ハンドルを表示（エッジを表示するため） */}
      <Handle
        id="right"
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-zinc-400 dark:bg-zinc-600"
      />
    </React.Fragment>
  );
});

RightHandle.displayName = "RightHandle";
