import { useState, useEffect, useRef, startTransition, useMemo } from "react";
import type { MindNode } from "@/types/mind-node";

/**
 * マインドマップの状態管理を行うカスタムフック
 *
 * マインドマップのデータと選択中のノードIDを管理します。
 * initialDataが変更された場合、状態を自動的に同期します。
 * 複数選択に対応しており、selectedNodeIdsで複数のノードを選択できます。
 *
 * @param initialData - マインドマップの初期データ
 * @returns 状態と状態更新関数を含むオブジェクト
 * @returns data - 現在のマインドマップデータ
 * @returns setData - マインドマップデータを更新する関数
 * @returns selectedNodeIds - 選択中のノードIDの配列
 * @returns setSelectedNodeIds - 選択中のノードIDの配列を更新する関数
 * @returns selectedNodeId - 選択中の最初のノードID（後方互換性のため、selectedNodeIds[0] || null）
 * @returns setSelectedNodeId - 選択中のノードIDを更新する関数（後方互換性のため、単一選択として動作）
 *
 * @example
 * ```tsx
 * const { data, setData, selectedNodeIds, setSelectedNodeIds, selectedNodeId, setSelectedNodeId } = useMindMapState(initialData);
 * ```
 */
export function useMindMapState(initialData: MindNode) {
  const [data, setData] = useState<MindNode>(initialData);
  const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>([]);
  const prevInitialDataRef = useRef<MindNode>(initialData);

  // 後方互換性のため、selectedNodeIdを計算
  const selectedNodeId = useMemo(
    () => selectedNodeIds[0] || null,
    [selectedNodeIds],
  );

  // 後方互換性のため、setSelectedNodeIdを提供
  const setSelectedNodeId = useMemo(
    () => (nodeId: string | null) => {
      setSelectedNodeIds(nodeId ? [nodeId] : []);
    },
    [],
  );

  // initialDataが変更されたときにdataを同期
  useEffect(() => {
    // 前の値と比較して、実際に変更があった場合のみ更新
    if (prevInitialDataRef.current !== initialData) {
      prevInitialDataRef.current = initialData;
      // startTransitionで非緊急更新としてマークし、カスケードレンダリングを回避
      startTransition(() => {
        setData(initialData);
        setSelectedNodeIds([]);
      });
    }
  }, [initialData]);

  return {
    data,
    setData,
    selectedNodeIds,
    setSelectedNodeIds,
    selectedNodeId,
    setSelectedNodeId,
  };
}
