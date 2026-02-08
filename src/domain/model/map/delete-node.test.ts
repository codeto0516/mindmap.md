import { describe, it, expect } from "vitest";
import { createMap } from "./create-map";
import { deleteNode } from "./delete-node";
import { createPosition } from "./value-object/position";
import type { Node } from "./node";
import type { NodeId } from "./value-object/node-id";
import type { MapId } from "./value-object/map-id";

describe("deleteNode", () => {
  const workspaceId = "w1";

  const makeMap = () => createMap(workspaceId, "Map");

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

  it("cascade: 指定ノードと子孫が削除されること", () => {
    const map = makeMap();
    const rootId = "root" as NodeId;
    const childId = "child" as NodeId;
    const grandchildId = "grandchild" as NodeId;
    const nodes: Node[] = [
      node(rootId, map.id, null, 0, "root"),
      node(childId, map.id, rootId, 0),
      node(grandchildId, map.id, childId, 0),
    ];
    const { map: newMap, nodes: newNodes } = deleteNode(
      map,
      nodes,
      rootId,
      "cascade"
    );
    expect(newNodes).toHaveLength(0);
    expect(newMap.updatedAt.getTime()).toBeGreaterThanOrEqual(
      map.updatedAt.getTime()
    );
  });

  it("cascade: 指定ノードのみ（子なし）のときはそのノードだけ削除されること", () => {
    const map = makeMap();
    const rootId = "root" as NodeId;
    const nodes: Node[] = [node(rootId, map.id, null, 0, "root")];
    const { nodes: newNodes } = deleteNode(map, nodes, rootId, "cascade");
    expect(newNodes).toHaveLength(0);
  });

  it("reparent: 指定ノードのみ削除され、子の parentId が削除ノードの親になること", () => {
    const map = makeMap();
    const rootId = "root" as NodeId;
    const midId = "mid" as NodeId;
    const childId = "child" as NodeId;
    const nodes: Node[] = [
      node(rootId, map.id, null, 0, "root"),
      node(midId, map.id, rootId, 0),
      node(childId, map.id, midId, 0),
    ];
    const { nodes: newNodes } = deleteNode(map, nodes, midId, "reparent");
    expect(newNodes).toHaveLength(2);
    const root = newNodes.find((n) => n.id === rootId);
    const child = newNodes.find((n) => n.id === childId);
    expect(root).toBeDefined();
    expect(child).toBeDefined();
    expect(child?.parentId).toBe(rootId);
  });

  it("prevent: 子がいる場合は nodes が変化しないこと", () => {
    const map = makeMap();
    const rootId = "root" as NodeId;
    const childId = "child" as NodeId;
    const nodes: Node[] = [
      node(rootId, map.id, null, 0, "root"),
      node(childId, map.id, rootId, 0),
    ];
    const { nodes: newNodes } = deleteNode(map, nodes, rootId, "prevent");
    expect(newNodes).toHaveLength(2);
    expect(newNodes).toEqual(nodes);
  });

  it("prevent: 子がいない場合は削除されること", () => {
    const map = makeMap();
    const rootId = "root" as NodeId;
    const nodes: Node[] = [node(rootId, map.id, null, 0, "root")];
    const { nodes: newNodes } = deleteNode(map, nodes, rootId, "prevent");
    expect(newNodes).toHaveLength(0);
  });

  it("渡した map / nodes は変更されないこと", () => {
    const map = makeMap();
    const rootId = "root" as NodeId;
    const nodes: Node[] = [node(rootId, map.id, null, 0, "root")];
    const mapUpdatedAt = map.updatedAt.getTime();
    deleteNode(map, nodes, rootId, "cascade");
    expect(map.updatedAt.getTime()).toBe(mapUpdatedAt);
    expect(nodes).toHaveLength(1);
  });
});
