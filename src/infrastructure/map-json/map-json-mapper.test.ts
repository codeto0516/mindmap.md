import { describe, it, expect } from "vitest";
import { toMapAggregate, toMapJSON } from "./map-json-mapper";
import type { MapId } from "@/domain/model/map/value-object/map-id";
import type { MapJSON } from "./types";

describe("map-json-mapper", () => {
  const mapId = "map-1" as MapId;

  describe("toMapAggregate", () => {
    it("MapJSON から MapAggregate を生成し、position は (0,0) になること", () => {
      const json: MapJSON = {
        nodes: [
          {
            id: "node-1",
            parentId: null,
            text: "Root",
            order: 0,
            type: "root",
          },
          {
            id: "node-2",
            parentId: "node-1",
            text: "Child",
            order: 0,
            type: "default",
          },
        ],
      };
      const agg = toMapAggregate(mapId, json);
      expect(agg.mapId).toBe(mapId);
      expect(agg.nodes).toHaveLength(2);
      expect(agg.nodes[0].id).toBe("node-1");
      expect(agg.nodes[0].mapId).toBe(mapId);
      expect(agg.nodes[0].parentId).toBeNull();
      expect(agg.nodes[0].text).toBe("Root");
      expect(agg.nodes[0].order).toBe(0);
      expect(agg.nodes[0].type).toBe("root");
      expect(agg.nodes[0].position).toEqual({ x: 0, y: 0 });
      expect(agg.nodes[1].id).toBe("node-2");
      expect(agg.nodes[1].parentId).toBe("node-1");
      expect(agg.nodes[1].type).toBe("default");
      expect(agg.nodes[1].position).toEqual({ x: 0, y: 0 });
    });

    it("空の nodes のとき MapAggregate の nodes が空であること", () => {
      const json: MapJSON = { nodes: [] };
      const agg = toMapAggregate(mapId, json);
      expect(agg.mapId).toBe(mapId);
      expect(agg.nodes).toHaveLength(0);
    });
  });

  describe("toMapJSON", () => {
    it("MapAggregate から MapJSON を生成し、mapId と position が含まれないこと", () => {
      const agg = toMapAggregate(mapId, {
        nodes: [
          {
            id: "node-1",
            parentId: null,
            text: "Root",
            order: 0,
            type: "root",
          },
        ],
      });
      const aggWithPosition = {
        ...agg,
        nodes: [{ ...agg.nodes[0], position: { x: 100, y: 200 } }],
      };
      const json = toMapJSON(aggWithPosition);
      expect(json.nodes).toHaveLength(1);
      expect(json.nodes[0]).toEqual({
        id: "node-1",
        parentId: null,
        text: "Root",
        order: 0,
        type: "root",
      });
      expect("mapId" in json.nodes[0]).toBe(false);
      expect("position" in json.nodes[0]).toBe(false);
    });
  });

  describe("round-trip", () => {
    it("toMapJSON(toMapAggregate(mapId, json)) で nodes の id/parentId/text/order/type が復元されること", () => {
      const json: MapJSON = {
        nodes: [
          { id: "a", parentId: null, text: "A", order: 0, type: "root" },
          { id: "b", parentId: "a", text: "B", order: 0, type: "default" },
        ],
      };
      const agg = toMapAggregate(mapId, json);
      const back = toMapJSON(agg);
      expect(back.nodes).toHaveLength(2);
      expect(back.nodes[0]).toEqual(json.nodes[0]);
      expect(back.nodes[1]).toEqual(json.nodes[1]);
    });
  });
});
