import { describe, it, expect } from "vitest";
import {
  getNearestNodeInDirection,
  type NodeWithBounds,
} from "./spatialNavigation";

describe("spatialNavigation", () => {
  const nodes: NodeWithBounds[] = [
    { id: "a", position: { x: 0, y: 50 }, width: 100, height: 36 },
    { id: "b", position: { x: 150, y: 50 }, width: 100, height: 36 },
    { id: "c", position: { x: 150, y: 100 }, width: 100, height: 36 },
    { id: "d", position: { x: 300, y: 50 }, width: 100, height: 36 },
  ];

  describe("getNearestNodeInDirection", () => {
    it("ArrowLeft: 左方向で最も近いノードを返す", () => {
      expect(getNearestNodeInDirection(nodes, "b", "ArrowLeft")).toBe("a");
      expect(getNearestNodeInDirection(nodes, "d", "ArrowLeft")).toBe("b");
    });

    it("ArrowRight: 右方向で最も近いノードを返す", () => {
      expect(getNearestNodeInDirection(nodes, "a", "ArrowRight")).toBe("b");
      expect(getNearestNodeInDirection(nodes, "b", "ArrowRight")).toBe("d");
    });

    it("ArrowUp: 上方向で最も近いノードを返す", () => {
      expect(getNearestNodeInDirection(nodes, "c", "ArrowUp")).toBe("b");
    });

    it("ArrowDown: 下方向で最も近いノードを返す", () => {
      expect(getNearestNodeInDirection(nodes, "b", "ArrowDown")).toBe("c");
    });

    it("該当方向にノードがなければnull", () => {
      expect(getNearestNodeInDirection(nodes, "a", "ArrowLeft")).toBeNull();
      expect(getNearestNodeInDirection(nodes, "d", "ArrowRight")).toBeNull();
      expect(getNearestNodeInDirection(nodes, "a", "ArrowUp")).toBeNull();
      expect(getNearestNodeInDirection(nodes, "c", "ArrowDown")).toBeNull();
    });

    it("存在しないcurrentIdの場合はnull", () => {
      expect(getNearestNodeInDirection(nodes, "x", "ArrowRight")).toBeNull();
    });
  });
});
