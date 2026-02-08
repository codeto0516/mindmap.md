import { Node } from "./node";

/**
 * ノードのテキストのみ更新した Node を返す。
 * 既存オブジェクトを変更せず新しい Node を返す。
 */
export function updateNodeText(node: Node, text: string): Node {
  return {
    ...node,
    text,
  };
}
