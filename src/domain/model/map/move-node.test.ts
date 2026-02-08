import { describe, it, expect } from "vitest";
import { moveNode } from "./move-node";
import { createPosition } from "./value-object/position";
import type { Node } from "./node";
import type { MapId } from "./value-object/map-id";
import type { NodeId } from "./value-object/node-id";

describe("moveNode", () => {
  const node: Node = {
    id: "n1" as NodeId,
    mapId: "m1" as MapId,
    parentId: null,
    text: "Text",
    position: createPosition(0, 0),
    order: 0,
    type: "root",
  };

  it("position のみ変わり他が不変であること", () => {
    const newPosition = createPosition(100, 200);
    const result = moveNode(node, newPosition);
    expect(result.position).toEqual(newPosition);
    expect(result.id).toBe(node.id);
    expect(result.mapId).toBe(node.mapId);
    expect(result.parentId).toBe(node.parentId);
    expect(result.text).toBe(node.text);
    expect(result.order).toBe(node.order);
    expect(result.type).toBe(node.type);
  });

  it("渡した node は変更されないこと", () => {
    moveNode(node, createPosition(1, 2));
    expect(node.position).toEqual({ x: 0, y: 0 });
  });
});
