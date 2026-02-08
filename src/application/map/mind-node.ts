/**
 * マインドマップノードのデータ構造（Application / UI 境界型）
 *
 * マインドマップの各ノードを表すデータ型です。
 * 階層構造を表現するため、childrenプロパティで子ノードを保持します。
 * React / UI に依存しない純粋な型定義。
 */
export type MindNode = {
  /** ノードの一意なID */
  id: string;
  /** ノードのタイトル（表示テキスト） */
  title: string;
  /** 子ノードの配列（オプション） */
  children?: MindNode[];
  /** 折りたたみ状態（trueの場合は折りたたまれている） */
  collapsed?: boolean;
  /** ノード種別（タスク等の拡張用） */
  type?: "default" | "task";
  /** 期限・優先度・URL 等のメタデータ（拡張用） */
  metadata?: Record<string, unknown>;
};
