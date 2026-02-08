import { useCallback, useRef, useEffect } from "react";
import type { MindNode } from "@/types/mind-node";
import {
  updateNodeInTree,
  findNodeInTree,
  findParentNode,
  generateNodeId,
} from "../utils/nodeHelpers";
import { DEFAULTS } from "../utils/constants";

/**
 * useNodeOperationsフックのProps
 */
interface UseNodeOperationsProps {
  /** マインドマップのデータ */
  data: MindNode;
  /** データ変更時のコールバック */
  onDataChange?: (data: MindNode) => void;
}

/**
 * useNodeOperationsフックの戻り値
 */
export interface UseNodeOperationsReturn {
  /** ノードの展開/折りたたみを切り替える関数 */
  toggleNode: (nodeId: string) => void;
  /** 子ノードを追加する関数（追加したノードのIDを返す） */
  addChildNode: (parentId: string, title?: string) => string | undefined;
  /** 兄弟ノードを追加する関数（追加したノードのIDを返す） */
  addSiblingNode: (nodeId: string, title?: string) => string | undefined;
  /** ノードを削除する関数 */
  deleteNode: (nodeId: string) => void;
  /** 複数のノードを一括削除する関数 */
  deleteNodes: (nodeIds: string[]) => void;
  /** ノードのタイトルを更新する関数 */
  updateNodeTitle: (nodeId: string, title: string) => void;
  /** ノードを検索する関数 */
  findNode: (nodeId: string) => MindNode | null;
}

/**
 * ノード操作を管理するカスタムフック
 *
 * マインドマップのノードに対する操作（展開/折りたたみ、追加、削除、検索）を提供します。
 * データの変更はrefを通じて最新の状態を参照し、コールバック関数で通知します。
 *
 * @param props - useNodeOperationsフックのProps
 * @param props.data - マインドマップのデータ
 * @param props.onDataChange - データ変更時のコールバック
 * @returns ノード操作関数を含むオブジェクト
 * @returns toggleNode - ノードの展開/折りたたみを切り替える関数
 * @returns addChildNode - 子ノードを追加する関数
 * @returns addSiblingNode - 兄弟ノードを追加する関数
 * @returns deleteNode - ノードを削除する関数
 * @returns deleteNodes - 複数のノードを一括削除する関数
 * @returns updateNodeTitle - ノードのタイトルを更新する関数
 * @returns findNode - ノードを検索する関数
 *
 * @example
 * ```tsx
 * const nodeOperations = useNodeOperations({
 *   data,
 *   onDataChange: (newData) => setData(newData),
 * });
 *
 * // ノードを展開/折りたたみ
 * nodeOperations.toggleNode("node1");
 *
 * // 子ノードを追加
 * nodeOperations.addChildNode("node1", "新しい子ノード");
 * ```
 */
export function useNodeOperations({
  data,
  onDataChange,
}: UseNodeOperationsProps): UseNodeOperationsReturn {
  // dataをrefで保持して、関数型更新で使用
  const dataRef = useRef<MindNode>(data);
  const onDataChangeRef = useRef<((data: MindNode) => void) | undefined>(
    onDataChange,
  );

  // refを最新の値に更新
  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  useEffect(() => {
    onDataChangeRef.current = onDataChange;
  }, [onDataChange]);

  // ノードの展開/折りたたみを切り替え
  const toggleNode = useCallback((nodeId: string) => {
    const currentData = dataRef.current;
    const newData = updateNodeInTree(currentData, nodeId, (node) => ({
      ...node,
      collapsed: !node.collapsed,
    }));

    if (newData) {
      onDataChangeRef.current?.(newData);
    }
  }, []);

  // ノードを検索
  const findNode = useCallback((nodeId: string): MindNode | null => {
    return findNodeInTree(dataRef.current, nodeId);
  }, []);

  // 子ノードを追加（追加したノードのIDを返す）
  const addChildNode = useCallback(
    (
      parentId: string,
      title: string = DEFAULTS.NODE_TITLE,
    ): string | undefined => {
      const currentData = dataRef.current;
      const newChildId = generateNodeId(parentId);
      const newData = updateNodeInTree(currentData, parentId, (node) => {
        const newChild: MindNode = {
          id: newChildId,
          title,
        };
        return {
          ...node,
          children: [...(node.children || []), newChild],
          collapsed: false,
        };
      });

      if (newData) {
        onDataChangeRef.current?.(newData);
        return newChildId;
      }
      return undefined;
    },
    [],
  );

  // 同階層（兄弟ノード）を追加（追加したノードのIDを返す）
  const addSiblingNode = useCallback(
    (
      nodeId: string,
      title: string = DEFAULTS.NODE_TITLE,
    ): string | undefined => {
      const currentData = dataRef.current;

      // ルートノードの場合は子ノードを追加
      if (nodeId === currentData.id) {
        return addChildNode(nodeId, title);
      }

      // 親ノードを見つける
      const parent = findParentNode(currentData, nodeId);
      if (!parent) {
        // 親が見つからない場合は子ノードとして追加
        return addChildNode(currentData.id, title);
      }

      // 親ノードの子として新しいノードを追加
      const newSiblingId = generateNodeId(parent.id);
      const newData = updateNodeInTree(currentData, parent.id, (node) => {
        const currentIndex =
          node.children?.findIndex((child) => child.id === nodeId) ?? -1;
        const newSibling: MindNode = {
          id: newSiblingId,
          title,
        };

        if (currentIndex >= 0 && node.children) {
          const newChildren = [...node.children];
          newChildren.splice(currentIndex + 1, 0, newSibling);
          return {
            ...node,
            children: newChildren,
          };
        } else {
          return {
            ...node,
            children: [...(node.children || []), newSibling],
          };
        }
      });

      if (newData) {
        onDataChangeRef.current?.(newData);
        return newSiblingId;
      }
      return undefined;
    },
    [addChildNode],
  );

  // ノードを削除
  const deleteNode = useCallback((nodeId: string) => {
    const currentData = dataRef.current;
    if (nodeId === currentData.id) return; // ルートノードは削除不可

    const newData = updateNodeInTree(currentData, nodeId, () => null);
    if (newData) {
      onDataChangeRef.current?.(newData);
    }
  }, []);

  // 複数のノードを一括削除
  const deleteNodes = useCallback((nodeIds: string[]) => {
    const currentData = dataRef.current;
    // ルートノードを除外
    const validNodeIds = nodeIds.filter((nodeId) => nodeId !== currentData.id);

    if (validNodeIds.length === 0) return;

    // 各ノードを順次削除
    let updatedData = currentData;
    for (const nodeId of validNodeIds) {
      const newData = updateNodeInTree(updatedData, nodeId, () => null);
      if (newData) {
        updatedData = newData;
      }
    }

    // 最後に一度だけコールバックを呼び出す
    if (updatedData !== currentData) {
      onDataChangeRef.current?.(updatedData);
    }
  }, []);

  // ノードのタイトルを更新
  const updateNodeTitle = useCallback((nodeId: string, title: string) => {
    const currentData = dataRef.current;
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return; // 空のタイトルは無視

    const newData = updateNodeInTree(currentData, nodeId, (node) => ({
      ...node,
      title: trimmedTitle,
    }));

    if (newData) {
      onDataChangeRef.current?.(newData);
    }
  }, []);

  return {
    toggleNode,
    addChildNode,
    addSiblingNode,
    deleteNode,
    deleteNodes,
    updateNodeTitle,
    findNode,
  };
}
