import { describe, it, expect } from "vitest";
import { createDefaultMapAggregate } from "./create-default-map-aggregate";
import type { MapId } from "@/domain/model/map/value-object/map-id";

describe("createDefaultMapAggregate", () => {
  const mapId = "map-1" as MapId;

  it("指定した mapId で MapAggregate を返す", () => {
    const result = createDefaultMapAggregate(mapId);
    expect(result.mapId).toBe(mapId);
    expect(result.nodes).toHaveLength(4);
  });

  it("ルートノードが無題・parentId null・type root である", () => {
    const result = createDefaultMapAggregate(mapId);
    const root = result.nodes.find((n) => n.parentId === null);
    expect(root).toBeDefined();
    expect(root?.text).toBe("無題");
    expect(root?.id).toBe("root");
    expect(root?.type).toBe("root");
    expect(root?.order).toBe(0);
  });

  it("子ノードがノード1・ノード2・ノード3 である", () => {
    const result = createDefaultMapAggregate(mapId);
    const children = result.nodes.filter((n) => n.parentId !== null);
    expect(children).toHaveLength(3);
    expect(children.map((n) => n.text)).toEqual([
      "ノード1",
      "ノード2",
      "ノード3",
    ]);
    expect(children.map((n) => n.type)).toEqual([
      "default",
      "default",
      "default",
    ]);
    expect(children.map((n) => n.order)).toEqual([0, 1, 2]);
  });
});
