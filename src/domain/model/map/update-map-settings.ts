import { Map } from "./map";
import { MapSettings } from "./map-settings";

/**
 * MapSettings を差し替え、updatedAt を更新した Map を返す。
 * 既存オブジェクトを変更せず新しい Map を返す。
 */
export function updateMapSettings(map: Map, settings: MapSettings): Map {
  return {
    ...map,
    settings,
    updatedAt: new Date(),
  };
}
