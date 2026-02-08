import { describe, it, expect } from "vitest";
import { createMap } from "./create-map";

describe("createMap", () => {
  const workspaceId = "w1";

  it("指定した workspaceId / title で Map が生成されること", () => {
    const map = createMap(workspaceId, "My Map");
    expect(map.workspaceId).toBe(workspaceId);
    expect(map.title).toBe("My Map");
    expect(map.id).toBeDefined();
    expect(typeof map.id).toBe("string");
  });

  it("createdAt / updatedAt が設定されること", () => {
    const before = new Date();
    const map = createMap(workspaceId, "Test");
    const after = new Date();
    expect(map.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
    expect(map.updatedAt.getTime()).toBeLessThanOrEqual(after.getTime() + 1);
    expect(map.createdAt.getTime()).toBe(map.updatedAt.getTime());
  });

  it("settings 未指定時はデフォルトが入ること", () => {
    const map = createMap(workspaceId, "Test");
    expect(map.settings.layoutType).toBe("left-to-right");
    expect(map.settings.shareSetting).toBe("private");
    expect(map.settings.editPermission).toBe("view");
  });

  it("settings を指定した場合はマージされること", () => {
    const map = createMap(workspaceId, "Test", {
      layoutType: "radial",
      shareSetting: "public",
    });
    expect(map.settings.layoutType).toBe("radial");
    expect(map.settings.shareSetting).toBe("public");
    expect(map.settings.editPermission).toBe("view");
  });

  it("folderId 未指定時は null が入ること", () => {
    const map = createMap(workspaceId, "Test");
    expect(map.folderId).toBeNull();
  });

  it("folderId を指定した場合はその値が入ること", () => {
    const folderId = "folder-1";
    const map = createMap(workspaceId, "Test", undefined, folderId);
    expect(map.folderId).toBe(folderId);
  });
});
