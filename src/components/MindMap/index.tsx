"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Node,
  SelectionMode,
  NodeChange,
  useReactFlow,
} from "@xyflow/react";
import type { NodeTypes } from "@xyflow/react";
import type { MindNode } from "@/types/mind-node";
import { MindMapNode, NodeData } from "@/utils/types";
import { DEFAULTS } from "@/utils/constants";
import { useMindMapState } from "@/hooks/useMindMapState";
import { useDagreLayout } from "@/hooks/useDagreLayout";
import { useNodeOperations } from "@/hooks/useNodeOperations";
import { Node as NodeComponent } from "@/components/Node";
import { getNearestNodeInDirectionByHierarchy } from "@/utils/hierarchyNavigation";
import { getFocusTargetAfterDelete } from "@/utils/nodeHelpers";

/**
 * ノードタイプの定義
 */
const nodeTypes: NodeTypes = {
  mindNode: NodeComponent,
};

/**
 * MindMapコンポーネントのProps
 */
interface MindMapProps {
  /** 初期データ */
  data: MindNode;
  /** データ変更時のコールバック */
  onChange?: (data: MindNode) => void;
}

/** フォーカスノードをビューポート中央に寄せるための ref API */
export interface CenterOnFocusedNodeRef {
  centerOnNode: (nodeId: string | null) => void;
}

const CENTER_ON_NODE_MAX_RETRIES = 30;
const DEFAULT_NODE_HEIGHT = 36;
/** フォーカスノードを中央に寄せるときのズーム上限（これ以上ズームインしない） */
const CENTER_ZOOM_MAX = 0.9;

/**
 * ReactFlow の子として useReactFlow を使い、ref で centerOnNode を公開するコンポーネント。
 * フォーカスノードをビューポート中央に保つために使用する。
 */
const CenterOnFocusedNode = forwardRef<CenterOnFocusedNodeRef>(
  function CenterOnFocusedNode(_, ref) {
    const { getNode, setCenter, getZoom } = useReactFlow();
    const pendingNodeIdRef = useRef<string | null>(null);
    const retryCountRef = useRef(0);

    useImperativeHandle(
      ref,
      () => ({
        centerOnNode(nodeId: string | null) {
          if (!nodeId) return;
          if (nodeId !== pendingNodeIdRef.current) {
            pendingNodeIdRef.current = nodeId;
            retryCountRef.current = 0;
          }
          const node = getNode(nodeId);
          if (!node) {
            if (retryCountRef.current < CENTER_ON_NODE_MAX_RETRIES) {
              retryCountRef.current += 1;
              requestAnimationFrame(() => {
                if (ref && typeof ref !== "function") {
                  ref.current?.centerOnNode(pendingNodeIdRef.current ?? null);
                }
              });
            }
            return;
          }
          pendingNodeIdRef.current = null;
          retryCountRef.current = 0;
          const w =
            node.width ??
            (node.measured?.width ?? undefined) ??
            DEFAULTS.NODE_WIDTH;
          const h =
            node.height ??
            (node.measured?.height ?? undefined) ??
            DEFAULT_NODE_HEIGHT;
          const x = node.position.x + Number(w) / 2;
          const y = node.position.y + Number(h) / 2;
          const zoom = Math.min(getZoom(), CENTER_ZOOM_MAX);
          setCenter(x, y, { duration: 200, zoom });
        },
      }),
      // eslint-disable-next-line react-hooks/exhaustive-deps -- ref を依存に含めると useImperativeHandle が毎回実行されうるため意図的に除外
      [getNode, setCenter, getZoom],
    );
    return null;
  },
);

/**
 * マインドマップのメインコンポーネント
 *
 * React Flowを使用してマインドマップを表示します。
 * ノードの追加・削除・編集、ズーム・パン（二本指のみ）などの機能を提供します。
 *
 * @param props - MindMapコンポーネントのProps
 * @param props.initialData - 初期データ
 * @param props.onDataChange - データ変更時のコールバック
 * @returns マインドマップを表示するコンポーネント
 */
