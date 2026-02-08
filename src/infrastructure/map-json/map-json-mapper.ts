import type { MapId } from "@/domain/model/map/value-object/map-id";
import type { NodeId } from "@/domain/model/map/value-object/node-id";
import { createPosition } from "@/domain/model/map/value-object/position";
import type { MapAggregate } from "@/domain/model/map/map-aggregate";
import type { Node } from "@/domain/model/map/node";
import type { MapJSON, MapNodeJSON } from "./types";

/**
 * JSON（純粋データ）と Domain（MapAggregate / Node）の相互変換。
 * Infrastructure 層のみが使用する。Application/Domain 層は MapAggregate を介して操作する。
 *
 * 将来の RDB 移行:
 * - toMapAggregate: map_nodes から取得した行を Node[] にマッピングする処理に置き換える。
 *   MapNodeJSON のフィールドと map_nodes のカラムは 1:1 想定（id, parent_id, text, order, type）。
 * - toMapJSON: 移行後は「MapAggregate を map_nodes に INSERT/UPDATE する」実装に置き換え、
 *   この関数は「一括エクスポート」や「スナップショット JSON 出力」用に残すか検討する。
 */

/**
 * MapNodeJSON の type を Domain の NodeType に合わせる。
 * JSON と Domain で同じリテラルを使っているためそのまま返す。
 */
function nodeTypeFromJSON(type: MapNodeJSON["type"]): Node["type"] {
  return type;
}

/**
 * MapJSON + mapId から MapAggregate を生成する。
 * position は JSON に含めないため、デフォルト (0, 0) を設定。レイアウト計算は UI 層で行う想定。
 */
export function toMapAggregate(mapId: MapId, json: MapJSON): MapAggregate {
  const nodes: Node[] = json.nodes.map((n) => ({
    id: n.id as NodeId,
    mapId,
    parentId: n.parentId as NodeId | null,
    text: n.text,
    order: n.order,
    type: nodeTypeFromJSON(n.type),
    position: createPosition(0, 0),
    ...(n.metadata !== undefined && { metadata: n.metadata }),
  }));
  return { mapId, nodes };
}

/**
 * MapAggregate から MapJSON を生成する。
 * mapId / position は JSON に含めない（UI 状態・コンテキストとして分離）。
 */
export function toMapJSON(aggregate: MapAggregate): MapJSON {
  const nodes: MapNodeJSON[] = aggregate.nodes.map((n) => ({
    id: n.id,
    parentId: n.parentId,
    text: n.text,
    order: n.order,
    type: n.type,
    ...(n.metadata !== undefined && { metadata: n.metadata }),
  }));
  return { nodes };
}
