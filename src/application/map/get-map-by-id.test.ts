import { describe, it, expect, vi } from "vitest";
import { getMapById } from "./get-map-by-id";
import type { MapRepository } from "@/domain/model/map/map-repository";
import type { MapId } from "@/domain/model/map/value-object/map-id";

describe("getMapById", () => {
  it("リポジトリで見つかったマップを返す", async () => {
    const mapId = "map-1" as MapId;
    const mockMap = {
      id: mapId,
      workspaceId: "ws-1",
      folderId: null,
      title: "Test",
      createdAt: new Date(),
      updatedAt: new Date(),
      settings: { theme: "light", layout: "dagre" as const },
    };
    const repo: MapRepository = {
      findById: vi.fn().mockResolvedValue(mockMap),
      findByWorkspaceAndFolder: vi.fn(),
      save: vi.fn(),
      delete: vi.fn(),
    };

    const result = await getMapById(repo, mapId);

    expect(result).toEqual(mockMap);
    expect(repo.findById).toHaveBeenCalledWith(mapId);
  });

  it("見つからないとき null を返す", async () => {
    const mapId = "map-nonexistent" as MapId;
    const repo: MapRepository = {
      findById: vi.fn().mockResolvedValue(null),
      findByWorkspaceAndFolder: vi.fn(),
      save: vi.fn(),
      delete: vi.fn(),
    };

    const result = await getMapById(repo, mapId);

    expect(result).toBeNull();
  });
});
