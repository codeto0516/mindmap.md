import { describe, it, expect, vi } from "vitest";
import { addNodeAtRoot } from "./add-node-at-root";
import type { MapContentRepository } from "@/domain/model/map/map-content-repository";
import type { MapRepository } from "@/domain/model/map/map-repository";
import { defaultMapSettings } from "@/domain/model/map/map-settings";
import type { MapId } from "@/domain/model/map/value-object/map-id";

describe("addNodeAtRoot", () => {
  it("マップが存在しないとき map_not_found を返す", async () => {
    const mapRepo: MapRepository = {
      findById: vi.fn().mockResolvedValue(null),
      save: vi.fn(),
      findByWorkspaceAndFolder: vi.fn(),
      delete: vi.fn(),
    };
    const contentRepo: MapContentRepository = {
      getContent: vi.fn(),
      saveContent: vi.fn(),
    };

    const result = await addNodeAtRoot(
      "ws-1",
      "map-unknown",
      "タイトル",
      mapRepo,
      contentRepo,
    );

    expect(result).toEqual({ ok: false, error: "map_not_found" });
    expect(contentRepo.getContent).not.toHaveBeenCalled();
    expect(contentRepo.saveContent).not.toHaveBeenCalled();
  });

  it("マップが存在するときルート直下にノードを追加して保存する", async () => {
    const workspaceId = "ws-1";
    const mapId = "map-1";
    const map = {
      id: mapId as MapId,
      workspaceId,
      folderId: null,
      title: "テストマップ",
      createdAt: new Date(),
      updatedAt: new Date(),
      settings: defaultMapSettings,
    };
    const mapRepo: MapRepository = {
      findById: vi.fn().mockResolvedValue(map),
      save: vi.fn(),
      findByWorkspaceAndFolder: vi.fn(),
      delete: vi.fn(),
    };
    const aggregate = {
      mapId: mapId as MapId,
      nodes: [
        {
          id: "root",
          mapId: mapId as MapId,
          parentId: null,
          text: "ルート",
          position: { x: 0, y: 0 },
          order: 0,
          type: "root" as const,
        },
      ],
    };
    const saveContentMock = vi.fn().mockResolvedValue(undefined);
    const contentRepo: MapContentRepository = {
      getContent: vi.fn().mockResolvedValue(aggregate),
      saveContent: saveContentMock,
    };

    const result = await addNodeAtRoot(
      workspaceId,
      mapId,
      "新しいノード",
      mapRepo,
      contentRepo,
    );

    expect(result).toEqual({ ok: true });
    expect(saveContentMock).toHaveBeenCalledTimes(1);
    const saved = saveContentMock.mock.calls[0][0];
    expect(saved.mapId).toBe(mapId);
    expect(saved.nodes).toHaveLength(2);
    const root = saved.nodes.find(
      (n: { parentId: string | null }) => n.parentId === null,
    );
    const child = saved.nodes.find(
      (n: { parentId: string | null }) => n.parentId === "root",
    );
    expect(root).toBeDefined();
    expect(root.text).toBe("ルート");
    expect(child).toBeDefined();
    expect(child.text).toBe("新しいノード");
  });

  it("空タイトルのとき「無題」として追加する", async () => {
    const mapId = "map-1";
    const mapRepo: MapRepository = {
      findById: vi.fn().mockResolvedValue({
        id: mapId,
        workspaceId: "ws-1",
        folderId: null,
        title: "マップ",
        createdAt: new Date(),
        updatedAt: new Date(),
        settings: defaultMapSettings,
      }),
      save: vi.fn(),
      findByWorkspaceAndFolder: vi.fn(),
      delete: vi.fn(),
    };
    const saveContentMock = vi.fn().mockResolvedValue(undefined);
    const contentRepo: MapContentRepository = {
      getContent: vi.fn().mockResolvedValue({
        mapId,
        nodes: [
          {
            id: "root",
            mapId,
            parentId: null,
            text: "ルート",
            position: { x: 0, y: 0 },
            order: 0,
            type: "root" as const,
          },
        ],
      }),
      saveContent: saveContentMock,
    };

    await addNodeAtRoot("ws-1", mapId, "   ", mapRepo, contentRepo);

    const saved = saveContentMock.mock.calls[0][0];
    const child = saved.nodes.find(
      (n: { parentId: string | null }) => n.parentId === "root",
    );
    expect(child.text).toBe("無題");
  });
});
