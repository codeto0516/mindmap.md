import { Position } from "./value-object/position";
import { Node } from "./node";

/**
 * ノードの position のみ更新した Node を返す。
 * 既存オブジェクトを変更せず新しい Node を返す。
 */
export function moveNode(node: Node, position: Position): Node {
  return {
    ...node,
    position,
  };
}
