/**
 * マップ内容の純粋なデータ構造（ドメイン非依存）。
 * UI 状態（zoom / viewport / selection 等）は含めない。
 *
 * 将来の RDB 移行:
 * - MapJSON.nodes の各要素は map_nodes テーブルの 1 行に 1:1 で展開する想定。
 * - 移行時: nodes を INSERT するか、既存 map_nodes とマージするバッチを用意する。
 * - RDB 移行後は Application/Domain 層のインターフェース（MapContentRepository 等）を
 *   維持し、実装だけ「JSON 読み書き」から「map_nodes クエリ」に差し替える。
 */

/** ノード種別。ルートは 1 マップに 1 つのみ想定。 */
export type MapNodeTypeJSON = "root" | "default" | "task";

/**
 * 1 ノード分の純粋データ。
 * 将来 map_nodes テーブルに 1 行として展開する前提のスキーマ。
 * - id → map_nodes.id (PK)
 * - parentId → map_nodes.parent_id (FK, nullable)
 * - text → map_nodes.text
 * - order → map_nodes.order
 * - type → map_nodes.type
 * - metadata → map_nodes.metadata (JSON カラム想定)
 */
export interface MapNodeJSON {
  id: string;
  parentId: string | null;
  text: string;
  order: number;
  type: MapNodeTypeJSON;
  /** 期限・優先度・URL 等のメタデータ（拡張用） */
  metadata?: Record<string, unknown>;
}

/**
 * マップ 1 件分のノード集合を表す JSON 構造。
 * - ノードはフラット配列。親子関係は parentId で表現（children ネストは禁止）。
 * - 並び順は order で表現。
 * - 後からノード単位で差分保存できる形（同一 nodeId で PATCH 想定）。
 */
export interface MapJSON {
  nodes: MapNodeJSON[];
}
