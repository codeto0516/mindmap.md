import type { MapContentRepository } from "@/domain/model/map/map-content-repository";
import type { MapRepository } from "@/domain/model/map/map-repository";
import type { MindNode } from "@/application/map/mind-node";
import { getMapContent } from "./get-map-content";
import { getMap } from "./get-map";
import { saveMapContent } from "./save-map-content";

export type AddNodeAtRootResult =
  | { ok: true }
  | { ok: false; error: "map_not_found" };

/**
 * 指定マップのルート直下に 1 ノードを追加する（キャプチャ用）。
 * ワークスペース・マップへのアクセスを確認してから取得・追加・保存する。
 *
 * @param workspaceId ワークスペース ID
 * @param mapId マップ ID
 * @param title 追加するノードのタイトル
 * @param mapRepository MapRepository（Composition Root で生成して渡す）
 * @param mapContentRepository MapContentRepository（Composition Root で生成して渡す）
 * @returns 成功時は { ok: true }、マップが存在しない場合は { ok: false, error: 'map_not_found' }
 */
export async function addNodeAtRoot(
  workspaceId: string,
  mapId: string,
  title: string,
  mapRepository: MapRepository,
  mapContentRepository: MapContentRepository,
): Promise<AddNodeAtRootResult> {
  const map = await getMap(workspaceId, mapId, mapRepository);
  if (!map) {
    return { ok: false, error: "map_not_found" };
  }

  const current = await getMapContent(workspaceId, mapId, mapContentRepository);

  const newChild: MindNode = {
    id: crypto.randomUUID(),
    title: title.trim() || "無題",
  };

  const updatedMindNode: MindNode = {
    ...current,
    children: [...(current.children ?? []), newChild],
  };

  await saveMapContent(mapId, updatedMindNode, mapContentRepository);
  return { ok: true };
}
