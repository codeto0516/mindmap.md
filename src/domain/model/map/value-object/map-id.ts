import { Brand } from "@/domain/shared/types/brand";

/** マップを一意に識別する ID。AccountId/WorkspaceId と同様の Brand 型。 */
export type MapId = Brand<string, "MapId">;

export const generateMapId = (): MapId => {
  return crypto.randomUUID() as MapId;
};
