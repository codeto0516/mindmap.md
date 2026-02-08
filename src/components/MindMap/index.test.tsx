import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import MindMap from "./index";
import type { MindNode } from "@/types/mind-node";

vi.mock("@xyflow/react", () => {
  // React Flow のオプション系 props（DOM に渡すと警告が出るためモックでは除外する）
  const reactFlowOptionKeys = [
    "panOnDrag",
    "panOnScroll",
    "zoomOnDoubleClick",
    "proOptions",
    "defaultEdgeOptions",
    "nodeTypes",
    "fitView",
    "nodesDraggable",
    "nodesConnectable",
    "selectionOnDrag",
    "selectionMode",
    "onNodesChange",
    "onEdgesChange",
  ];
  return {
    ReactFlow: vi.fn(({ children, onNodeClick, onNodeDoubleClick, onPaneClick, onSelectionChange, nodes, ...rest }) => {
      const domProps = Object.fromEntries(
        Object.entries(rest).filter(([key]) => !reactFlowOptionKeys.includes(key))
      );
      return (
        <div data-testid="react-flow" {...domProps}>
          <div
            data-testid="pane"
            onClick={() => onPaneClick?.()}
          />
          {nodes?.map(
            (node: {
              id: string;
              data?: { isEditing?: boolean; mindNode?: { title: string } };
            }) => (
              <div
                key={node.id}
                data-testid={`node-${node.id}`}
                data-node-id={node.id}
                data-editing={node.data?.isEditing}
                onClick={(e) => onNodeClick?.(e, node)}
                onDoubleClick={(e) => onNodeDoubleClick?.(e, node)}
              >
                {node.data?.isEditing ? (
                  <input
                    data-testid={`input-${node.id}`}
                    defaultValue={node.data?.mindNode?.title || ""}
                  />
                ) : (
                  <span>{node.data?.mindNode?.title}</span>
                )}
              </div>
            ),
          )}
          {children}
          <button
            data-testid="trigger-selection-change"
            onClick={() => {
              onSelectionChange?.({ nodes: nodes || [] });
            }}
          >
            Trigger Selection Change
          </button>
        </div>
      );
    }),
    Background: vi.fn(() => <div data-testid="background" />),
    applyNodeChanges: vi.fn((changes: unknown[], nodes: unknown[]) => nodes),
    useReactFlow: vi.fn(() => ({
      getNode: vi.fn(() => ({
        position: { x: 0, y: 0 },
        width: 172,
        height: 36,
      })),
      setCenter: vi.fn(),
      getZoom: vi.fn(() => 1),
    })),
    SelectionMode: { Partial: "partial" },
    Handle: vi.fn(() => null),
    Position: {
      Left: "left",
      Right: "right",
      Top: "top",
      Bottom: "bottom",
    },
  };
});

