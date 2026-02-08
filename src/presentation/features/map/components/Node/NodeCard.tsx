"use client";

import { forwardRef } from "react";

interface Props {
  nodeId: string;
  width: number;
  selected: boolean;
  onDoubleClick: (e: React.MouseEvent) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  children: React.ReactNode;
}

/**
 * ノードカードコンポーネント
 *
 * ノードの見た目と構造を担当するプレゼンテーションコンポーネントです。
 * スタイル、data-node-id、tabIndex、イベントハンドラを集約します。
 *
 * @param props - NodeCardコンポーネントのProps
 * @param props.nodeId - ノードID
 * @param props.width - ノードの幅
 * @param props.selected - 選択されているかどうか
 * @param props.isEditing - 編集中かどうか
 * @param props.onDoubleClick - ダブルクリック時のハンドラ
 * @param props.onKeyDown - キーボードイベントハンドラ
 * @param props.children - 子要素（NodeContent + WidthResizeHandle + プレビュー枠）
 * @returns ノードカードのコンポーネント
 */
export const NodeCard = forwardRef<HTMLDivElement, Props>(
  ({ nodeId, width, selected, onDoubleClick, onKeyDown, children }, ref) => {
    return (
      <div
        ref={ref}
        tabIndex={-1}
        data-node-id={nodeId}
        style={{
          width,
        }}
        className={`
          min-h-[36px]
          bg-white dark:bg-zinc-800
          rounded-lg shadow-md
          px-4 py-2
          text-left
          text-sm font-medium
          text-zinc-900 dark:text-zinc-100
          border-2 transition-all
          flex items-center justify-start
          relative
          focus:outline-none
          ${
            selected
              ? "border-blue-500 dark:border-blue-400 shadow-lg scale-105"
              : "border-transparent hover:border-zinc-300 dark:hover:border-zinc-600"
          }
        `}
        onDoubleClick={onDoubleClick}
        onKeyDown={onKeyDown}
      >
        {children}
      </div>
    );
  },
);

NodeCard.displayName = "NodeCard";
