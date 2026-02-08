import { describe, it, expect } from "vitest";
import { updateNodeText } from "./update-node-text";
import { createPosition } from "./value-object/position";
import type { Node } from "./node";
import type { MapId } from "./value-object/map-id";
import type { NodeId } from "./value-object/node-id";

describe("updateNodeText", () => {
  const node: Node = {
    id: "n1" as NodeId,
    mapId: "m1" as MapId,
    parentId: null,
    text: "Original",
    position: createPosition(0, 0),
    order: 0,
    type: "root",
  };

  it("テキストのみ変わり他プロパティが不変であること", () => {
    const result = updateNodeText(node, "Updated");
    expect(result.text).toBe("Updated");
    expect(result.id).toBe(node.id);
    expect(result.mapId).toBe(node.mapId);
    expect(result.parentId).toBe(node.parentId);
    expect(result.position).toBe(node.position);
    expect(result.order).toBe(node.order);
    expect(result.type).toBe(node.type);
  });

  it("渡した node は変更されないこと", () => {
    updateNodeText(node, "Updated");
    expect(node.text).toBe("Original");
  });
});
