import { MapId } from "./value-object/map-id";
import { Node } from "./node";

/**
 * マップ内容の集約ルート。
 * メタデータ（title, workspaceId 等）は Map エンティティが持ち、
 * ノード集合はこの MapAggregate で扱う。
 *
 * 将来の RDB 移行:
 * - MapAggregate は map_nodes テーブルから取得した Node[] を mapId と合わせて保持する形に変更しない。
 * - Application/Domain 層の「MapAggregate を渡して操作」するインターフェースは維持し、
 *   永続化実装だけ JSON 読み書き → map_nodes クエリに差し替える。
 */
export interface MapAggregate {
  mapId: MapId;
  nodes: Node[];
}
