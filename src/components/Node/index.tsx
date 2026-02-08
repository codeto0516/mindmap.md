"use client";

import { useRef, useLayoutEffect, useState, useCallback } from "react";
import { NodeData } from "@/utils/types";
import { DEFAULTS } from "@/utils/constants";
import { RightHandle } from "./RightHandle";
import { LeftHandle } from "./LeftHandle";
import { EditMode } from "./EditMode";
import { ViewMode } from "./ViewMode";
import { WidthResizeHandle } from "./WidthResizeHandle";
import { NodeCard } from "./NodeCard";

interface Props {
  data: NodeData;
  selected: boolean;
  id: string;
}

/**
 * マインドマップノードのカスタムコンポーネント
 *
 * React Flowのカスタムノードとして、マインドマップのノードを表示します。
 * Tailwind CSSでスタイリングされ、展開/折りたたみインジケーターを含みます。
 * ダブルクリックで編集モードに入り、タイトルを編集できます。
 *
 * @param props - React FlowのNodeProps
 * @param props.data - ノードデータ（mindNodeとonUpdateTitleを含む）
 * @param props.selected - ノードが選択されているかどうか
 * @param props.id - ノードID
 * @returns マインドマップノードのコンポーネント
 */
export const Node = ({ data, selected, id }: Props) => {
  const {
    mindNode,
    isEditing,
    initialEditKey,
    layout,
    actions,
  } = data;
  const {
    currentWidth,
    onWidthConfirm,
    onNodeHeightChange,
  } = layout ?? {};
  const {
    onStartEdit,
    onEndEdit,
    onUpdateTitle,
    onToggleNode,
    onKeyDown,
  } = actions ?? {};

  const hasChildren = mindNode.children && mindNode.children.length > 0;
  const collapsed = mindNode.collapsed === true;
  const cardRef = useRef<HTMLDivElement>(null);
  const lastReportedHeightRef = useRef<number | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  // ドラッグ中のプレビュー幅（nullの場合は表示しない）
  const [previewWidth, setPreviewWidth] = useState<number | null>(null);

  // 編集終了時にカードへフォーカスを戻すラッパー
  const handleEndEdit = useCallback(() => {
    if (onEndEdit) {
      onEndEdit();
    }
    // 編集終了後にカードにフォーカスを戻す（Enter/Tab で新規ノード作成できるようにする）
    cardRef.current?.focus();
  }, [onEndEdit]);

  // ResizeObserver を ref コールバックで登録・解除
  const setCardRef = useCallback(
    (el: HTMLDivElement | null) => {
      cardRef.current = el;
      if (el && onNodeHeightChange) {
        // 要素がマウントされたとき、ResizeObserver を登録
        if (!resizeObserverRef.current) {
          resizeObserverRef.current = new ResizeObserver((entries) => {
            for (const entry of entries) {
              const h = Math.round((entry.target as HTMLElement).offsetHeight);
              if (h !== lastReportedHeightRef.current) {
                lastReportedHeightRef.current = h;
                onNodeHeightChange(id, h);
              }
            }
          });
        }
        resizeObserverRef.current.observe(el);
      } else if (!el && resizeObserverRef.current) {
        // 要素がアンマウントされたとき、ResizeObserver を解除
        resizeObserverRef.current.disconnect();
      }
    },
    [id, onNodeHeightChange],
  );

  // 幅変更後はリフロー完了後に高さを再計測してレイアウトを再計算（子ノードを持つノードの伸長時など）
  useLayoutEffect(() => {
    if (currentWidth === undefined || !onNodeHeightChange) return;
    const el = cardRef.current;
    if (!el) return;
    // 二重 rAF でレイアウト・ペイント完了後に計測
    const raf1 = requestAnimationFrame(() => {
      const raf2 = requestAnimationFrame(() => {
        rafIdRef.current = null;
        const h = Math.round(el.offsetHeight);
        if (h !== lastReportedHeightRef.current) {
          lastReportedHeightRef.current = h;
          onNodeHeightChange(id, h);
        }
      });
      rafIdRef.current = raf2;
    });
    return () => {
      cancelAnimationFrame(raf1);
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, [currentWidth, id, onNodeHeightChange]);

  const isRoot = data.isRoot === true;

  return (
    <div className="relative">
      {!isRoot && <LeftHandle />}

      <NodeCard
        ref={setCardRef}
        nodeId={id}
        width={currentWidth ?? DEFAULTS.NODE_WIDTH}
        selected={selected}
        onDoubleClick={(e) => {
          // イベントの伝播とデフォルト動作を確実に停止
          e.stopPropagation();
          e.preventDefault();
          if (!isEditing && onStartEdit) {
            onStartEdit(id);
          }
        }}
        onKeyDown={onKeyDown}
      >
        {isEditing ? (
          <EditMode
            id={id}
            mindNode={mindNode}
            initialEditKey={initialEditKey}
            onEndEdit={handleEndEdit}
            onUpdateTitle={onUpdateTitle}
            onNodeHeightChange={onNodeHeightChange}
          />
        ) : (
          <ViewMode title={mindNode.title} />
        )}
        {currentWidth !== undefined && onWidthConfirm && (
          <WidthResizeHandle
            currentWidth={currentWidth}
            onPreviewWidthChange={setPreviewWidth}
            onWidthConfirm={onWidthConfirm}
            isEditing={isEditing}
          />
        )}
        {/* ドラッグ中の仮想枠 */}
        {previewWidth !== null && (
          <div
            className="absolute top-0 left-0 bottom-0 pointer-events-none z-20 rounded-lg border-2 border-dashed border-blue-500 dark:border-blue-400"
            style={{
              width: previewWidth,
            }}
          />
        )}
      </NodeCard>

      {hasChildren && (
        <RightHandle
          collapsed={collapsed}
          onToggle={() => onToggleNode?.(id)}
          childCount={mindNode.children?.length ?? 0}
        />
      )}
    </div>
  );
};
