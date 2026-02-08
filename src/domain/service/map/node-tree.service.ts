import { Node } from "@/domain/model/map/node";
import { NodeId } from "@/domain/model/map/value-object/node-id";

/** 削除戦略: cascade=子孫も削除, reparent=子は親に付け替え, prevent=子がいる場合は削除しない */
export type DeleteStrategy = "cascade" | "reparent" | "prevent";

/**
 * ノードツリーの問い合わせと削除戦略の適用を行うドメインサービス。
 * 状態を持たず、純粋関数として実装。
 */
export const nodeTreeService = {
  /**
   * 指定ノードの子孫 ID 一覧を返す（cascade 削除対象の算出に利用）。
   */
  getDescendantIds(nodes: Node[], nodeId: NodeId): NodeId[] {
    const result: NodeId[] = [];
    const collect = (parent: NodeId) => {
      for (const n of nodes) {
        if (n.parentId === parent) {
          result.push(n.id);
          collect(n.id);
        }
      }
    };
    collect(nodeId);
    return result;
  },

  /**
   * 削除戦略を適用した結果の Node[] を返す。
   * reparent 時は「削除対象の子」の parentId を「削除対象の親」に付け替える。
   */
  applyDeleteStrategy(
    nodes: Node[],
    nodeId: NodeId,
    strategy: DeleteStrategy
  ): Node[] {
    const target = nodes.find((n) => n.id === nodeId);
    if (!target) return nodes;

    const hasChildren = nodes.some((n) => n.parentId === nodeId);

    if (strategy === "prevent" && hasChildren) {
      return nodes;
    }

    if (strategy === "cascade") {
      const descendantIds = this.getDescendantIds(nodes, nodeId);
      const idsToRemove = new Set([nodeId, ...descendantIds]);
      return nodes.filter((n) => !idsToRemove.has(n.id));
    }

    if (strategy === "reparent") {
      const newParentId = target.parentId;
      return nodes
        .filter((n) => n.id !== nodeId)
        .map((n) =>
          n.parentId === nodeId ? { ...n, parentId: newParentId } : n
        );
    }

    // prevent && !hasChildren: 指定ノードのみ削除
    return nodes.filter((n) => n.id !== nodeId);
  },
};
