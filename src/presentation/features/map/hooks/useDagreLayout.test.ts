import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useDagreLayout } from "./useDagreLayout";
import type { MindNode } from "@/application/map/mind-node";

describe("useDagreLayout", () => {
  it("単一ノードのレイアウトを計算する", () => {
    const data: MindNode = {
      id: "root",
      title: "Root",
    };

    const { result } = renderHook(() => useDagreLayout(data));

    expect(result.current.nodes).toHaveLength(1);
    expect(result.current.nodes[0].id).toBe("root");
    expect(result.current.nodes[0].position.x).toBe(0);
    expect(result.current.nodes[0].position.y).toBe(0);
    expect(result.current.nodes[0].data.isRoot).toBe(true);
    expect(result.current.edges).toHaveLength(0);
  });

  it("親子ノードのレイアウトを計算する", () => {
    const data: MindNode = {
      id: "root",
      title: "Root",
      children: [
        {
          id: "child1",
          title: "Child 1",
        },
      ],
    };

    const { result } = renderHook(() => useDagreLayout(data));

    expect(result.current.nodes).toHaveLength(2);
    expect(result.current.edges).toHaveLength(1);
    expect(result.current.edges[0].source).toBe("root");
    expect(result.current.edges[0].target).toBe("child1");

    const rootNode = result.current.nodes.find((n) => n.id === "root");
    const childNode = result.current.nodes.find((n) => n.id === "child1");

    expect(rootNode).toBeTruthy();
    expect(childNode).toBeTruthy();
    expect(childNode!.position.x).toBeGreaterThan(rootNode!.position.x);

    // ルートだけ data.isRoot === true、子は false（または未設定）
    expect(rootNode!.data.isRoot).toBe(true);
    expect(childNode!.data.isRoot).toBe(false);

    // エッジは right → left の Handle を明示
    expect(result.current.edges[0].sourceHandle).toBe("right");
    expect(result.current.edges[0].targetHandle).toBe("left");
  });

  it("複数の子ノードのレイアウトを計算する", () => {
    const data: MindNode = {
      id: "root",
      title: "Root",
      children: [
        {
          id: "child1",
          title: "Child 1",
        },
        {
          id: "child2",
          title: "Child 2",
        },
        {
          id: "child3",
          title: "Child 3",
        },
      ],
    };

    const { result } = renderHook(() => useDagreLayout(data));

    expect(result.current.nodes).toHaveLength(4);
    expect(result.current.edges).toHaveLength(3);

    const childNodes = result.current.nodes.filter((n) =>
      n.id.startsWith("child"),
    );
    expect(childNodes).toHaveLength(3);

    // 子ノードは縦に並ぶ
    const yPositions = childNodes
      .map((n) => n.position.y)
      .sort((a, b) => a - b);
    expect(yPositions[0]).toBeLessThan(yPositions[1]);
    expect(yPositions[1]).toBeLessThan(yPositions[2]);
  });

  it("折りたたまれたノードの子はレイアウトに含まれない", () => {
    const data: MindNode = {
      id: "root",
      title: "Root",
      children: [
        {
          id: "child1",
          title: "Child 1",
          collapsed: true,
          children: [
            {
              id: "grandchild1",
              title: "Grandchild 1",
            },
          ],
        },
      ],
    };

    const { result } = renderHook(() => useDagreLayout(data));

    expect(result.current.nodes).toHaveLength(2); // root + child1のみ
    expect(
      result.current.nodes.find((n) => n.id === "grandchild1"),
    ).toBeUndefined();
    expect(result.current.edges).toHaveLength(1);
  });

  it("ノードの高さが考慮される", () => {
    const data: MindNode = {
      id: "root",
      title: "Root",
      children: [
        {
          id: "child1",
          title: "Child 1",
        },
      ],
    };

    const nodeHeights = {
      root: 50,
      child1: 100,
    };

    const { result } = renderHook(() => useDagreLayout(data, nodeHeights));

    expect(result.current.nodes).toHaveLength(2);
  });

  it("ノードの幅が考慮される", () => {
    const data: MindNode = {
      id: "root",
      title: "Root",
      children: [
        {
          id: "child1",
          title: "Child 1",
        },
      ],
    };

    const nodeWidths = {
      root: 200,
      child1: 300,
    };

    const { result } = renderHook(() =>
      useDagreLayout(data, undefined, nodeWidths),
    );

    const rootNode = result.current.nodes.find((n) => n.id === "root");
    const childNode = result.current.nodes.find((n) => n.id === "child1");

    expect(rootNode).toBeTruthy();
    expect(childNode).toBeTruthy();
    // 子ノードのX座標は親の右端 + GAP_X (50) になる
    expect(childNode!.position.x).toBe(rootNode!.position.x + 200 + 50);
  });

  it("nodeHeightsが変更されるとレイアウトが再計算される", () => {
    const data: MindNode = {
      id: "root",
      title: "Root",
    };

    const { result, rerender } = renderHook(
      ({ nodeHeights }: { nodeHeights?: Record<string, number> }) =>
        useDagreLayout(data, nodeHeights),
      {
        initialProps: {
          nodeHeights: undefined as Record<string, number> | undefined,
        },
      },
    );

    const firstResult = result.current;

    rerender({ nodeHeights: { root: 50 } });

    // nodeHeightsが変更されると、新しいオブジェクトが返される
    expect(result.current).not.toBe(firstResult);
  });

  it("深い階層のレイアウトを計算する", () => {
    const data: MindNode = {
      id: "root",
      title: "Root",
      children: [
        {
          id: "child1",
          title: "Child 1",
          children: [
            {
              id: "grandchild1",
              title: "Grandchild 1",
            },
          ],
        },
      ],
    };

    const { result } = renderHook(() => useDagreLayout(data));

    expect(result.current.nodes).toHaveLength(3);
    expect(result.current.edges).toHaveLength(2);

    const rootNode = result.current.nodes.find((n) => n.id === "root");
    const childNode = result.current.nodes.find((n) => n.id === "child1");
    const grandchildNode = result.current.nodes.find(
      (n) => n.id === "grandchild1",
    );

    expect(rootNode).toBeTruthy();
    expect(childNode).toBeTruthy();
    expect(grandchildNode).toBeTruthy();

    // X座標は階層が深くなるほど大きくなる
    expect(rootNode!.position.x).toBeLessThan(childNode!.position.x);
    expect(childNode!.position.x).toBeLessThan(grandchildNode!.position.x);

    // ルートだけ data.isRoot === true
    expect(rootNode!.data.isRoot).toBe(true);
    expect(childNode!.data.isRoot).toBe(false);
    expect(grandchildNode!.data.isRoot).toBe(false);
  });

  it("ルートノードのY座標が0に固定される", () => {
    const data: MindNode = {
      id: "root",
      title: "Root",
      children: [
        {
          id: "child1",
          title: "Child 1",
        },
      ],
    };

    const { result } = renderHook(() => useDagreLayout(data));

    const rootNode = result.current.nodes.find((n) => n.id === "root");
    expect(rootNode).toBeTruthy();
    expect(rootNode!.position.y).toBe(0);
  });
});
