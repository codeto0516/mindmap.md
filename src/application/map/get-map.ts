import type { Map } from "@/domain/model/map/map";
import type { MapRepository } from "@/domain/model/map/map-repository";
import { defaultMapSettings } from "@/domain/model/map/map-settings";
import type { MapId } from "@/domain/model/map/value-object/map-id";
import { getMapById } from "./get-map-by-id";

/** getMockSidebarTree で使っている mapId。開発用フォールバックで使用。 */
const MOCK_MAP_IDS = ["map-m1", "map-m2", "map-m3"] as const;
const MOCK_TITLES: Record<(typeof MOCK_MAP_IDS)[number], string> = {
  "map-m1": "マインドマップ M1",
  "map-m2": "マインドマップ M2",
  "map-m3": "マインドマップ M3",
};

/**
 * マップ詳細ページで表示するマップを 1 件取得する。
 * MapRepository から取得し、見つからない場合で開発用の mapId のときはフォールバックの Map を返す。
 *
 * @param workspaceId ワークスペース ID（フォールバック Map の workspaceId に使用）
 * @param mapId マップ ID（URL params の文字列）
 * @param mapRepository MapRepository（Composition Root で生成して渡す）
 * @returns マップが見つかった場合またはフォールバック対象の場合は Map、それ以外は null
 */
export async function getMap(
  workspaceId: string,
  mapId: string,
  mapRepository: MapRepository,
): Promise<Map | null> {
  const id = mapId as MapId;
  const map = await getMapById(mapRepository, id);

  if (map) return map;

  // MockMapRepository / 空 DB 時は開発用にフォールバックの Map を返し、DB に作成して以降の saveContent で update が通るようにする
  if (MOCK_MAP_IDS.includes(mapId as (typeof MOCK_MAP_IDS)[number])) {
    const now = new Date();
    const fallbackMap: Map = {
      id: id,
      workspaceId,
      folderId: null,
      title: MOCK_TITLES[mapId as (typeof MOCK_MAP_IDS)[number]],
      createdAt: now,
      updatedAt: now,
      settings: defaultMapSettings,
    };
    await mapRepository.save(fallbackMap);
    return fallbackMap;
  }

  return null;
}
