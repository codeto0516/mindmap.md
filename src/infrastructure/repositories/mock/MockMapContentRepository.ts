import type { MapContentRepository } from "@/domain/model/map/map-content-repository";
import type { MapId } from "@/domain/model/map/value-object/map-id";

/**
 * メモリに保存しない MapContentRepository のモック実装。
 * getContent は常に null、saveContent は no-op。
 * USE_MOCK_REPOSITORIES 時やテストで使用する。
 */
export function createMockMapContentRepository(): MapContentRepository {
  return {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- interface requires mapId
    async getContent(_mapId: MapId): Promise<null> {
      return null;
    },

    async saveContent(): Promise<void> {
      // no-op
    },
  };
}
