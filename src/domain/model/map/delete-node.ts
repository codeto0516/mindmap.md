import { nodeTreeService, DeleteStrategy } from "@/domain/service/map";
import { Map } from "./map";
import { Node } from "./node";
import { NodeId } from "./value-object/node-id";

export interface DeleteNodeResult {
  map: Map;
  nodes: Node[];
}

/**
 * ノードを削除する。内部で NodeTreeService.applyDeleteStrategy を利用。
 * 既存オブジェクトを変更せず { map, nodes } を返す。
 * prevent のとき子がいる場合は nodes をそのまま返す。
 */
export function deleteNode(
  map: Map,
  nodes: Node[],
  nodeId: NodeId,
  childStrategy: DeleteStrategy
): DeleteNodeResult {
  const newNodes = nodeTreeService.applyDeleteStrategy(
    nodes,
    nodeId,
    childStrategy
  );

  const updatedMap: Map = {
    ...map,
    updatedAt: new Date(),
  };

  return { map: updatedMap, nodes: newNodes };
}
