import { Map } from "./map";
import { MapId } from "./value-object/map-id";

/**
 * Map リポジトリのインターフェース。拡張機能化に伴い workspaceId/folderId は string に簡略化。
 */
export interface MapRepository {
  findById(id: MapId): Promise<Map | null>;

  findByWorkspaceAndFolder(
    workspaceId: string,
    folderId: string | null
  ): Promise<Map[]>;

  /**
   * マップを保存する（作成または更新）
   * @param map 保存するマップ
   * @returns 保存されたマップ
   */
  save(map: Map): Promise<Map>;

  /**
   * マップを削除する
   * @param id 削除するマップ ID
   * @returns 削除に成功した場合は true
   */
  delete(id: MapId): Promise<boolean>;
}
