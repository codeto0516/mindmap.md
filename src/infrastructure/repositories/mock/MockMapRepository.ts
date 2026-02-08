import type { Map } from "@/domain/model/map/map";
import { MapRepository } from "@/domain/model/map/map-repository";
import { MapId } from "@/domain/model/map/value-object/map-id";

/**
 * メモリ内でデータを保持する MapRepository のモック実装を返す。
 * テストや開発時に使用する。
 */
export function createMockMapRepository(): MapRepository & {
  setInitialData(maps: Map[]): void;
  clear(): void;
} {
  const maps = new Map<MapId, Map>();

  return {
    setInitialData(mapsData: Map[]): void {
      maps.clear();
      mapsData.forEach((m) => {
        maps.set(m.id, { ...m });
      });
    },

    clear(): void {
      maps.clear();
    },

    async findById(id: MapId): Promise<Map | null> {
      const m = maps.get(id);
      if (!m) return null;
      return { ...m };
    },

    async findByWorkspaceAndFolder(
      workspaceId: string,
      folderId: string | null
    ): Promise<Map[]> {
      return Array.from(maps.values())
        .filter(
          (m) => m.workspaceId === workspaceId && m.folderId === folderId
        )
        .map((m) => ({ ...m }))
        .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    },

    async save(map: Map): Promise<Map> {
      const now = new Date();
      const existing = maps.get(map.id);

      if (existing) {
        const updated: Map = {
          ...map,
          updatedAt: now,
        };
        maps.set(map.id, updated);
        return { ...updated };
      }

      const newMap: Map = {
        ...map,
        createdAt: map.createdAt ?? now,
        updatedAt: now,
      };
      maps.set(newMap.id, newMap);
      return { ...newMap };
    },

    async delete(id: MapId): Promise<boolean> {
      if (!maps.has(id)) return false;
      maps.delete(id);
      return true;
    },
  };
}
