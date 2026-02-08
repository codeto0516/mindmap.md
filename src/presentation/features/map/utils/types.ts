import { Node, Edge } from "@xyflow/react";
import type { MindNode } from "@/application/map/mind-node";

/**
 * React Flow用のノードデータ型
 *
 * MindNodeデータを含むReact FlowのNode型です。
 */
export type MindMapNode = Node<{
  /** マインドマップノードデータ */
  mindNode: MindNode;
  /** ルートノードかどうか（レイアウト由来。ルートのとき LeftHandle を表示しない） */
  isRoot?: boolean;
}>;

/**
 * React Flow用のエッジデータ型
 */
export type MindMapEdge = Edge;

/**
 * ノードのレイアウト関連データ
 */
export interface NodeLayoutData {
  /** 現在のノード幅 */
  currentWidth?: number;
  /** 幅確定時のコールバック */
  onWidthConfirm?: (width: number) => void;
  /** 高さ変更時のコールバック */
  onNodeHeightChange?: (nodeId: string, height: number) => void;
}

/**
 * ノードのアクション（操作）関連データ
 */
export interface NodeActionsData {
  /** 編集開始時のコールバック */
  onStartEdit?: (nodeId: string) => void;
  /** 編集終了時のコールバック */
  onEndEdit?: () => void;
  /** タイトル更新時のコールバック */
  onUpdateTitle?: (nodeId: string, title: string) => void;
  /** 展開/折りたたみ時のコールバック */
  onToggleNode?: (nodeId: string) => void;
  /** キーボードイベントハンドラ */
  onKeyDown?: (e: React.KeyboardEvent) => void;
}

/**
 * React Flow用のノードデータ型（MindMap が Node に渡す data）
 */
export interface NodeData extends Record<string, unknown> {
  /** マインドマップノードデータ */
  mindNode: MindNode;
  /** ルートノードかどうか（ルートの場合は左ハンドルを表示しない） */
  isRoot?: boolean;
  /** 編集中かどうか */
  isEditing?: boolean;
  /** 文字キーで編集開始したとき、その文字で既存タイトルを上書きする初期値 */
  initialEditKey?: string;
  /** レイアウト関連データ */
  layout?: NodeLayoutData;
  /** アクション（操作）関連データ */
  actions?: NodeActionsData;
}
