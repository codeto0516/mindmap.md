import { describe, it, expect } from "vitest";
import { getNearestNodeInDirectionByHierarchy } from "./hierarchyNavigation";
import type { MindNode } from "@/application/map/mind-node";
import type { NodeWithBounds } from "./spatialNavigation";

describe("hierarchyNavigation", () => {
  const data: MindNode = {
    id: "root",
    title: "Root",
    children: [
      {
        id: "c1",
        title: "C1",
        children: [
          { id: "g1", title: "G1" },
          { id: "g2", title: "G2" },
        ],
      },
      { id: "c2", title: "C2" },
    ],
  };

  const nodesWithLayout: NodeWithBounds[] = [
    { id: "root", position: { x: 0, y: 50 }, width: 100, height: 36 },
    { id: "c1", position: { x: 150, y: 30 }, width: 100, height: 36 },
    { id: "c2", position: { x: 150, y: 80 }, width: 100, height: 36 },
    { id: "g1", position: { x: 250, y: 25 }, width: 100, height: 36 },
    { id: "g2", position: { x: 250, y: 80 }, width: 100, height: 36 },
  ];

  describe("getNearestNodeInDirectionByHierarchy", () => {
    describe("上下キー（同階層のみ）", () => {
      it("ArrowDown: 同階層で自分より下のノードのうち最も近い（y最小）を返す", () => {
        expect(
          getNearestNodeInDirectionByHierarchy(
            data,
            nodesWithLayout,
            "c1",
            "ArrowDown",
          ),
        ).toBe("c2");
      });

      it("ArrowUp: 同階層で自分より上のノードのうち最も近い（y最大）を返す", () => {
        expect(
          getNearestNodeInDirectionByHierarchy(
            data,
            nodesWithLayout,
            "c2",
            "ArrowUp",
          ),
        ).toBe("c1");
      });

      it("ルートは同階層に自分しかいないため上下でnull", () => {
        expect(
          getNearestNodeInDirectionByHierarchy(
            data,
            nodesWithLayout,
            "root",
            "ArrowUp",
          ),
        ).toBeNull();
        expect(
          getNearestNodeInDirectionByHierarchy(
            data,
            nodesWithLayout,
            "root",
            "ArrowDown",
          ),
        ).toBeNull();
      });

      it("同階層で上/下にノードがいなければnull", () => {
        expect(
          getNearestNodeInDirectionByHierarchy(
            data,
            nodesWithLayout,
            "c1",
            "ArrowUp",
          ),
        ).toBeNull();
        expect(
          getNearestNodeInDirectionByHierarchy(
            data,
            nodesWithLayout,
            "c2",
            "ArrowDown",
          ),
        ).toBeNull();
      });
    });

    describe("左キー（一階層上で近い）", () => {
      it("ArrowLeft: 一階層上のノードのうち左方向で軸優先で近いノードを返す", () => {
        expect(
          getNearestNodeInDirectionByHierarchy(
            data,
            nodesWithLayout,
            "c1",
            "ArrowLeft",
          ),
        ).toBe("root");
      });

      it("ルート（depth=0）の左はnull", () => {
        expect(
          getNearestNodeInDirectionByHierarchy(
            data,
            nodesWithLayout,
            "root",
            "ArrowLeft",
          ),
        ).toBeNull();
      });

      it("孫から左: 一階層上（子）のうち左で近いノードを返す", () => {
        expect(
          getNearestNodeInDirectionByHierarchy(
            data,
            nodesWithLayout,
            "g1",
            "ArrowLeft",
          ),
        ).toBe("c1");
      });
    });

    describe("右キー（一階層下で近い）", () => {
      it("ArrowRight: 一階層下のノードのうち右方向で軸優先で近いノードを返す", () => {
        expect(
          getNearestNodeInDirectionByHierarchy(
            data,
            nodesWithLayout,
            "root",
            "ArrowRight",
          ),
        ).toBe("c1");
      });

      it("子から右: 一階層下（孫）のうち右で近いノードを返す", () => {
        expect(
          getNearestNodeInDirectionByHierarchy(
            data,
            nodesWithLayout,
            "c1",
            "ArrowRight",
          ),
        ).toBe("g1");
      });

      it("最深層（子のいないノード）の右はnull", () => {
        expect(
          getNearestNodeInDirectionByHierarchy(
            data,
            nodesWithLayout,
            "g1",
            "ArrowRight",
          ),
        ).toBeNull();
      });

      it("子のいないノードでも一階層下に他ノードがあれば右で遷移できる", () => {
        expect(
          getNearestNodeInDirectionByHierarchy(
            data,
            nodesWithLayout,
            "c2",
            "ArrowRight",
          ),
        ).toBe("g2");
      });
    });

    it("存在しないcurrentIdの場合はnull", () => {
      expect(
        getNearestNodeInDirectionByHierarchy(
          data,
          nodesWithLayout,
          "x",
          "ArrowRight",
        ),
      ).toBeNull();
    });
  });
});