export default function MindMap({
  data: initialData,
  onChange: onDataChange,
}: MindMapProps) {
  // 状態管理
  const { data, setData, selectedNodeIds, setSelectedNodeIds, selectedNodeId } =
    useMindMapState(initialData);
  // 編集状態管理（文字キーで編集開始したとき、その文字で既存タイトルを上書きするために保持）
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [initialEditKey, setInitialEditKey] = useState<string | null>(null);
  // ノードの高さを追跡
  const [nodeHeights, setNodeHeights] = useState<Record<string, number>>({});
  // ノードの幅を追跡
  const [nodeWidths, setNodeWidths] = useState<Record<string, number>>({});
  // selectedNodeIdsの最新値を保持（無限ループを防ぐため）
  const selectedNodeIdsRef = useRef<string[]>(selectedNodeIds);
  // Tab/Enterで子・兄弟追加直後のキー入力で編集モードに入るため、選択中ノードIDの最新値を同期的に参照する
  const selectedNodeIdRef = useRef<string | null>(selectedNodeId);
  // Enter/Tabでノード追加後に選択を変えた直後、React Flow が古い選択で発火して上書きするのを防ぐ（期待する選択が来るまで無視）
  const programmaticSelectionRef = useRef<string[] | null>(null);
  // 連打時に「最後に追加したノード」だけにフォーカスするため、予約フォーカス用の ref とタイマー
  const pendingFocusNodeIdRef = useRef<string | null>(null);
  const focusTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const focusRetryCountRef = useRef(0);
  const maxFocusRetries = 30; // 約500ms（requestAnimationFrame でリトライ）
  // Enter/Tab でノード追加した直後の連打を防ぐクールダウン用
  const lastAddNodeAtRef = useRef(0);
  const ADD_NODE_COOLDOWN_MS = 120;
  // フォーカスノードをビューポート中央に寄せる（ReactFlow の子から setCenter を呼ぶための ref）
  const centerOnNodeRef = useRef<CenterOnFocusedNodeRef>(null);

  useEffect(() => {
    selectedNodeIdsRef.current = selectedNodeIds;
    selectedNodeIdRef.current = selectedNodeIds[0] ?? null;
  }, [selectedNodeIds, selectedNodeId]);

  useEffect(() => {
    return () => {
      if (focusTimeoutRef.current) {
        clearTimeout(focusTimeoutRef.current);
        focusTimeoutRef.current = null;
      }
    };
  }, []);

  // 子ノードグループの中心に親が来るレイアウトでnodesとedgesを計算（高さ・幅を考慮し、親リサイズ時も子がかぶらない）
  const { nodes: layoutNodes, edges: layoutEdges } = useDagreLayout(
    data,
    nodeHeights,
    nodeWidths,
  );

  // データ変更時のコールバック（重複を削減）
  const handleDataChange = useCallback(
    (newData: MindNode) => {
      setData(newData);
      onDataChange?.(newData);
    },
    [setData, onDataChange],
  );

  // ノード操作フック
  const nodeOperations = useNodeOperations({
    data,
    onDataChange: handleDataChange,
  });

  // ノードの高さが変わったときのハンドラー
  const handleNodeHeightChange = useCallback(
    (nodeId: string, height: number) => {
      setNodeHeights((prev) => ({
        ...prev,
        [nodeId]: height,
      }));
    },
    [],
  );

  // ノードの幅が変わったときのハンドラー（リサイズ時に子ノードの位置を再計算してかぶりを防ぐ）
  const handleNodeWidthChange = useCallback((nodeId: string, width: number) => {
    setNodeWidths((prev) => ({
      ...prev,
      [nodeId]: width,
    }));
  }, []);

  // 編集終了時に編集状態と「押した文字で上書き」用の初期キーをクリア
  const endEdit = useCallback(() => {
    setEditingNodeId(null);
    setInitialEditKey(null);
  }, []);

  // 矢印キーで「押した方向に最も近いノード」へ移動するための位置・サイズ一覧
  const nodesWithLayout = useMemo(
    () =>
      layoutNodes.map((node) => ({
        id: node.id,
        position: node.position,
        width: nodeWidths[node.id] ?? DEFAULTS.NODE_WIDTH,
        height: nodeHeights[node.id] ?? 36,
      })),
    [layoutNodes, nodeWidths, nodeHeights],
  );

  // 追加したノードのカードへフォーカス。連打時は直前のタイマーをキャンセルし、常に「最後に追加したノード」にだけフォーカスする。
  // 連打で DOM がまだ描画されていない場合は requestAnimationFrame でリトライする。
  const focusNodeCard = useCallback((nodeId: string) => {
    pendingFocusNodeIdRef.current = nodeId;
    focusRetryCountRef.current = 0;
    if (focusTimeoutRef.current) {
      clearTimeout(focusTimeoutRef.current);
      focusTimeoutRef.current = null;
    }
    const tryFocus = () => {
      const id = pendingFocusNodeIdRef.current;
      if (!id) return;
      const el = document.querySelector<HTMLElement>(
        `[data-node-id="${id}"]`,
      );
      if (el) {
        el.focus();
        return;
      }
      focusRetryCountRef.current += 1;
      if (focusRetryCountRef.current < maxFocusRetries) {
        requestAnimationFrame(tryFocus);
      }
    };
    focusTimeoutRef.current = setTimeout(() => {
      focusTimeoutRef.current = null;
      requestAnimationFrame(() => {
        requestAnimationFrame(tryFocus);
      });
    }, 0);
  }, []);

  // Enterで兄弟ノード追加後に追加したノードを選択（キー入力で編集モードに入る）
  const addSiblingNodeAndSelect = useCallback(
    (nodeId: string, title?: string) => {
      const newId = nodeOperations.addSiblingNode(nodeId, title);
      if (newId) {
        const nextSelection = [newId];
        setSelectedNodeIds(nextSelection);
        selectedNodeIdRef.current = newId;
        programmaticSelectionRef.current = nextSelection;
        focusNodeCard(newId);
        // 新規ノードは store 反映が 1 ティック遅れるため rAF で中央寄せ
        requestAnimationFrame(() => {
          centerOnNodeRef.current?.centerOnNode(newId);
        });
      }
    },
    [nodeOperations, setSelectedNodeIds, focusNodeCard],
  );

  // Tabで子ノード追加後に追加したノードを選択（キー入力で編集モードに入る）
  const addChildNodeAndSelect = useCallback(
    (nodeId: string, title?: string) => {
      const newId = nodeOperations.addChildNode(nodeId, title);
      if (newId) {
        const nextSelection = [newId];
        setSelectedNodeIds(nextSelection);
        selectedNodeIdRef.current = newId;
        programmaticSelectionRef.current = nextSelection;
        focusNodeCard(newId);
        // 新規ノードは store 反映が 1 ティック遅れるため rAF で中央寄せ
        requestAnimationFrame(() => {
          centerOnNodeRef.current?.centerOnNode(newId);
        });
      }
    },
    [nodeOperations, setSelectedNodeIds, focusNodeCard],
  );

  // キーボードショートカットハンドラ（ペインとノードカードの onKeyDown で使用）
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      // 編集中の場合は、EnterとEscapeはノード内で処理されるため、ここでは無視
      if (editingNodeId) {
        // 編集中は他のショートカットも無効化
        return;
      }

      // input/textarea にフォーカスがあるときは Enter/Tab をグローバルで処理しない（編集保存など要素側に任せる）
      if (
        (e.key === "Enter" || e.key === "Tab") &&
        (e.target instanceof HTMLInputElement ||
          e.target instanceof HTMLTextAreaElement)
      ) {
        return;
      }

      const effectiveSelectedNodeId =
        selectedNodeIdRef.current ?? selectedNodeId;

      if (selectedNodeIds.length === 0 && !effectiveSelectedNodeId) return;

      // 矢印キー: 階層ルールで移動（上下=同階層のみ、左右=一階層上/下で近いノード）
      if (
        selectedNodeIds.length === 1 &&
        selectedNodeId &&
        nodesWithLayout.length > 0 &&
        ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)
      ) {
        e.preventDefault();
        const nextId = getNearestNodeInDirectionByHierarchy(
          data,
          nodesWithLayout,
          selectedNodeId,
          e.key as "ArrowUp" | "ArrowDown" | "ArrowLeft" | "ArrowRight",
        );
        if (nextId) {
          setSelectedNodeIds([nextId]);
          // 矢印キーで選択変更したときは focusNodeCard でフォーカスを移す
          focusNodeCard(nextId);
          centerOnNodeRef.current?.centerOnNode(nextId);
        }
        return;
      }

      // Space: 編集モードを開始（単一選択時のみ、ページスクロールを防ぐ）
      if (
        e.key === " " &&
        !e.shiftKey &&
        !e.ctrlKey &&
        !e.metaKey &&
        (selectedNodeIds.length === 1 || selectedNodeIdRef.current) &&
        effectiveSelectedNodeId
      ) {
        e.preventDefault();
        setEditingNodeId(effectiveSelectedNodeId);
        setInitialEditKey(null);
        return;
      }

      // 文字キー: 単一選択時に編集モードを開始し、押した文字で既存タイトルを上書き
      if (
        (selectedNodeIds.length === 1 || selectedNodeIdRef.current) &&
        effectiveSelectedNodeId &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.altKey &&
        e.key.length === 1
      ) {
        e.preventDefault();
        setEditingNodeId(effectiveSelectedNodeId);
        setInitialEditKey(e.key);
        return;
      }

      // Enter: 同階層（兄弟ノード）追加。連打防止のためクールダウン中は無視
      if (
        e.key === "Enter" &&
        !e.shiftKey &&
        !e.ctrlKey &&
        !e.metaKey
      ) {
        const now = Date.now();
        if (now - lastAddNodeAtRef.current < ADD_NODE_COOLDOWN_MS) {
          e.preventDefault();
          return;
        }
        if (!effectiveSelectedNodeId) return;
        e.preventDefault();
        lastAddNodeAtRef.current = now;
        addSiblingNodeAndSelect(effectiveSelectedNodeId);
        return;
      }

      // Tab: 子ノード追加。連打防止のためクールダウン中は無視
      if (
        e.key === "Tab" &&
        !e.shiftKey &&
        !e.ctrlKey &&
        !e.metaKey
      ) {
        const now = Date.now();
        if (now - lastAddNodeAtRef.current < ADD_NODE_COOLDOWN_MS) {
          e.preventDefault();
          return;
        }
        if (!effectiveSelectedNodeId) return;
        e.preventDefault();
        lastAddNodeAtRef.current = now;
        addChildNodeAndSelect(effectiveSelectedNodeId);
        return;
      }

      // Delete/Backspace: ノード削除（複数選択時は一括削除）
      if (
        (e.key === "Delete" || e.key === "Backspace") &&
        !e.shiftKey &&
        !e.ctrlKey &&
        !e.metaKey
      ) {
        e.preventDefault();
        if (selectedNodeIds.length > 1) {
          // 複数選択時は一括削除
          if (confirm(`${selectedNodeIds.length}個のノードを削除しますか？`)) {
            nodeOperations.deleteNodes(selectedNodeIds);
          }
        } else if (selectedNodeId) {
          // 削除前にフォーカス遷移先を現在のツリーから算出（タイミングずれで2つ前へ飛ぶのを防ぐ）
          const nextFocusId = getFocusTargetAfterDelete(data, selectedNodeId);
          if (confirm("このノードを削除しますか？")) {
            nodeOperations.deleteNode(selectedNodeId);
            setSelectedNodeIds(nextFocusId ? [nextFocusId] : []);
            programmaticSelectionRef.current = nextFocusId
              ? [nextFocusId]
              : null;
            selectedNodeIdRef.current = nextFocusId;
            if (nextFocusId) {
              focusNodeCard(nextFocusId);
              centerOnNodeRef.current?.centerOnNode(nextFocusId);
            }
          }
        }
        return;
      }

      // Escape: 選択解除
      if (e.key === "Escape") {
        programmaticSelectionRef.current = null;
        setSelectedNodeIds([]);
        endEdit();
      }
    },
    [
      data,
      editingNodeId,
      selectedNodeIds,
      selectedNodeId,
      nodesWithLayout,
      selectedNodeIdRef,
      addSiblingNodeAndSelect,
      addChildNodeAndSelect,
      nodeOperations,
      focusNodeCard,
      setSelectedNodeIds,
      endEdit,
    ],
  );

  // 編集機能を追加したノードデータを作成する関数
  const enrichNodeData = useCallback(
    (node: MindMapNode, isEditing: boolean): MindMapNode => ({
      ...node,
      data: {
        mindNode: node.data.mindNode,
        isRoot: node.data.isRoot ?? (node.id === data.id),
        isEditing,
        initialEditKey:
          isEditing && node.id === editingNodeId && initialEditKey != null
            ? initialEditKey
            : undefined,
        layout: {
          currentWidth: nodeWidths[node.id] ?? DEFAULTS.NODE_WIDTH,
          onWidthConfirm: (width: number) =>
            handleNodeWidthChange(node.id, width),
          onNodeHeightChange: handleNodeHeightChange,
        },
        actions: {
          onStartEdit: (nodeId: string) => {
            setEditingNodeId(nodeId);
            setInitialEditKey(null);
          },
          onEndEdit: endEdit,
          onUpdateTitle: nodeOperations.updateNodeTitle,
          onToggleNode: nodeOperations.toggleNode,
          onKeyDown: handleKeyDown, // ノードカードの onKeyDown に渡す
        },
      } as NodeData,
    }),
    [
      data.id,
      nodeOperations.updateNodeTitle,
      nodeOperations.toggleNode,
      handleNodeHeightChange,
      nodeWidths,
      handleNodeWidthChange,
      endEdit,
      editingNodeId,
      initialEditKey,
      handleKeyDown,
    ],
  );

  // レイアウトと選択状態から nodes/edges を導出（useEffect 不要）
  const nodes = useMemo(
    () =>
      layoutNodes.map((node) => ({
        ...enrichNodeData(node, editingNodeId === node.id),
        selected: selectedNodeIds.includes(node.id),
        // React Flowがノードのサイズを正しく認識するために明示的に設定
        height: nodeHeights[node.id] ?? 36,
        width: nodeWidths[node.id] ?? DEFAULTS.NODE_WIDTH,
      })),
    [layoutNodes, selectedNodeIds, editingNodeId, enrichNodeData, nodeHeights, nodeWidths],
  );
  const edges = useMemo(() => layoutEdges, [layoutEdges]);

  // React Flow の変更を適用し、選択状態のみ selectedNodeIds に反映
  // applyNodeChangesを使わず、changesから直接選択状態を計算することで
  // nodesへの依存を排除し、リサイズ時の不整合を防ぐ
  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      // 選択変更のみをフィルタ
      const selectChanges = changes.filter(
        (c): c is { type: "select"; id: string; selected: boolean } =>
          c.type === "select",
      );

      if (selectChanges.length === 0) return;

      // プログラム的な選択変更をチェック
      const expected = programmaticSelectionRef.current;
      if (expected !== null) {
        // プログラム的な選択変更は無視
        programmaticSelectionRef.current = null;
        return;
      }

      // 現在の選択状態から新しい選択状態を計算
      const newSelectedIds = new Set(selectedNodeIdsRef.current);
      for (const change of selectChanges) {
        if (change.selected) {
          newSelectedIds.add(change.id);
        } else {
          newSelectedIds.delete(change.id);
        }
      }

      // 変更があれば更新
      const currentSet = new Set(selectedNodeIdsRef.current);
      if (
        newSelectedIds.size !== currentSet.size ||
        [...newSelectedIds].some((id) => !currentSet.has(id))
      ) {
        const newIds = [...newSelectedIds];
        setSelectedNodeIds(newIds);
        centerOnNodeRef.current?.centerOnNode(newIds[0] ?? null);
      }
    },
    [setSelectedNodeIds],
  );
  // edges は layout から導出しているため、React Flow の edge 変更は無視
  const onEdgesChange = useCallback(() => { }, []);

  // ノードクリック時のハンドラー
  const handleNodeClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      programmaticSelectionRef.current = null;
      const mindNode = nodeOperations.findNode(node.id);
      if (mindNode) {
        // Ctrl/Cmdキー押下時は複数選択
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          // 既に選択されている場合は選択解除、されていない場合は追加
          const nextIds = selectedNodeIds.includes(node.id)
            ? selectedNodeIds.filter((id) => id !== node.id)
            : [...selectedNodeIds, node.id];
          setSelectedNodeIds(nextIds);
          centerOnNodeRef.current?.centerOnNode(nextIds[0] ?? null);
        } else {
          // 通常クリック時は単一選択のみ（展開/折りたたみはマイナスボタンで実行）
          setSelectedNodeIds([node.id]);
          // クリックされたカードにフォーカスを移す
          const cardElement = (event.target as HTMLElement).closest(
            '[data-node-id]',
          ) as HTMLElement | null;
          if (cardElement) {
            cardElement.focus();
          }
          centerOnNodeRef.current?.centerOnNode(node.id);
        }
      }
    },
    [nodeOperations, selectedNodeIds, setSelectedNodeIds],
  );

  // ノードダブルクリック時のハンドラー
  const handleNodeDoubleClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      // イベントの伝播とデフォルト動作を停止
      event.preventDefault();
      event.stopPropagation();
      programmaticSelectionRef.current = null;
      // 選択状態を更新（展開/折りたたみは実行しない）
      setSelectedNodeIds([node.id]);
      centerOnNodeRef.current?.centerOnNode(node.id);
      // 編集モードを開始（既存タイトルはそのまま）
      setEditingNodeId(node.id);
      setInitialEditKey(null);
    },
    [setSelectedNodeIds],
  );

  // 選択変更時のハンドラー
  const handleSelectionChange = useCallback(
    (params: { nodes: Node[] }) => {
      const selectedIds = params.nodes.map((node) => node.id);
      const expected = programmaticSelectionRef.current;
      if (expected !== null) {
        const same =
          selectedIds.length === expected.length &&
          selectedIds.every((id, i) => id === expected[i]);
        if (!same) return;
        programmaticSelectionRef.current = null;
      }
      const currentIdsSet = new Set(selectedNodeIdsRef.current);
      const newIdsSet = new Set(selectedIds);
      const hasChanged =
        currentIdsSet.size !== newIdsSet.size ||
        !Array.from(currentIdsSet).every((id) => newIdsSet.has(id));
      if (hasChanged) {
        setSelectedNodeIds(selectedIds);
        centerOnNodeRef.current?.centerOnNode(selectedIds[0] ?? null);
      }
    },
    [setSelectedNodeIds],
  );

  return (
    <ReactFlowProvider>
      <div
        className="w-full h-full bg-zinc-50 dark:bg-zinc-900 relative"
        tabIndex={-1}
        onKeyDown={handleKeyDown}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={handleNodeClick}
          onNodeDoubleClick={handleNodeDoubleClick}
          onPaneClick={() => {
            programmaticSelectionRef.current = null;
            setSelectedNodeIds([]);
            endEdit();
          }}
          onSelectionChange={handleSelectionChange}
          selectionOnDrag={true}
          selectionMode={SelectionMode.Partial}
          nodeTypes={nodeTypes}
          fitView
          nodesDraggable={false}
          nodesConnectable={false}
          panOnDrag={false}
          panOnScroll={true}
          zoomOnDoubleClick={false}
          proOptions={{ hideAttribution: true }}
          defaultEdgeOptions={{
            type: "smoothstep",
            animated: false,
            style: { stroke: "rgb(161 161 170)", strokeWidth: 2 },
          }}
        >
          <Background />
          <CenterOnFocusedNode ref={centerOnNodeRef} />
        </ReactFlow>
      </div>
    </ReactFlowProvider>
  );
}
