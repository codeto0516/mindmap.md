import { Map } from "./map";
import { Node } from "./node";
import { generateNodeId } from "./value-object/node-id";
import { NodeId } from "./value-object/node-id";
import { Position, createPosition } from "./value-object/position";

export interface AddNodeResult {
  map: Map;
  nodes: Node[];
}

/**
 * ノードを追加する。既存オブジェクトを変更せず { map, nodes } を返す。
 * order 未指定時は同じ parentId を持つ兄弟の max(order) + 1 で決める。
 */
export function addNode(
  map: Map,
  nodes: Node[],
  parentId: NodeId | null,
  text: string,
  position?: Position,
  order?: number
): AddNodeResult {
  const siblings = nodes.filter((n) => n.parentId === parentId);
  const resolvedOrder =
    order ?? (siblings.length === 0 ? 0 : Math.max(...siblings.map((n) => n.order)) + 1);

  const isRoot = parentId === null && nodes.length === 0;
  const newNode: Node = {
    id: generateNodeId(),
    mapId: map.id,
    parentId,
    text,
    position: position ?? createPosition(0, 0),
    order: resolvedOrder,
    type: isRoot ? "root" : "default",
  };

  const newNodes = [...nodes, newNode];
  const updatedMap: Map = {
    ...map,
    updatedAt: new Date(),
  };

  return { map: updatedMap, nodes: newNodes };
}
