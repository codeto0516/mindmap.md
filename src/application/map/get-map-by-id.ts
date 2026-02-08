import type { Map } from "@/domain/model/map/map";
import type { MapRepository } from "@/domain/model/map/map-repository";
import type { MapId } from "@/domain/model/map/value-object/map-id";

/**
 * ID でマップを 1 件取得するユースケース。
 * RSC や API では factory でリポジトリを生成して渡す。
 *
 * @param mapRepository MapRepository の実装
 * @param mapId マップ ID
 * @returns マップが見つかった場合は Map、見つからない場合は null
 */
export async function getMapById(
  mapRepository: MapRepository,
  mapId: MapId,
): Promise<Map | null> {
  return mapRepository.findById(mapId);
}
