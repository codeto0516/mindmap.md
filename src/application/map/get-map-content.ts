import type { MapContentRepository } from "@/domain/model/map/map-content-repository";
import type { MapId } from "@/domain/model/map/value-object/map-id";
import type { MindNode } from "@/application/map/mind-node";
import { mapAggregateToMindNode } from "./map-content-converter";

/** ノード未保存マップ用のデフォルト MindNode（ルートのみ） */
export const DEFAULT_MAP_CONTENT_MIND_NODE: MindNode = {
  id: "root",
  title: "無題",
  children: [],
};

/**
 * マップ詳細ページで表示するマップ内容（ノードツリー）を取得する。
 * 内容がなければデフォルトのルートのみの MindNode を返す。
 *
 * @param _workspaceId 将来の権限チェック用（未使用）
 * @param mapId マップ ID（URL params の文字列）
 * @param repo MapContentRepository（Composition Root で生成して渡す）
 * @returns 表示用 MindNode（必ず 1 件返す）
 */
export async function getMapContent(
  _workspaceId: string,
  mapId: string,
  repo: MapContentRepository,
): Promise<MindNode> {
  const id = mapId as MapId;
  const aggregate = await repo.getContent(id);
  if (!aggregate) {
    return DEFAULT_MAP_CONTENT_MIND_NODE;
  }
  return mapAggregateToMindNode(aggregate);
}
