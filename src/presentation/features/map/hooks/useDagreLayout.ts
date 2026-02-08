import { useMemo } from "react";
import type { MindNode } from "@/application/map/mind-node";
import { MindMapNode, MindMapEdge } from "../utils/types";
import { findNodeInTree, filterCollapsed } from "../utils/nodeHelpers";
import { DEFAULTS } from "../utils/constants";

/**
 * ノードの高さ（ピクセル）（未計測時のデフォルト）
 */
const NODE_HEIGHT = 36;
/**
 * ノードの幅（ピクセル）（未計測時のデフォルト）
 */
const NODE_WIDTH = DEFAULTS.NODE_WIDTH;

/**
 * レイアウト用の縦方向範囲とノード中心
 * nodeCenterY: このノードの縦方向の中心（親を直下の子の中心に合わせるために使用）
 */
type LayoutResult = { topY: number; bottomY: number; nodeCenterY: number };

/** 階層間の横方向の間隔（px）親の右端と子の左端の間 */
const GAP_X = 50;
/** 兄弟ノード間の縦方向の間隔（px） */
const GAP_Y = 10;

/**
 * 子ノードグループの中心に親を配置するツリーレイアウト
 *
 * 再帰的に子を先に配置し、親のYは「直下の子ノード群」の縦方向の中心に合わせます。
 * X座標は「親の右端 + GAP_X」で子を配置するため、親をリサイズしても子ノードにかぶらない。
 *
 * @param node - 対象ノード（filterCollapsed 済み）
 * @param parentRightEdge - 親ノードの右端X（ルートのときは 0）
 * @param startY - このサブツリーの開始Y座標（上端）
 * @param heights - ノードID → 高さのマップ
 * @param widths - ノードID → 幅のマップ
 * @param nodes - 出力用の React Flow ノード配列
 * @param edges - 出力用のエッジ配列
 * @returns このサブツリーのY範囲と、このノードの縦方向中心（nodeCenterY）
 */
function layoutTree(
  node: MindNode,
  parentRightEdge: number,
  startY: number,
  heights: Record<string, number>,
  widths: Record<string, number>,
  nodes: MindMapNode[],
  edges: MindMapEdge[],
  data: MindNode,
): LayoutResult {
  const height = heights[node.id] ?? NODE_HEIGHT;
  const width = widths[node.id] ?? NODE_WIDTH;
  const x = parentRightEdge === 0 ? 0 : parentRightEdge + GAP_X;
  const myRightEdge = x + width;

  const hasChildren = node.children && node.children.length > 0;

  if (!hasChildren) {
    const y = startY;
    const originalNode = findNodeInTree(data, node.id) || node;
    nodes.push({
      id: node.id,
      type: "mindNode",
      position: { x, y },
      data: { mindNode: originalNode, isRoot: parentRightEdge === 0 },
      draggable: false,
    });
    return {
      topY: startY,
      bottomY: startY + height,
      nodeCenterY: startY + height / 2,
    };
  }

  let currentY = startY;
  const results: LayoutResult[] = [];

  for (const child of node.children!) {
    edges.push({
      id: `${node.id}-${child.id}`,
      source: node.id,
      target: child.id,
      sourceHandle: "right",
      targetHandle: "left",
      type: "smoothstep",
    });

    const r = layoutTree(
      child,
      myRightEdge,
      currentY,
      heights,
      widths,
      nodes,
      edges,
      data,
    );
    results.push(r);
    currentY = r.bottomY + GAP_Y;
  }

  // 親のY = 直下の子ノード群の中心（子のサブツリー全体ではなく、子ノード自体の中心の平均）
  const childrenCenters = results.map((r) => r.nodeCenterY);
  const y =
    childrenCenters.reduce((a, b) => a + b, 0) / childrenCenters.length -
    height / 2;

  // 親ノード自身の範囲も考慮してtopYとbottomYを計算
  const parentTopY = y;
  const parentBottomY = y + height;
  const childrenTopY = Math.min(...results.map((r) => r.topY));
  const childrenBottomY = Math.max(...results.map((r) => r.bottomY));
  const topY = Math.min(parentTopY, childrenTopY);
  const bottomY = Math.max(parentBottomY, childrenBottomY);

  const originalNode = findNodeInTree(data, node.id) || node;
  nodes.push({
    id: node.id,
    type: "mindNode",
    position: { x, y },
    data: { mindNode: originalNode, isRoot: parentRightEdge === 0 },
    draggable: false,
  });

  return { topY, bottomY, nodeCenterY: y + height / 2 };
}

/**
 * ルートノードの固定Y座標（折りたたみ時も位置を変えない）
 */
const ROOT_NODE_FIXED_Y = 0;

/**
 * 子ノードグループの中心に親が来るレイアウトを計算
 *
 * 右展開（LR）のツリーレイアウトで、各親ノードはその子ノード群の縦方向の中心に配置されます。
 * X座標は親の右端 + GAP_X で子を配置するため、親をリサイズしても子ノードにかぶりません。
 * ルートノード（depth=0）のY座標は固定され、折りたたみ時も位置が変わりません。
 *
 * @param data - マインドマップのデータ
 * @param nodeHeights - ノードIDをキーとする実際の高さのマップ（オプション）
 * @param nodeWidths - ノードIDをキーとする実際の幅のマップ（オプション）
 * @returns React Flow用のnodesとedges
 */
export function useDagreLayout(
  data: MindNode,
  nodeHeights?: Record<string, number>,
  nodeWidths?: Record<string, number>,
): { nodes: MindMapNode[]; edges: MindMapEdge[] } {
  return useMemo(() => {
    const filteredNode = filterCollapsed(data);
    const heights = nodeHeights ?? {};
    const widths = nodeWidths ?? {};
    const nodes: MindMapNode[] = [];
    const edges: MindMapEdge[] = [];

    layoutTree(filteredNode, 0, 0, heights, widths, nodes, edges, data);

    // ルートノードのY座標を固定し、他のノードも同じオフセットだけ移動
    const rootNode = nodes.find((n) => n.id === data.id);
    if (rootNode) {
      const rootY = rootNode.position.y;
      const offset = ROOT_NODE_FIXED_Y - rootY;
      // すべてのノードをオフセット分だけ移動
      nodes.forEach((node) => {
        node.position.y += offset;
      });
    }

    return { nodes, edges };
  }, [data, nodeHeights, nodeWidths]);
}
