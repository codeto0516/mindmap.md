import { MapId } from "./value-object/map-id";
import { MapSettings } from "./map-settings";

/** マップ（集約ルート）。拡張機能化に伴い workspaceId/folderId は文字列に簡略化。 */
export interface Map {
  id: MapId;
  workspaceId: string;
  folderId: string | null;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  settings: MapSettings;
}
