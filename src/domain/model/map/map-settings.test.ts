import { describe, it, expect } from "vitest";
import { defaultMapSettings } from "./map-settings";

describe("map-settings", () => {
  describe("defaultMapSettings", () => {
    it("デフォルトの layoutType / shareSetting / editPermission が設定されていること", () => {
      expect(defaultMapSettings.layoutType).toBe("left-to-right");
      expect(defaultMapSettings.shareSetting).toBe("private");
      expect(defaultMapSettings.editPermission).toBe("view");
    });
  });
});