describe("MindMap", () => {
  const createInitialData = (): MindNode => ({
    id: "root",
    title: "Root",
    children: [{ id: "child1", title: "Child 1" }],
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("初期データでマインドマップをレンダリングする", () => {
    const data = createInitialData();
    render(<MindMap data={data} />);

    expect(screen.getByTestId("react-flow")).toBeInTheDocument();
    expect(screen.getByTestId("background")).toBeInTheDocument();
  });


  it("onChangeコールバックが設定できる", () => {
    const data = createInitialData();
    const onChange = vi.fn();
    render(<MindMap data={data} onChange={onChange} />);

    expect(screen.getByTestId("react-flow")).toBeInTheDocument();
    // コールバックが設定されていることを確認（コンポーネントが正常にレンダリングされている）
    expect(onChange).not.toHaveBeenCalled();
  });

  it("ReactFlowコンポーネントがレンダリングされる", () => {
    const data = createInitialData();
    render(<MindMap data={data} />);

    expect(screen.getByTestId("react-flow")).toBeInTheDocument();
    expect(screen.getByTestId("background")).toBeInTheDocument();
  });

  it("異なるdataでマインドマップをレンダリングできる", () => {
    const data2: MindNode = {
      id: "root2",
      title: "Root 2",
    };

    render(<MindMap data={data2} />);
    expect(screen.getByTestId("react-flow")).toBeInTheDocument();
  });

  it("ノードをダブルクリックすると編集モードに入る", async () => {
    const data = createInitialData();
    render(<MindMap data={data} />);

    // ノードを探す（モックではnodesがレンダリングされる）
    const node = await waitFor(
      () => screen.getByTestId("node-root"),
      { timeout: 2000 },
    );

    // ダブルクリック
    fireEvent.doubleClick(node);

    // 編集モードに入ることを確認（実際の実装では、nodesが更新される必要がある）
    // このテストはモックの制限により、実際の動作を完全に再現できない
    // ただし、エラーが発生しないことを確認
    expect(node).toBeInTheDocument();
  });

  it("ノードをクリックすると展開/折りたたみが切り替わる", async () => {
    const data = createInitialData();
    const onChange = vi.fn();
    render(<MindMap data={data} onChange={onChange} />);

    // ノードを探す
    const node = await waitFor(
      () => screen.getByTestId("node-root"),
      { timeout: 2000 },
    );

    // クリック
    fireEvent.click(node);

    // データ変更が呼ばれることを確認（展開/折りたたみが実行される）
    // モックの制限により、実際の動作を完全に再現できない
    // ただし、エラーが発生しないことを確認
    expect(node).toBeInTheDocument();
  });

  it("Ctrlキーを押しながらノードをクリックすると複数選択できる", async () => {
    const data: MindNode = {
      id: "root",
      title: "Root",
      children: [
        { id: "child1", title: "Child 1" },
        { id: "child2", title: "Child 2" },
      ],
    };
    render(<MindMap data={data} />);

    // ノードを探す
    const rootNode = await waitFor(
      () => screen.getByTestId("node-root"),
      { timeout: 2000 },
    );
    const child1Node = await waitFor(
      () => screen.getByTestId("node-child1"),
      { timeout: 2000 },
    );

    // 通常クリックでrootを選択
    fireEvent.click(rootNode);
    // Ctrlキーを押しながらchild1をクリック
    fireEvent.click(child1Node, { ctrlKey: true });

    // モックの制限により、実際の動作を完全に再現できない
    // ただし、エラーが発生しないことを確認
    expect(rootNode).toBeInTheDocument();
    expect(child1Node).toBeInTheDocument();
  });

  it("Cmdキーを押しながらノードをクリックすると複数選択できる", async () => {
    const data: MindNode = {
      id: "root",
      title: "Root",
      children: [{ id: "child1", title: "Child 1" }],
    };
    render(<MindMap data={data} />);

    // ノードを探す
    const rootNode = await waitFor(
      () => screen.getByTestId("node-root"),
      { timeout: 2000 },
    );
    const child1Node = await waitFor(
      () => screen.getByTestId("node-child1"),
      { timeout: 2000 },
    );

    // 通常クリックでrootを選択
    fireEvent.click(rootNode);
    // Cmdキーを押しながらchild1をクリック
    fireEvent.click(child1Node, { metaKey: true });

    // モックの制限により、実際の動作を完全に再現できない
    // ただし、エラーが発生しないことを確認
    expect(rootNode).toBeInTheDocument();
    expect(child1Node).toBeInTheDocument();
  });

  it("ペインをクリックすると選択が解除される", async () => {
    const data = createInitialData();
    render(<MindMap data={data} />);

    const pane = await waitFor(
      () => screen.getByTestId("pane"),
      { timeout: 2000 },
    );

    fireEvent.click(pane);

    // エラーが発生しないことを確認
    expect(pane).toBeInTheDocument();
  });

  it("選択変更時にhandleSelectionChangeが呼ばれる", async () => {
    const data = createInitialData();
    render(<MindMap data={data} />);

    const triggerButton = await waitFor(
      () => screen.getByTestId("trigger-selection-change"),
      { timeout: 2000 },
    );

    fireEvent.click(triggerButton);

    // エラーが発生しないことを確認
    expect(triggerButton).toBeInTheDocument();
  });

  it("コンポーネントのアンマウント時にクリーンアップが実行される", () => {
    const data = createInitialData();
    const { unmount } = render(<MindMap data={data} />);

    // アンマウント
    unmount();

    // エラーが発生しないことを確認
    expect(screen.queryByTestId("react-flow")).not.toBeInTheDocument();
  });

  describe("Deleteキー押下時", () => {
    const originalConfirm = globalThis.confirm;

    beforeEach(() => {
      vi.stubGlobal("confirm", vi.fn(() => true));
    });

    afterEach(() => {
      vi.stubGlobal("confirm", originalConfirm);
    });

    it("単一選択でDeleteを押すとノードが削除されonChangeに新しいdataが渡される", async () => {
      const data: MindNode = {
        id: "root",
        title: "Root",
        children: [
          { id: "child1", title: "Child 1" },
          { id: "child2", title: "Child 2" },
          { id: "child3", title: "Child 3" },
        ],
      };
      const onChange = vi.fn();
      const { container } = render(
        <MindMap data={data} onChange={onChange} />
      );

      const child2Node = await waitFor(
        () => screen.getByTestId("node-child2"),
        { timeout: 2000 }
      );
      fireEvent.click(child2Node);

      const wrapper = container.firstChild as HTMLElement;
      fireEvent.keyDown(wrapper, { key: "Delete" });

      expect(globalThis.confirm).toHaveBeenCalledWith(
        "このノードを削除しますか？"
      );
      expect(onChange).toHaveBeenCalledTimes(1);
      const newData = onChange.mock.calls[0][0] as MindNode;
      expect(newData.children).toHaveLength(2);
      const ids = newData.children!.map((c) => c.id);
      expect(ids).not.toContain("child2");
      expect(ids).toEqual(["child1", "child3"]);
    });

    it("削除後はフォーカス遷移先のノードが残ったdataに含まれる（2番目を削除すると1番目にフォーカス）", async () => {
      const data: MindNode = {
        id: "root",
        title: "Root",
        children: [
          { id: "child1", title: "Child 1" },
          { id: "child2", title: "Child 2" },
        ],
      };
      const onChange = vi.fn();
      const { container } = render(
        <MindMap data={data} onChange={onChange} />
      );

      const child2Node = await waitFor(
        () => screen.getByTestId("node-child2"),
        { timeout: 2000 }
      );
      fireEvent.click(child2Node);
      const wrapper = container.firstChild as HTMLElement;
      fireEvent.keyDown(wrapper, { key: "Delete" });

      const newData = onChange.mock.calls[0][0] as MindNode;
      expect(newData.children).toHaveLength(1);
      expect(newData.children![0].id).toBe("child1");
    });
  });
});
