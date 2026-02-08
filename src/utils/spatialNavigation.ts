/**
 * 位置・サイズを持つノード（矢印方向の最近傍検索用）
 */
export type NodeWithBounds = {
  id: string;
  position: { x: number; y: number };
  width: number;
  height: number;
};

/**
 * 矢印キー方向
 */
export type ArrowDirection =
  | "ArrowUp"
  | "ArrowDown"
  | "ArrowLeft"
  | "ArrowRight";

/**
 * 指定ノードの中心座標を取得する
 */
function getCenter(node: NodeWithBounds): { x: number; y: number } {
  return {
    x: node.position.x + node.width / 2,
    y: node.position.y + node.height / 2,
  };
}

/**
 * 押した矢印の方向で、現在ノードから最も近いノードのIDを返す
 *
 * 親子関係は無視し、画面上の位置だけで「上・下・左・右」の半平面にあるノードのうち、
 * 中心同士の距離が最小のノードを選ぶ。
 *
 * @param nodes - 位置・サイズ付きノードの配列
 * @param currentId - 現在選択中のノードID
 * @param direction - 矢印キー方向
 * @returns その方向で最も近いノードID、該当がなければ null
 */
export function getNearestNodeInDirection(
  nodes: NodeWithBounds[],
  currentId: string,
  direction: ArrowDirection,
): string | null {
  const current = nodes.find((n) => n.id === currentId);
  if (!current) return null;

  const curCenter = getCenter(current);
  let bestId: string | null = null;
  let bestDistSq = Infinity;

  for (const node of nodes) {
    if (node.id === currentId) continue;

    const center = getCenter(node);

    // 方向ごとに「その方向の半平面」にあるか判定（Y軸は下が正）
    const inDirection =
      (direction === "ArrowUp" && center.y < curCenter.y) ||
      (direction === "ArrowDown" && center.y > curCenter.y) ||
      (direction === "ArrowLeft" && center.x < curCenter.x) ||
      (direction === "ArrowRight" && center.x > curCenter.x);

    if (!inDirection) continue;

    const dx = center.x - curCenter.x;
    const dy = center.y - curCenter.y;
    const distSq = dx * dx + dy * dy;
    if (distSq < bestDistSq) {
      bestDistSq = distSq;
      bestId = node.id;
    }
  }

  return bestId;
}
