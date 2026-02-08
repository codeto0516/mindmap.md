import { Map } from "./map";
import { defaultMapSettings } from "./map-settings";
import { MapSettings } from "./map-settings";
import { generateMapId } from "./value-object/map-id";

/**
 * マップを新規作成する。拡張機能化に伴い workspaceId/folderId は string に簡略化。
 */
export function createMap(
  workspaceId: string,
  title: string,
  settings?: Partial<MapSettings>,
  folderId?: string | null
): Map {
  const now = new Date();
  return {
    id: generateMapId(),
    workspaceId,
    folderId: folderId ?? null,
    title,
    createdAt: now,
    updatedAt: now,
    settings: { ...defaultMapSettings, ...settings },
  };
}
