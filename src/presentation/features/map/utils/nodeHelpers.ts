import type { MindNode } from "@/application/map/mind-node";

/**
 * ノードツリー内のノードを更新する汎用関数
 *
 * 指定されたノードIDに対応するノードを検索し、updater関数を適用して更新します。
 * updater関数がnullを返した場合、そのノードは削除されます。
 * ルートノードが削除された場合、nullを返します。
 *
 * @param rootNode - ルートノード
 * @param nodeId - 更新対象のノードID
 * @param updater - ノードを更新する関数。更新後のノードを返すか、削除する場合はnullを返す
 * @returns 更新後のルートノード、またはnull（ルートノードが削除された場合）
 *
 * @example
 * ```tsx
 * // ノードのタイトルを更新
 * const updated = updateNodeInTree(rootNode, "node1", (node) => ({
 *   ...node,
 *   title: "新しいタイトル",
 * }));
 *
 * // ノードを削除
 * const updated = updateNodeInTree(rootNode, "node1", () => null);
 * ```
 */
export function updateNodeInTree(
  rootNode: MindNode,
  nodeId: string,
  updater: (node: MindNode) => MindNode | null,
): MindNode | null {
  const updateNode = (node: MindNode): MindNode | null => {
    if (node.id === nodeId) {
      return updater(node);
    }
    if (node.children) {
      const updatedChildren = node.children
        .map(updateNode)
        .filter((n): n is MindNode => n !== null);
      return {
        ...node,
        children: updatedChildren.length > 0 ? updatedChildren : undefined,
      };
    }
    return node;
  };

  return updateNode(rootNode);
}

/**
 * ノードツリー内でノードを検索する汎用関数
 *
 * 指定されたノードIDに対応するノードを再帰的に検索します。
 * 見つからない場合はnullを返します。
 *
 * @param rootNode - ルートノード
 * @param nodeId - 検索対象のノードID
 * @returns 見つかったノード、またはnull（見つからない場合）
 *
 * @example
 * ```tsx
 * const node = findNodeInTree(rootNode, "node1");
 * if (node) {
 *   console.log("見つかりました:", node.title);
 * }
 * ```
 */
export function findNodeInTree(
  rootNode: MindNode,
  nodeId: string,
): MindNode | null {
  if (rootNode.id === nodeId) return rootNode;
  if (rootNode.children) {
    for (const child of rootNode.children) {
      const found = findNodeInTree(child, nodeId);
      if (found) return found;
    }
  }
  return null;
}

/**
 * ノードツリー内で親ノードを検索する汎用関数
 *
 * 指定されたノードIDの親ノードを再帰的に検索します。
 * ルートノードの場合はnullを返します。
 *
 * @param rootNode - ルートノード
 * @param targetId - 検索対象のノードID
 * @returns 見つかった親ノード、またはnull（ルートノードの場合、または見つからない場合）
 *
 * @example
 * ```tsx
 * const parent = findParentNode(rootNode, "node1-1");
 * if (parent) {
 *   console.log("親ノード:", parent.title);
 * }
 * ```
 */
export function findParentNode(
  rootNode: MindNode,
  targetId: string,
): MindNode | null {
  if (rootNode.children) {
    for (const child of rootNode.children) {
      if (child.id === targetId) {
        return rootNode;
      }
      const found = findParentNode(child, targetId);
      if (found) return found;
    }
  }
  return null;
}

/**
 * ノードツリー内で指定ノードの祖先ノードIDのリストを取得する
 *
 * 指定されたノードIDからルートノードまでのすべての祖先ノードIDを取得します。
 * ルートノード自体は含まれません。
 *
 * @param rootNode - ルートノード
 * @param targetId - 対象のノードID
 * @returns 祖先ノードIDの配列（ルートから近い順、ルートノード自体は含まれない）
 *
 * @example
 * ```tsx
 * const ancestors = findAncestorNodeIds(rootNode, "node1-1-1");
 * // 例: ["node1", "node1-1"]
 * ```
 */
export function findAncestorNodeIds(
  rootNode: MindNode,
  targetId: string,
): string[] {
  const ancestors: string[] = [];

  const findAncestors = (
    node: MindNode,
    targetId: string,
    path: string[],
  ): boolean => {
    if (node.id === targetId) {
      // ルートノード自体は含めない
      ancestors.push(...path);
      return true;
    }
    if (node.children) {
      for (const child of node.children) {
        if (findAncestors(child, targetId, [...path, node.id])) {
          return true;
        }
      }
    }
    return false;
  };

  findAncestors(rootNode, targetId, []);
  return ancestors;
}

/**
 * 折りたたまれたノードを除外して階層構造を構築
 *
 * 折りたたまれたノードの子ノードを除外し、レイアウト計算・階層ナビ用の階層構造を作成します。
 *
 * @param node - 処理対象のノード
 * @returns 子ノードが除外されたノード
 */
export function filterCollapsed(node: MindNode): MindNode {
  if (node.collapsed) {
    return { ...node, children: undefined };
  }
  if (node.children) {
    return {
      ...node,
      children: node.children.map(filterCollapsed),
    };
  }
  return node;
}

/**
 * ツリー上の全ノードの深さマップを返す（ルート=0、その子=1、…）
 *
 * @param rootNode - ルートノード（通常は filterCollapsed 済み）
 * @returns nodeId → depth の Map
 */
export function getDepthMap(rootNode: MindNode): Map<string, number> {
  const map = new Map<string, number>();

  function walk(node: MindNode, depth: number): void {
    map.set(node.id, depth);
    if (node.children) {
      for (const child of node.children) {
        walk(child, depth + 1);
      }
    }
  }

  walk(rootNode, 0);
  return map;
}

/**
 * ノード削除後にフォーカスすべきノードIDを返す
 *
 * 削除前のツリーと削除対象ノードIDから、削除実行後にフォーカスを移すノードIDを算出します。
 * - 同階層に他ノードがあり自分が先頭 → 次のノード
 * - 同階層に他ノードがあり自分が先頭でない → 1つ前のノード
 * - 同階層に自分しかいない → 親ノード
 * - ルートの場合は null（呼び出し側で削除しない想定）
 *
 * @param rootNode - ルートノード（削除前のツリー）
 * @param nodeId - 削除対象のノードID
 * @returns フォーカスすべきノードID、または null
 */
export function getFocusTargetAfterDelete(
  rootNode: MindNode,
  nodeId: string,
): string | null {
  if (rootNode.id === nodeId) return null;

  const parent = findParentNode(rootNode, nodeId);
  if (!parent?.children) return null;

  const siblings = parent.children;
  const index = siblings.findIndex((c) => c.id === nodeId);
  if (index < 0) return null;

  if (siblings.length === 1) return parent.id;
  if (index === 0) return siblings[1].id;
  return siblings[index - 1].id;
}

/**
 * 新しいノードIDを生成する
 *
 * 親ノードID、タイムスタンプ、ランダム値を組み合わせて一意のノードIDを生成します。
 * 衝突を回避するため、タイムスタンプとランダム値を使用します。
 *
 * @param parentId - 親ノードID
 * @returns 新しいノードID（形式: `{parentId}-{timestamp}-{random}`）
 *
 * @example
 * ```tsx
 * const newNodeId = generateNodeId("node1");
 * // 例: "node1-1234567890-abc123"
 * ```
 */
export function generateNodeId(parentId: string): string {
  // タイムスタンプとランダム値を組み合わせて衝突を回避
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `${parentId}-${timestamp}-${random}`;
}
