import { describe, it, expect } from "vitest";
import { createMap } from "./create-map";
import { addNode } from "./add-node";
import { createPosition } from "./value-object/position";
import type { NodeId } from "./value-object/node-id";
import type { Node } from "./node";

describe("addNode", () => {
  const workspaceId = "w1";

  const makeMap = () => createMap(workspaceId, "Map");

  it("ルート直下への追加で新 Node が nodes に追加されること", () => {
    const map = makeMap();
    const nodes: Node[] = [];
    const { map: newMap, nodes: newNodes } = addNode(map, nodes, null, "Root");

    expect(newNodes).toHaveLength(1);
    expect(newNodes[0].text).toBe("Root");
    expect(newNodes[0].parentId).toBeNull();
    expect(newNodes[0].mapId).toBe(map.id);
    expect(newNodes[0].order).toBe(0);
    expect(newNodes[0].type).toBe("root");
    expect(newMap.updatedAt.getTime()).toBeGreaterThanOrEqual(map.updatedAt.getTime());
    expect(nodes).toHaveLength(0);
  });

  it("既存親への追加で order が兄弟の末尾になること", () => {
    const map = makeMap();
    const rootId = "root" as NodeId;
    const nodes: Node[] = [
      {
        id: rootId,
        mapId: map.id,
        parentId: null,
        text: "Root",
        position: createPosition(0, 0),
        order: 0,
        type: "root",
      },
    ];
    const { nodes: newNodes } = addNode(map, nodes, rootId, "Child1");
    expect(newNodes).toHaveLength(2);
    const child1 = newNodes.find((n) => n.text === "Child1");
    expect(child1?.parentId).toBe(rootId);
    expect(child1?.order).toBe(0);

    const { nodes: newNodes2 } = addNode(map, newNodes, rootId, "Child2");
    const child2 = newNodes2.find((n) => n.text === "Child2");
    expect(child2?.order).toBe(1);
  });

  it("order を指定した場合はその値で挿入されること", () => {
    const map = makeMap();
    const rootId = "root" as NodeId;
    const nodes: Node[] = [
      {
        id: rootId,
        mapId: map.id,
        parentId: null,
        text: "Root",
        position: createPosition(0, 0),
        order: 0,
        type: "root",
      },
    ];
    const { nodes: newNodes } = addNode(
      map,
      nodes,
      rootId,
      "Child",
      createPosition(10, 10),
      5
    );
    const child = newNodes.find((n) => n.text === "Child");
    expect(child?.order).toBe(5);
    expect(child?.position).toEqual({ x: 10, y: 10 });
  });

  it("渡した map / nodes は変更されないこと", () => {
    const map = makeMap();
    const nodes: Node[] = [];
    const mapUpdatedAt = map.updatedAt.getTime();
    addNode(map, nodes, null, "Root");
    expect(map.updatedAt.getTime()).toBe(mapUpdatedAt);
    expect(nodes).toHaveLength(0);
  });
});
