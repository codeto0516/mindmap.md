import { MapContentRepository } from "@/domain/model/map/map-content-repository";
import { MapRepository } from "@/domain/model/map/map-repository";
import {
  createMockMapContentRepository,
  createMockMapRepository,
} from "@/infrastructure/repositories/mock";

/**
 * 拡張機能ではDBを使わないため、常にメモリ上の Mock 実装を返す。
 */
export function createMapRepository(): MapRepository {
  return createMockMapRepository();
}

export function createMapContentRepository(): MapContentRepository {
  return createMockMapContentRepository();
}
