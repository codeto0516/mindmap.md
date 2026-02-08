import { describe, it, expect } from "vitest";
import {
  updateNodeInTree,
  findNodeInTree,
  findParentNode,
  findAncestorNodeIds,
  getFocusTargetAfterDelete,
  generateNodeId,
} from "./nodeHelpers";
import type { MindNode } from "@/types/mind-node";

describe("nodeHelpers", () => {
  const createTestTree = (): MindNode => ({
    id: "root",
    title: "Root",
    children: [
      {
        id: "child1",
        title: "Child 1",
        children: [
          { id: "child1-1", title: "Child 1-1" },
          { id: "child1-2", title: "Child 1-2" },
        ],
      },
      {
        id: "child2",
        title: "Child 2",
      },
    ],
  });

  describe("updateNodeInTree", () => {
    it("ノードのタイトルを更新できる", () => {
      const tree = createTestTree();
      const result = updateNodeInTree(tree, "child1", (node) => ({
        ...node,
        title: "Updated Child 1",
      }));

      expect(result).not.toBeNull();
      expect(result?.children?.[0]?.title).toBe("Updated Child 1");
      expect(result?.children?.[0]?.children).toHaveLength(2);
    });

    it("ルートノードを更新できる", () => {
      const tree = createTestTree();
      const result = updateNodeInTree(tree, "root", (node) => ({
        ...node,
        title: "Updated Root",
      }));

      expect(result).not.toBeNull();
      expect(result?.title).toBe("Updated Root");
    });

    it("ノードを削除できる", () => {
      const tree = createTestTree();
      const result = updateNodeInTree(tree, "child1-1", () => null);

      expect(result).not.toBeNull();
      expect(result?.children?.[0]?.children).toHaveLength(1);
      expect(result?.children?.[0]?.children?.[0]?.id).toBe("child1-2");
    });

    it("全ての子ノードを削除するとchildrenプロパティがundefinedになる", () => {
      const tree = createTestTree();
      const result1 = updateNodeInTree(tree, "child1-1", () => null);
      const result2 = updateNodeInTree(result1!, "child1-2", () => null);

      expect(result2).not.toBeNull();
      expect(result2?.children?.[0]?.children).toBeUndefined();
    });

    it("存在しないノードIDの場合は変更なしで返す", () => {
      const tree = createTestTree();
      const result = updateNodeInTree(tree, "nonexistent", (node) => ({
        ...node,
        title: "Updated",
      }));

      expect(result).toEqual(tree);
    });

    it("ルートノードを削除しようとするとnullを返す", () => {
      const tree = createTestTree();
      const result = updateNodeInTree(tree, "root", () => null);

      expect(result).toBeNull();
    });
  });

  describe("findNodeInTree", () => {
    it("ルートノードを検索できる", () => {
      const tree = createTestTree();
      const result = findNodeInTree(tree, "root");

      expect(result).not.toBeNull();
      expect(result?.id).toBe("root");
      expect(result?.title).toBe("Root");
    });

    it("子ノードを検索できる", () => {
      const tree = createTestTree();
      const result = findNodeInTree(tree, "child1");

      expect(result).not.toBeNull();
      expect(result?.id).toBe("child1");
      expect(result?.title).toBe("Child 1");
    });

    it("孫ノードを検索できる", () => {
      const tree = createTestTree();
      const result = findNodeInTree(tree, "child1-1");

      expect(result).not.toBeNull();
      expect(result?.id).toBe("child1-1");
      expect(result?.title).toBe("Child 1-1");
    });

    it("存在しないノードIDの場合はnullを返す", () => {
      const tree = createTestTree();
      const result = findNodeInTree(tree, "nonexistent");

      expect(result).toBeNull();
    });
  });

  describe("findParentNode", () => {
    it("子ノードの親ノードを検索できる", () => {
      const tree = createTestTree();
      const result = findParentNode(tree, "child1");

      expect(result).not.toBeNull();
      expect(result?.id).toBe("root");
    });

    it("孫ノードの親ノードを検索できる", () => {
      const tree = createTestTree();
      const result = findParentNode(tree, "child1-1");

      expect(result).not.toBeNull();
      expect(result?.id).toBe("child1");
    });

    it("ルートノードの場合はnullを返す", () => {
      const tree = createTestTree();
      const result = findParentNode(tree, "root");

      expect(result).toBeNull();
    });

    it("存在しないノードIDの場合はnullを返す", () => {
      const tree = createTestTree();
      const result = findParentNode(tree, "nonexistent");

      expect(result).toBeNull();
    });
  });

  describe("findAncestorNodeIds", () => {
    it("子ノードの祖先ノードIDを取得できる", () => {
      const tree = createTestTree();
      const result = findAncestorNodeIds(tree, "child1");

      expect(result).toEqual(["root"]);
    });

    it("孫ノードの祖先ノードIDを取得できる", () => {
      const tree = createTestTree();
      const result = findAncestorNodeIds(tree, "child1-1");

      expect(result).toEqual(["root", "child1"]);
    });

    it("ルートノードの場合は空配列を返す", () => {
      const tree = createTestTree();
      const result = findAncestorNodeIds(tree, "root");

      expect(result).toEqual([]);
    });

    it("存在しないノードIDの場合は空配列を返す", () => {
      const tree = createTestTree();
      const result = findAncestorNodeIds(tree, "nonexistent");

      expect(result).toEqual([]);
    });
  });

  describe("getFocusTargetAfterDelete", () => {
    it("ルートを渡した場合はnullを返す", () => {
      const tree = createTestTree();
      expect(getFocusTargetAfterDelete(tree, "root")).toBeNull();
    });

    it("同階層に自分だけのときは親のIDを返す（ルール3）", () => {
      const tree: MindNode = {
        id: "root",
        title: "Root",
        children: [{ id: "only", title: "Only" }],
      };
      expect(getFocusTargetAfterDelete(tree, "only")).toBe("root");
    });

    it("同階層で自分が1番上のときは次の兄弟のIDを返す（ルール1）", () => {
      const tree = createTestTree();
      expect(getFocusTargetAfterDelete(tree, "child1")).toBe("child2");
      expect(getFocusTargetAfterDelete(tree, "child1-1")).toBe("child1-2");
    });

    it("同階層で自分が1番上でないときは1つ前の兄弟のIDを返す（ルール2）", () => {
      const tree = createTestTree();
      expect(getFocusTargetAfterDelete(tree, "child2")).toBe("child1");
      expect(getFocusTargetAfterDelete(tree, "child1-2")).toBe("child1-1");
    });

    it("存在しないnodeIdの場合はnullを返す", () => {
      const tree = createTestTree();
      expect(getFocusTargetAfterDelete(tree, "nonexistent")).toBeNull();
    });
  });

  describe("generateNodeId", () => {
    it("親ノードIDを含む一意のIDを生成する", () => {
      const parentId = "parent1";
      const nodeId = generateNodeId(parentId);

      expect(nodeId).toContain(parentId);
      expect(nodeId).toMatch(/^parent1-\d+-[a-z0-9]+$/);
    });

    it("異なる呼び出しで異なるIDを生成する", () => {
      const parentId = "parent1";
      const nodeId1 = generateNodeId(parentId);
      const nodeId2 = generateNodeId(parentId);

      expect(nodeId1).not.toBe(nodeId2);
    });

    it("タイムスタンプとランダム値が含まれる", () => {
      const parentId = "parent1";
      const nodeId = generateNodeId(parentId);
      const parts = nodeId.split("-");

      expect(parts.length).toBeGreaterThanOrEqual(3);
      expect(parts[0]).toBe(parentId);
      expect(parts[1]).toMatch(/^\d+$/); // タイムスタンプ
      expect(parts[2]).toMatch(/^[a-z0-9]+$/); // ランダム値
    });
  });
});
