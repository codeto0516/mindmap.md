import type { MapContentRepository } from "@/domain/model/map/map-content-repository";
import type { MapId } from "@/domain/model/map/value-object/map-id";
import type { MindNode } from "@/application/map/mind-node";
import { mindNodeToMapAggregate } from "./map-content-converter";

/**
 * マップ内容を保存するユースケース。
 * MindNode（ツリー）を MapAggregate に変換して MapContentRepository.saveContent を呼ぶ。
 * RSC/Server Action では factory で mapContentRepository を生成して渡す。
 *
 * @param mapId マップ ID
 * @param mindNode 保存するノードツリー（シリアライズ可能な MindNode）
 * @param mapContentRepository MapContentRepository の実装
 */
export async function saveMapContentForPage(
  mapId: string,
  mindNode: MindNode,
  mapContentRepository: MapContentRepository,
): Promise<void> {
  const aggregate = mindNodeToMapAggregate(mapId as MapId, mindNode);
  await mapContentRepository.saveContent(aggregate);
}
