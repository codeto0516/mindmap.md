import { cache } from "react";
import type { MindNode } from "@/application/map/mind-node";
import { getMapContent as getMapContentUseCase } from "@/application/map/get-map-content";
import { getMap as getMapUseCase } from "@/application/map/get-map";
import { saveMapContent as saveMapContentUseCase } from "@/application/map/save-map-content";
import {
  createMapContentRepository,
  createMapRepository,
} from "@/infrastructure/repositories/factory";

/**
 * マップ詳細ページで表示するマップを 1 件取得する（Composition: リポジトリ注入済み）。
 */
export const getMapForPage = cache(
  async (workspaceId: string, mapId: string) => {
    return getMapUseCase(workspaceId, mapId, createMapRepository());
  },
);

/**
 * マップ詳細ページで表示するマップ内容（ノードツリー）を取得する（Composition: リポジトリ注入済み）。
 */
export const getMapContentForPage = cache(
  async (workspaceId: string, mapId: string) => {
    return getMapContentUseCase(
      workspaceId,
      mapId,
      createMapContentRepository(),
    );
  },
);

/**
 * マップ内容を保存する（Composition: リポジトリ注入済み）。
 */
export async function saveMapContentForPage(mapId: string, mindNode: MindNode) {
  return saveMapContentUseCase(mapId, mindNode, createMapContentRepository());
}
