import { MapId } from "./value-object/map-id";
import { NodeId } from "./value-object/node-id";
import { NodeType } from "./value-object/node-type";
import { Position } from "./value-object/position";

/**
 * ノード（MapNode 相当）。正規形: 親子は parentId + order で表現。ルートは parentId === null。
 * type は JSON / 将来 map_nodes.type と 1:1 対応。
 */
export interface Node {
  id: NodeId;
  mapId: MapId;
  parentId: NodeId | null;
  text: string;
  position: Position;
  order: number;
  type: NodeType;
  /** 期限・優先度・URL 等のメタデータ（拡張用） */
  metadata?: Record<string, unknown>;
}
