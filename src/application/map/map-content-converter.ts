import type { MapAggregate } from "@/domain/model/map/map-aggregate";
import type { Node } from "@/domain/model/map/node";
import type { MapId } from "@/domain/model/map/value-object/map-id";
import type { NodeId } from "@/domain/model/map/value-object/node-id";
import { createPosition } from "@/domain/model/map/value-object/position";
import type { MindNode } from "@/application/map/mind-node";

/** ルート以外の NodeType を MindNode の type に変換する（root は MindNode では省略） */
function nodeTypeToMindNodeType(
  type: Node["type"],
): "default" | "task" | undefined {
  if (type === "root" || type === "default") return "default";
  if (type === "task") return "task";
  return "default";
}

/**
 * MapAggregate（フラットなノード一覧）を MindNode（ツリー）に変換する。
 * ルートは parentId === null の 1 件。子は parentId でグループ化し order でソート。
 * collapsed は永続化しないため未設定（false 相当）。type と metadata を通過させる。
 */
export function mapAggregateToMindNode(aggregate: MapAggregate): MindNode {
  const { nodes } = aggregate;
  const root = nodes.find((n) => n.parentId === null);
  if (!root) {
    return { id: "root", title: "無題", children: [] };
  }

  function buildTree(parentId: NodeId | null): MindNode[] {
    return nodes
      .filter((n) => n.parentId === parentId)
      .sort((a, b) => a.order - b.order)
      .map((n) => {
        const children = buildTree(n.id);
        const mindType = nodeTypeToMindNodeType(n.type);
        const mindNode: MindNode = {
          id: n.id,
          title: n.text,
          children,
          ...(mindType === "task" && { type: "task" }),
          ...(n.metadata !== undefined && { metadata: n.metadata }),
        };
        return mindNode;
      });
  }

  const children = buildTree(root.id);
  const rootMindType = nodeTypeToMindNodeType(root.type);
  return {
    id: root.id,
    title: root.text,
    children: children.length > 0 ? children : undefined,
    ...(rootMindType === "task" && { type: "task" }),
    ...(root.metadata !== undefined && { metadata: root.metadata }),
  };
}

/** MindNode の type を Domain の NodeType に変換する（ルートは "root"） */
function mindNodeTypeToNodeType(
  mindType: MindNode["type"] | undefined,
  isRoot: boolean,
): Node["type"] {
  if (isRoot) return "root";
  if (mindType === "task") return "task";
  return "default";
}

/**
 * MindNode（ツリー）を MapAggregate（フラットなノード一覧）に変換する。
 * DFS で平坦化。ルートは type "root"、それ以外は node.type または "default"。
 * position はレイアウト未計算のため (0, 0)。type と metadata を通過させる。
 */
export function mindNodeToMapAggregate(
  mapId: MapId,
  mindNode: MindNode,
): MapAggregate {
  const nodes: Node[] = [];
  let order = 0;

  function visit(
    node: MindNode,
    parentId: NodeId | null,
    isRoot: boolean,
  ): void {
    const nodeType = mindNodeTypeToNodeType(node.type, isRoot);
    nodes.push({
      id: node.id as NodeId,
      mapId,
      parentId,
      text: node.title,
      position: createPosition(0, 0),
      order: order++,
      type: nodeType,
      ...(node.metadata !== undefined && { metadata: node.metadata }),
    });
    const children = node.children ?? [];
    for (const child of children) {
      visit(child, node.id as NodeId, false);
    }
  }

  visit(mindNode, null, true);
  return { mapId, nodes };
}
