import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { getMap } from "./get-map";
import type { MapId } from "@/domain/model/map/value-object/map-id";
import type { MapRepository } from "@/domain/model/map/map-repository";

describe("getMap", () => {
  const workspaceId = "ws-1";
  const mockFindById = vi.fn();
  const mockSave = vi.fn();

  const mockMapRepository: MapRepository = {
    findById: mockFindById,
    save: mockSave,
    findByWorkspaceAndFolder: vi.fn(),
    delete: vi.fn(),
  };

  beforeEach(() => {
    mockFindById.mockReset();
    mockSave.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("リポジトリで見つかったマップを返す", async () => {
    const mapId = "map-1";
    const mockMap = {
      id: mapId as MapId,
      workspaceId,
      folderId: null,
      title: "Found",
      createdAt: new Date(),
      updatedAt: new Date(),
      settings: { theme: "light", layout: "dagre" as const },
    };
    mockFindById.mockResolvedValue(mockMap);

    const result = await getMap(workspaceId, mapId, mockMapRepository);

    expect(result).toEqual(mockMap);
    expect(mockFindById).toHaveBeenCalledWith(mapId);
  });

  it("見つからず開発用 mapId のときフォールバックの Map を DB に保存して返す", async () => {
    mockFindById.mockResolvedValue(null);
    mockSave.mockImplementation((map: { id: string }) =>
      Promise.resolve(map as Awaited<ReturnType<MapRepository["save"]>>),
    );

    const result = await getMap(workspaceId, "map-m1", mockMapRepository);

    expect(result).not.toBeNull();
    expect(result?.title).toBe("マインドマップ M1");
    expect(result?.id).toBe("map-m1");
    expect(result?.workspaceId).toBe(workspaceId);
    expect(mockSave).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "map-m1",
        workspaceId,
        title: "マインドマップ M1",
      }),
    );
  });

  it("見つからず開発用でない mapId のとき null を返す", async () => {
    mockFindById.mockResolvedValue(null);

    const result = await getMap(workspaceId, "map-unknown", mockMapRepository);

    expect(result).toBeNull();
  });
});
