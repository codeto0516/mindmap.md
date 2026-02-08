import { describe, it, expect } from "vitest";
import { createMockMapRepository } from "./MockMapRepository";
import { createMap } from "@/domain/model/map/create-map";
import type { MapId } from "@/domain/model/map/value-object/map-id";

describe("MockMapRepository", () => {
  const workspaceId = "ws-1";

  it("findById は未登録時 null を返すこと", async () => {
    const repo = createMockMapRepository();
    const mapId = "map-1" as MapId;
    const result = await repo.findById(mapId);
    expect(result).toBeNull();
  });

  it("save 後に findById で取得できること", async () => {
    const repo = createMockMapRepository();
    const map = createMap(workspaceId, "Test Map");
    await repo.save(map);

    const found = await repo.findById(map.id);
    expect(found).not.toBeNull();
    expect(found?.title).toBe("Test Map");
  });

  it("findByWorkspaceAndFolder はワークスペースとフォルダで絞り込むこと", async () => {
    const repo = createMockMapRepository();
    const mapRoot = createMap(workspaceId, "Root Map", undefined, null);
    const folderId = "folder-1";
    const mapInFolder = createMap(workspaceId, "In Folder", undefined, folderId);
    await repo.save(mapRoot);
    await repo.save(mapInFolder);

    const rootMaps = await repo.findByWorkspaceAndFolder(workspaceId, null);
    expect(rootMaps).toHaveLength(1);
    expect(rootMaps[0].title).toBe("Root Map");

    const folderMaps = await repo.findByWorkspaceAndFolder(workspaceId, folderId);
    expect(folderMaps).toHaveLength(1);
    expect(folderMaps[0].title).toBe("In Folder");
  });

  it("delete 後に findById が null を返すこと", async () => {
    const repo = createMockMapRepository();
    const map = createMap(workspaceId, "To Delete");
    await repo.save(map);
    const deleted = await repo.delete(map.id);
    expect(deleted).toBe(true);

    const found = await repo.findById(map.id);
    expect(found).toBeNull();
  });

  it("delete は存在しない ID で false を返すこと", async () => {
    const repo = createMockMapRepository();
    const mapId = "map-nonexistent" as MapId;
    const deleted = await repo.delete(mapId);
    expect(deleted).toBe(false);
  });

  it("setInitialData で初期データをセットできること", async () => {
    const repo = createMockMapRepository();
    const map = createMap(workspaceId, "Initial");
    repo.setInitialData([map]);

    const found = await repo.findById(map.id);
    expect(found).not.toBeNull();
    expect(found?.title).toBe("Initial");
  });

  it("save で既存を更新できること", async () => {
    const repo = createMockMapRepository();
    const map = createMap(workspaceId, "Original");
    await repo.save(map);
    await repo.save({ ...map, title: "Updated" });

    const found = await repo.findById(map.id);
    expect(found?.title).toBe("Updated");
  });

  it("clear で全件削除されること", async () => {
    const repo = createMockMapRepository();
    const map = createMap(workspaceId, "To Clear");
    await repo.save(map);
    repo.clear();

    const found = await repo.findById(map.id);
    expect(found).toBeNull();
  });
});
