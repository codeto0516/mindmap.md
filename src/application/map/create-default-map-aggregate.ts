import type { MapAggregate } from "@/domain/model/map/map-aggregate";
import type { Node } from "@/domain/model/map/node";
import type { MapId } from "@/domain/model/map/value-object/map-id";
import type { NodeId } from "@/domain/model/map/value-object/node-id";
import { createPosition } from "@/domain/model/map/value-object/position";

const DEFAULT_ROOT_ID = "root" as NodeId;
const DEFAULT_CHILD_IDS = ["node-1", "node-2", "node-3"] as const;
const DEFAULT_CHILD_TEXTS = ["ノード1", "ノード2", "ノード3"] as const;

/**
 * 新規無題マップ用のデフォルト MapAggregate を返す。
 * ルート「無題」と子ノード「ノード1」「ノード2」「ノード3」を持つ。
 *
 * @param mapId マップ ID
 * @returns デフォルト内容の MapAggregate
 */
export function createDefaultMapAggregate(mapId: MapId): MapAggregate {
  const pos = createPosition(0, 0);
  const root: Node = {
    id: DEFAULT_ROOT_ID,
    mapId,
    parentId: null,
    text: "無題",
    position: pos,
    order: 0,
    type: "root",
  };
  const children: Node[] = DEFAULT_CHILD_IDS.map((id, index) => ({
    id: id as NodeId,
    mapId,
    parentId: DEFAULT_ROOT_ID,
    text: DEFAULT_CHILD_TEXTS[index],
    position: pos,
    order: index,
    type: "default",
  }));
  return {
    mapId,
    nodes: [root, ...children],
  };
}
