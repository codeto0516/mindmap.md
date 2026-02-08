import { describe, it, expect } from "vitest";
import { createMap } from "./create-map";
import { updateMapSettings } from "./update-map-settings";

describe("updateMapSettings", () => {
  const workspaceId = "w1";

  it("settings が差し替わり updatedAt が更新されること", () => {
    const map = createMap(workspaceId, "Map");
    const prevUpdatedAt = map.updatedAt.getTime();
    const newSettings = {
      layoutType: "radial" as const,
      shareSetting: "public" as const,
      editPermission: "edit" as const,
    };
    const result = updateMapSettings(map, newSettings);
    expect(result.settings).toEqual(newSettings);
    expect(result.updatedAt.getTime()).toBeGreaterThanOrEqual(prevUpdatedAt);
    expect(result.id).toBe(map.id);
    expect(result.title).toBe(map.title);
  });

  it("渡した map は変更されないこと", () => {
    const map = createMap(workspaceId, "Map");
    const originalSettings = { ...map.settings };
    updateMapSettings(map, { ...map.settings, layoutType: "radial" });
    expect(map.settings).toEqual(originalSettings);
  });
});
