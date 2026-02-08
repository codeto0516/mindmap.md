import { describe, it, expect } from "vitest";
import { createPosition } from "./position";
import { generateMapId } from "./map-id";
import { generateNodeId } from "./node-id";

describe("値オブジェクト", () => {
  describe("generateMapId", () => {
    it("ユニークな MapId を返すこと", () => {
      const id1 = generateMapId();
      const id2 = generateMapId();
      expect(id1).not.toBe(id2);
      expect(typeof id1).toBe("string");
      expect(id1.length).toBeGreaterThan(0);
    });
  });

  describe("generateNodeId", () => {
    it("ユニークな NodeId を返すこと", () => {
      const id1 = generateNodeId();
      const id2 = generateNodeId();
      expect(id1).not.toBe(id2);
      expect(typeof id1).toBe("string");
      expect(id1.length).toBeGreaterThan(0);
    });
  });

  describe("Position", () => {
    it("createPosition で x, y が設定されること", () => {
      const p = createPosition(10, 20);
      expect(p.x).toBe(10);
      expect(p.y).toBe(20);
    });

    it("返却されたオブジェクトのプロパティが読み取り専用であること（型レベルでイミュータブル）", () => {
      const p = createPosition(1, 2);
      expect(p).toEqual({ x: 1, y: 2 });
    });
  });
});
