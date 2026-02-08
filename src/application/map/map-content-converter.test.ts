import { describe, it, expect } from "vitest";
import {
  mapAggregateToMindNode,
  mindNodeToMapAggregate,
} from "./map-content-converter";
import type { MapId } from "@/domain/model/map/value-object/map-id";
import type { NodeId } from "@/domain/model/map/value-object/node-id";
import type { MindNode } from "@/application/map/mind-node";

describe("map-content-converter", () => {
  const mapId = "map-1" as MapId;

  describe("mapAggregateToMindNode", () => {
    it("空のノード一覧のときルートのみのデフォルト MindNode を返す", () => {
      const aggregate = { mapId, nodes: [] };
      const result = mapAggregateToMindNode(aggregate);
      expect(result).toEqual({ id: "root", title: "無題", children: [] });
    });

    it("ルートのみのときそのルートを MindNode に変換する", () => {
      const aggregate = {
        mapId,
        nodes: [
          {
            id: "root" as NodeId,
            mapId,
            parentId: null,
            text: "ルート",
            position: { x: 0, y: 0 },
            order: 0,
            type: "root" as const,
          },
        ],
      };
      const result = mapAggregateToMindNode(aggregate);
      expect(result).toEqual({
        id: "root",
        title: "ルート",
        children: undefined,
      });
    });

    it("ルートと子を持つ MapAggregate をツリーに変換する", () => {
      const aggregate = {
        mapId,
        nodes: [
          {
            id: "root" as NodeId,
            mapId,
            parentId: null,
            text: "ルート",
            position: { x: 0, y: 0 },
            order: 0,
            type: "root" as const,
          },
          {
            id: "child1" as NodeId,
            mapId,
            parentId: "root" as NodeId,
            text: "子1",
            position: { x: 0, y: 0 },
            order: 0,
            type: "default" as const,
          },
          {
            id: "child2" as NodeId,
            mapId,
            parentId: "root" as NodeId,
            text: "子2",
            position: { x: 0, y: 0 },
            order: 1,
            type: "default" as const,
          },
        ],
      };
      const result = mapAggregateToMindNode(aggregate);
      expect(result).toEqual({
        id: "root",
        title: "ルート",
        children: [
          { id: "child1", title: "子1", children: [] },
          { id: "child2", title: "子2", children: [] },
        ],
      });
    });
  });

  describe("mindNodeToMapAggregate", () => {
    it("ルートのみの MindNode を MapAggregate に変換し、type が root になる", () => {
      const mindNode: MindNode = { id: "root", title: "無題", children: [] };
      const result = mindNodeToMapAggregate(mapId, mindNode);
      expect(result.mapId).toBe(mapId);
      expect(result.nodes).toHaveLength(1);
      expect(result.nodes[0]).toMatchObject({
        id: "root",
        parentId: null,
        text: "無題",
        type: "root",
        order: 0,
      });
    });

    it("子を持つ MindNode を MapAggregate に変換する", () => {
      const mindNode: MindNode = {
        id: "root",
        title: "ルート",
        children: [
          { id: "c1", title: "子1", children: [] },
          { id: "c2", title: "子2", children: [] },
        ],
      };
      const result = mindNodeToMapAggregate(mapId, mindNode);
      expect(result.nodes).toHaveLength(3);
      const root = result.nodes.find((n) => n.parentId === null);
      expect(root?.type).toBe("root");
      const children = result.nodes.filter((n) => n.parentId !== null);
      expect(children.every((n) => n.type === "default")).toBe(true);
    });
  });

  describe("往復変換", () => {
    it("MapAggregate → MindNode → MapAggregate でノード数とテキストが一致する", () => {
      const aggregate = {
        mapId,
        nodes: [
          {
            id: "root" as NodeId,
            mapId,
            parentId: null,
            text: "ルート",
            position: { x: 0, y: 0 },
            order: 0,
            type: "root" as const,
          },
          {
            id: "child1" as NodeId,
            mapId,
            parentId: "root" as NodeId,
            text: "子1",
            position: { x: 0, y: 0 },
            order: 0,
            type: "default" as const,
          },
        ],
      };
      const mindNode = mapAggregateToMindNode(aggregate);
      const back = mindNodeToMapAggregate(mapId, mindNode);
      expect(back.nodes).toHaveLength(aggregate.nodes.length);
      const sortById = (a: { id: string }, b: { id: string }) =>
        a.id.localeCompare(b.id);
      const origSorted = [...aggregate.nodes].sort(sortById);
      const backSorted = [...back.nodes].sort(sortById);
      for (let i = 0; i < origSorted.length; i++) {
        expect(backSorted[i].id).toBe(origSorted[i].id);
        expect(backSorted[i].text).toBe(origSorted[i].text);
        expect(backSorted[i].parentId).toEqual(origSorted[i].parentId);
        expect(backSorted[i].type).toBe(origSorted[i].type);
      }
    });

    it("MindNode → MapAggregate → MindNode でツリー構造が復元される", () => {
      const mindNode: MindNode = {
        id: "root",
        title: "ルート",
        children: [
          {
            id: "c1",
            title: "子1",
            children: [{ id: "c1-1", title: "孫1", children: [] }],
          },
        ],
      };
      const aggregate = mindNodeToMapAggregate(mapId, mindNode);
      const back = mapAggregateToMindNode(aggregate);
      expect(back.id).toBe(mindNode.id);
      expect(back.title).toBe(mindNode.title);
      expect(back.children).toHaveLength(1);
      expect(back.children![0].id).toBe("c1");
      expect(back.children![0].title).toBe("子1");
      expect(back.children![0].children).toHaveLength(1);
      expect(back.children![0].children![0]).toMatchObject({
        id: "c1-1",
        title: "孫1",
      });
    });
  });
});
