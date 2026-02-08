import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useMindMapState } from "./useMindMapState";
import type { MindNode } from "@/application/map/mind-node";

describe("useMindMapState", () => {
  const createInitialData = (): MindNode => ({
    id: "root",
    title: "Root",
    children: [{ id: "child1", title: "Child 1" }],
  });

  it("初期データで状態を初期化する", () => {
    const initialData = createInitialData();
    const { result } = renderHook(() => useMindMapState(initialData));

    expect(result.current.data).toEqual(initialData);
    expect(result.current.selectedNodeId).toBeNull();
  });

  it("データを更新できる", () => {
    const initialData = createInitialData();
    const { result } = renderHook(() => useMindMapState(initialData));

    const newData: MindNode = {
      id: "root",
      title: "Updated Root",
    };

    act(() => {
      result.current.setData(newData);
    });

    expect(result.current.data).toEqual(newData);
  });

  it("選択中のノードIDを設定できる", () => {
    const initialData = createInitialData();
    const { result } = renderHook(() => useMindMapState(initialData));

    act(() => {
      result.current.setSelectedNodeId("child1");
    });

    expect(result.current.selectedNodeId).toBe("child1");
  });

  it("選択中のノードIDを解除できる", () => {
    const initialData = createInitialData();
    const { result } = renderHook(() => useMindMapState(initialData));

    act(() => {
      result.current.setSelectedNodeId("child1");
      result.current.setSelectedNodeId(null);
    });

    expect(result.current.selectedNodeId).toBeNull();
  });

  it("initialDataが変更されると状態がリセットされる", () => {
    const initialData = createInitialData();
    const { result, rerender } = renderHook(
      ({ initialData }) => useMindMapState(initialData),
      { initialProps: { initialData } },
    );

    // 状態を変更
    act(() => {
      result.current.setSelectedNodeId("child1");
    });

    // initialDataを変更
    const newInitialData: MindNode = {
      id: "root2",
      title: "New Root",
    };

    rerender({ initialData: newInitialData });

    expect(result.current.data).toEqual(newInitialData);
    expect(result.current.selectedNodeId).toBeNull();
  });

  it("initialDataが同じオブジェクト参照の場合はリセットされない", () => {
    const initialData = createInitialData();
    const { result, rerender } = renderHook(
      ({ initialData }) => useMindMapState(initialData),
      { initialProps: { initialData } },
    );

    act(() => {
      result.current.setSelectedNodeId("child1");
    });

    rerender({ initialData });

    expect(result.current.selectedNodeId).toBe("child1");
  });

  it("複数のノードIDを選択できる", () => {
    const initialData = createInitialData();
    const { result } = renderHook(() => useMindMapState(initialData));

    act(() => {
      result.current.setSelectedNodeIds(["child1", "root"]);
    });

    expect(result.current.selectedNodeIds).toEqual(["child1", "root"]);
    expect(result.current.selectedNodeId).toBe("child1");
  });

  it("selectedNodeIdsが空の場合はselectedNodeIdはnullになる", () => {
    const initialData = createInitialData();
    const { result } = renderHook(() => useMindMapState(initialData));

    act(() => {
      result.current.setSelectedNodeIds([]);
    });

    expect(result.current.selectedNodeIds).toEqual([]);
    expect(result.current.selectedNodeId).toBeNull();
  });

  it("setSelectedNodeIdで単一選択するとselectedNodeIdsが更新される", () => {
    const initialData = createInitialData();
    const { result } = renderHook(() => useMindMapState(initialData));

    act(() => {
      result.current.setSelectedNodeId("child1");
    });

    expect(result.current.selectedNodeIds).toEqual(["child1"]);
    expect(result.current.selectedNodeId).toBe("child1");
  });

  it("setSelectedNodeIdでnullを設定するとselectedNodeIdsが空になる", () => {
    const initialData = createInitialData();
    const { result } = renderHook(() => useMindMapState(initialData));

    act(() => {
      result.current.setSelectedNodeIds(["child1", "root"]);
      result.current.setSelectedNodeId(null);
    });

    expect(result.current.selectedNodeIds).toEqual([]);
    expect(result.current.selectedNodeId).toBeNull();
  });

  it("initialDataが変更されるとselectedNodeIdsがリセットされる", () => {
    const initialData = createInitialData();
    const { result, rerender } = renderHook(
      ({ initialData }) => useMindMapState(initialData),
      { initialProps: { initialData } },
    );

    act(() => {
      result.current.setSelectedNodeIds(["child1", "root"]);
    });

    const newInitialData: MindNode = {
      id: "root2",
      title: "New Root",
    };

    rerender({ initialData: newInitialData });

    expect(result.current.selectedNodeIds).toEqual([]);
    expect(result.current.selectedNodeId).toBeNull();
  });
});
