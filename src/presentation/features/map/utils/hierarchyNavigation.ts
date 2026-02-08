import type { MindNode } from "@/application/map/mind-node";
import { filterCollapsed, getDepthMap } from "./nodeHelpers";
import type { NodeWithBounds, ArrowDirection } from "./spatialNavigation";

function getCenter(node: NodeWithBounds): { x: number; y: number } {
  return {
    x: node.position.x + node.width / 2,
    y: node.position.y + node.height / 2,
  };
}

function getNodeIdsAtDepth(
  depthMap: Map<string, number>,
  depth: number,
): string[] {
  const ids: string[] = [];
  depthMap.forEach((d, id) => {
    if (d === depth) ids.push(id);
  });
  return ids;
}

/**
 * 階層ルールに則り、矢印キー方向で移動先ノードIDを返す
 *
 * - 上下: 同階層のみ。上/下に同階層がいなければ null。
 * - 左: 一階層上のノードのうち、自分から近い（軸優先）ノード。
 * - 右: 一階層下のノードのうち、自分から近い（軸優先）ノード。
 *
 * @param data - マインドマップのツリー（折りたたみは内部で filterCollapsed する）
 * @param nodesWithLayout - 位置・サイズ付きノード一覧（レイアウトと一致すること）
 * @param currentId - 現在選択中のノードID
 * @param direction - 矢印キー方向
 * @returns 移動先ノードID、該当がなければ null
 */
export function getNearestNodeInDirectionByHierarchy(
  data: MindNode,
  nodesWithLayout: NodeWithBounds[],
  currentId: string,
  direction: ArrowDirection,
): string | null {
  const filteredTree = filterCollapsed(data);
  const depthMap = getDepthMap(filteredTree);
  const layoutById = new Map(nodesWithLayout.map((n) => [n.id, n] as const));

  const current = layoutById.get(currentId);
  if (!current) return null;

  const curCenter = getCenter(current);
  const depth = depthMap.get(currentId);
  if (depth === undefined) return null;

  if (direction === "ArrowUp" || direction === "ArrowDown") {
    const sameDepthIds = getNodeIdsAtDepth(depthMap, depth).filter((id) =>
      layoutById.has(id),
    );
    const candidates = sameDepthIds
      .filter((id) => id !== currentId)
      .map((id) => layoutById.get(id)!)
      .filter((node) => {
        const center = getCenter(node);
        return direction === "ArrowUp"
          ? center.y < curCenter.y
          : center.y > curCenter.y;
      });
    if (candidates.length === 0) return null;
    if (direction === "ArrowUp") {
      const best = candidates.reduce((a, b) =>
        getCenter(a).y > getCenter(b).y ? a : b,
      );
      return best.id;
    }
    const best = candidates.reduce((a, b) =>
      getCenter(a).y < getCenter(b).y ? a : b,
    );
    return best.id;
  }

  if (direction === "ArrowLeft") {
    if (depth === 0) return null;
    const parentDepthIds = getNodeIdsAtDepth(depthMap, depth - 1).filter((id) =>
      layoutById.has(id),
    );
    const candidates = parentDepthIds
      .map((id) => layoutById.get(id)!)
      .filter((node) => getCenter(node).x < curCenter.x);
    if (candidates.length === 0) return null;
    if (candidates.length === 1) return candidates[0].id;
    let bestId: string | null = null;
    let bestPrimary = Infinity;
    let bestSecondary = Infinity;
    for (const node of candidates) {
      const center = getCenter(node);
      const dy = center.y - curCenter.y;
      const dx = center.x - curCenter.x;
      const primary = Math.abs(dy);
      const secondary = -dx;
      if (
        primary < bestPrimary ||
        (primary === bestPrimary && secondary < bestSecondary)
      ) {
        bestPrimary = primary;
        bestSecondary = secondary;
        bestId = node.id;
      }
    }
    return bestId;
  }

  // ArrowRight
  const childDepthIds = getNodeIdsAtDepth(depthMap, depth + 1).filter((id) =>
    layoutById.has(id),
  );
  const rightCandidates = childDepthIds
    .map((id) => layoutById.get(id)!)
    .filter((node) => getCenter(node).x > curCenter.x);
  if (rightCandidates.length === 0) return null;
  if (rightCandidates.length === 1) return rightCandidates[0].id;
  let bestIdR: string | null = null;
  let bestPrimaryR = Infinity;
  let bestSecondaryR = Infinity;
  for (const node of rightCandidates) {
    const center = getCenter(node);
    const dy = center.y - curCenter.y;
    const dx = center.x - curCenter.x;
    const primary = Math.abs(dy);
    const secondary = dx;
    if (
      primary < bestPrimaryR ||
      (primary === bestPrimaryR && secondary < bestSecondaryR)
    ) {
      bestPrimaryR = primary;
      bestSecondaryR = secondary;
      bestIdR = node.id;
    }
  }
  return bestIdR;
}
