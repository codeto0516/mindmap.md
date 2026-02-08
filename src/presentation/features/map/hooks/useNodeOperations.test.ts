import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useNodeOperations } from "./useNodeOperations";
import type { MindNode } from "@/types/mind-node";

describe("useNodeOperations", () => {
  const createTestData = (): MindNode => ({
    id: "root",
    title: "Root",
    children: [
      {
        id: "child1",
        title: "Child 1",
        children: [{ id: "child1-1", title: "Child 1-1" }],
      },
      { id: "child2", title: "Child 2" },
    ],
  });

  it("ノードの展開/折りたたみを切り替えられる", () => {
    const data = createTestData();
    const onDataChange = vi.fn();
    const { result } = renderHook(() =>
      useNodeOperations({ data, onDataChange }),
    );

    act(() => {
      result.current.toggleNode("child1");
    });

    expect(onDataChange).toHaveBeenCalledTimes(1);
    const updatedData = onDataChange.mock.calls[0][0];
    const child1Node = updatedData.children?.find(
      (node: MindNode) => node.id === "child1",
    );
    expect(child1Node?.collapsed).toBe(true);
  });

  it("ノードを検索できる", () => {
    const data = createTestData();
    const { result } = renderHook(() =>
      useNodeOperations({ data, onDataChange: undefined }),
    );

    const node = result.current.findNode("child1");
    expect(node).not.toBeNull();
    expect(node?.id).toBe("child1");
    expect(node?.title).toBe("Child 1");
  });

  it("存在しないノードの検索はnullを返す", () => {
    const data = createTestData();
    const { result } = renderHook(() =>
      useNodeOperations({ data, onDataChange: undefined }),
    );

    const node = result.current.findNode("nonexistent");
    expect(node).toBeNull();
  });

  it("子ノードを追加できる", () => {
    const data = createTestData();
    const onDataChange = vi.fn();
    const { result } = renderHook(() =>
      useNodeOperations({ data, onDataChange }),
    );

    act(() => {
      result.current.addChildNode("child1", "New Child");
    });

    expect(onDataChange).toHaveBeenCalledTimes(1);
    const updatedData = onDataChange.mock.calls[0][0];
    const child1Node = updatedData.children?.find(
      (node: MindNode) => node.id === "child1",
    );
    expect(child1Node?.children).toHaveLength(2);
    expect(child1Node?.children?.[1]?.title).toBe("New Child");
    expect(child1Node?.collapsed).toBe(false);
  });

  it("デフォルトタイトルで子ノードを追加できる", () => {
    const data = createTestData();
    const onDataChange = vi.fn();
    const { result } = renderHook(() =>
      useNodeOperations({ data, onDataChange }),
    );

    act(() => {
      result.current.addChildNode("child1");
    });

    expect(onDataChange).toHaveBeenCalledTimes(1);
    const updatedData = onDataChange.mock.calls[0][0];
    const child1Node = updatedData.children?.find(
      (node: MindNode) => node.id === "child1",
    );
    expect(child1Node?.children?.[1]?.title).toBe("新しいノード");
  });

  it("兄弟ノードを追加できる", () => {
    const data = createTestData();
    const onDataChange = vi.fn();
    const { result } = renderHook(() =>
      useNodeOperations({ data, onDataChange }),
    );

    act(() => {
      result.current.addSiblingNode("child1", "New Sibling");
    });

    expect(onDataChange).toHaveBeenCalledTimes(1);
    const updatedData = onDataChange.mock.calls[0][0];
    expect(updatedData.children).toHaveLength(3);
    expect(updatedData.children?.[1]?.title).toBe("New Sibling");
  });

  it("ルートノードに対して兄弟ノードを追加すると子ノードとして追加される", () => {
    const data = createTestData();
    const onDataChange = vi.fn();
    const { result } = renderHook(() =>
      useNodeOperations({ data, onDataChange }),
    );

    act(() => {
      result.current.addSiblingNode("root", "New Child");
    });

    expect(onDataChange).toHaveBeenCalledTimes(1);
    const updatedData = onDataChange.mock.calls[0][0];
    expect(updatedData.children).toHaveLength(3);
  });

  it("ノードを削除できる", () => {
    const data = createTestData();
    const onDataChange = vi.fn();
    const { result } = renderHook(() =>
      useNodeOperations({ data, onDataChange }),
    );

    act(() => {
      result.current.deleteNode("child1");
    });

    expect(onDataChange).toHaveBeenCalledTimes(1);
    const updatedData = onDataChange.mock.calls[0][0];
    expect(updatedData.children).toHaveLength(1);
    expect(updatedData.children?.[0]?.id).toBe("child2");
  });

  it("ルートノードは削除できない", () => {
    const data = createTestData();
    const onDataChange = vi.fn();
    const { result } = renderHook(() =>
      useNodeOperations({ data, onDataChange }),
    );

    act(() => {
      result.current.deleteNode("root");
    });

    expect(onDataChange).not.toHaveBeenCalled();
  });

  it("複数のノードを一括削除できる", () => {
    const data = createTestData();
    const onDataChange = vi.fn();
    const { result } = renderHook(() =>
      useNodeOperations({ data, onDataChange }),
    );

    act(() => {
      result.current.deleteNodes(["child1", "child2"]);
    });

    expect(onDataChange).toHaveBeenCalledTimes(1);
    const updatedData = onDataChange.mock.calls[0][0];
    expect(updatedData.children ?? []).toHaveLength(0);
  });

  it("複数削除時にルートノードは除外される", () => {
    const data = createTestData();
    const onDataChange = vi.fn();
    const { result } = renderHook(() =>
      useNodeOperations({ data, onDataChange }),
    );

    act(() => {
      result.current.deleteNodes(["root", "child1", "child2"]);
    });

    expect(onDataChange).toHaveBeenCalledTimes(1);
    const updatedData = onDataChange.mock.calls[0][0];
    // ルートノードは削除されず、child1とchild2のみ削除される
    expect(updatedData.id).toBe("root");
    expect(updatedData.children ?? []).toHaveLength(0);
  });

  it("複数削除時に存在しないノードIDが含まれていてもエラーにならない", () => {
    const data = createTestData();
    const onDataChange = vi.fn();
    const { result } = renderHook(() =>
      useNodeOperations({ data, onDataChange }),
    );

    act(() => {
      result.current.deleteNodes(["child1", "nonexistent", "child2"]);
    });

    expect(onDataChange).toHaveBeenCalledTimes(1);
    const updatedData = onDataChange.mock.calls[0][0];
    expect(updatedData.children ?? []).toHaveLength(0);
  });

  it("空の配列でdeleteNodesを呼び出しても何も起こらない", () => {
    const data = createTestData();
    const onDataChange = vi.fn();
    const { result } = renderHook(() =>
      useNodeOperations({ data, onDataChange }),
    );

    act(() => {
      result.current.deleteNodes([]);
    });

    expect(onDataChange).not.toHaveBeenCalled();
  });

  it("ノードのタイトルを更新できる", () => {
    const data = createTestData();
    const onDataChange = vi.fn();
    const { result } = renderHook(() =>
      useNodeOperations({ data, onDataChange }),
    );

    act(() => {
      result.current.updateNodeTitle("child1", "Updated Title");
    });

    expect(onDataChange).toHaveBeenCalledTimes(1);
    const updatedData = onDataChange.mock.calls[0][0];
    const child1Node = updatedData.children?.find(
      (node: MindNode) => node.id === "child1",
    );
    expect(child1Node?.title).toBe("Updated Title");
  });

  it("空のタイトルで更新しても変更されない", () => {
    const data = createTestData();
    const onDataChange = vi.fn();
    const { result } = renderHook(() =>
      useNodeOperations({ data, onDataChange }),
    );

    act(() => {
      result.current.updateNodeTitle("child1", "   ");
    });

    expect(onDataChange).not.toHaveBeenCalled();
  });

  it("タイトルの前後の空白がトリムされる", () => {
    const data = createTestData();
    const onDataChange = vi.fn();
    const { result } = renderHook(() =>
      useNodeOperations({ data, onDataChange }),
    );

    act(() => {
      result.current.updateNodeTitle("child1", "  Trimmed Title  ");
    });

    expect(onDataChange).toHaveBeenCalledTimes(1);
    const updatedData = onDataChange.mock.calls[0][0];
    const child1Node = updatedData.children?.find(
      (node: MindNode) => node.id === "child1",
    );
    expect(child1Node?.title).toBe("Trimmed Title");
  });

  it("dataが変更されても最新のデータを参照する", () => {
    const data1 = createTestData();
    const onDataChange = vi.fn();
    const { result, rerender } = renderHook(
      ({ data }) => useNodeOperations({ data, onDataChange }),
      {
        initialProps: { data: data1 },
      },
    );

    const data2: MindNode = {
      id: "root",
      title: "Root",
      children: [{ id: "child3", title: "Child 3" }],
    };

    rerender({ data: data2 });

    act(() => {
      result.current.deleteNode("child3");
    });

    expect(onDataChange).toHaveBeenCalledTimes(1);
    const updatedData = onDataChange.mock.calls[0][0];
    expect(updatedData.children).toBeUndefined();
  });
});
