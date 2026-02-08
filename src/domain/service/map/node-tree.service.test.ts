import { describe, it, expect } from "vitest";
import { nodeTreeService } from "./node-tree.service";
import { createPosition } from "@/domain/model/map/value-object/position";
import type { Node } from "@/domain/model/map/node";
import type { NodeId } from "@/domain/model/map/value-object/node-id";
import type { MapId } from "@/domain/model/map/value-object/map-id";

describe("NodeTreeService", () => {
  const node = (
    id: NodeId,
    mapId: MapId,
    parentId: NodeId | null,
    order: number,
    type: "root" | "default" = "default"
  ): Node => ({
    id,
    mapId,
    parentId,
    text: String(id),
    position: createPosition(0, 0),
    order,
    type,
  });

  const mapId = "m1" as MapId;

  describe("getDescendantIds", () => {
    it("直下の子のみのとき子 ID 一覧が返ること", () => {
      const rootId = "root" as NodeId;
      const childId = "child" as NodeId;
      const nodes: Node[] = [
        node(rootId, mapId, null, 0, "root"),
        node(childId, mapId, rootId, 0),
      ];
      const ids = nodeTreeService.getDescendantIds(nodes, rootId);
      expect(ids).toEqual([childId]);
    });

    it("深い子孫まで含めて返ること", () => {
      const rootId = "root" as NodeId;
      const c1 = "c1" as NodeId;
      const c2 = "c2" as NodeId;
      const c3 = "c3" as NodeId;
      const nodes: Node[] = [
        node(rootId, mapId, null, 0, "root"),
        node(c1, mapId, rootId, 0),
        node(c2, mapId, c1, 0),
        node(c3, mapId, c2, 0),
      ];
      const ids = nodeTreeService.getDescendantIds(nodes, rootId);
      expect(ids).toHaveLength(3);
      expect(ids).toContain(c1);
      expect(ids).toContain(c2);
      expect(ids).toContain(c3);
    });

    it("子がいないとき 0 件であること", () => {
      const rootId = "root" as NodeId;
      const nodes: Node[] = [node(rootId, mapId, null, 0, "root")];
      const ids = nodeTreeService.getDescendantIds(nodes, rootId);
      expect(ids).toEqual([]);
    });
  });

  describe("applyDeleteStrategy", () => {
    it("cascade: 指定ノードと子孫が削除された Node[] になること", () => {
      const rootId = "root" as NodeId;
      const childId = "child" as NodeId;
      const nodes: Node[] = [
        node(rootId, mapId, null, 0, "root"),
        node(childId, mapId, rootId, 0),
      ];
      const result = nodeTreeService.applyDeleteStrategy(
        nodes,
        rootId,
        "cascade"
      );
      expect(result).toHaveLength(0);
    });

    it("reparent: 指定ノードのみ削除され、子の parentId が削除ノードの親になること", () => {
      const rootId = "root" as NodeId;
      const midId = "mid" as NodeId;
      const childId = "child" as NodeId;
      const nodes: Node[] = [
        node(rootId, mapId, null, 0, "root"),
        node(midId, mapId, rootId, 0),
        node(childId, mapId, midId, 0),
      ];
      const result = nodeTreeService.applyDeleteStrategy(
        nodes,
        midId,
        "reparent"
      );
      expect(result).toHaveLength(2);
      const child = result.find((n) => n.id === childId);
      expect(child?.parentId).toBe(rootId);
    });

    it("prevent: 子がいる場合は nodes がそのまま返ること", () => {
      const rootId = "root" as NodeId;
      const childId = "child" as NodeId;
      const nodes: Node[] = [
        node(rootId, mapId, null, 0, "root"),
        node(childId, mapId, rootId, 0),
      ];
      const result = nodeTreeService.applyDeleteStrategy(
        nodes,
        rootId,
        "prevent"
      );
      expect(result).toHaveLength(2);
      expect(result).toEqual(nodes);
    });

    it("prevent: 子がいない場合は指定ノードのみ削除されること", () => {
      const rootId = "root" as NodeId;
      const nodes: Node[] = [node(rootId, mapId, null, 0, "root")];
      const result = nodeTreeService.applyDeleteStrategy(
        nodes,
        rootId,
        "prevent"
      );
      expect(result).toHaveLength(0);
    });

    it("存在しない nodeId のときは nodes がそのまま返ること", () => {
      const rootId = "root" as NodeId;
      const nodes: Node[] = [node(rootId, mapId, null, 0, "root")];
      const result = nodeTreeService.applyDeleteStrategy(
        nodes,
        "nonexistent" as NodeId,
        "cascade"
      );
      expect(result).toEqual(nodes);
    });
  });
});
