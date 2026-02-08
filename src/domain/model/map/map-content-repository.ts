import { MapAggregate } from "./map-aggregate";
import { MapId } from "./value-object/map-id";

/**
 * マップ内容（ノード集合）の永続化インターフェース。
 * 初期フェーズでは 1 つの JSON として保存し、将来は map_nodes テーブルに展開する想定。
 *
 * 将来の RDB 移行:
 * - このインターフェースは変更せず、実装だけ「JSON 読み書き」から「map_nodes の SELECT/INSERT/UPDATE」に差し替える。
 * - Application/Domain 層は MapAggregate を介して操作するため、移行後も呼び出し側の変更は最小限にする。
 */
export interface MapContentRepository {
  /**
   * マップ内容を取得する
   * @param mapId マップ ID
   * @returns 内容がある場合は MapAggregate、ない場合は null
   */
  getContent(mapId: MapId): Promise<MapAggregate | null>;

  /**
   * マップ内容を保存する（上書き）
   * @param aggregate 保存する MapAggregate
   */
  saveContent(aggregate: MapAggregate): Promise<void>;
}
