import { describe, it, expect, vi, beforeEach } from "vitest";
import type { MapId } from "@/domain/model/map/value-object/map-id";
import { DEFAULT_MAP_CONTENT_MIND_NODE } from "@/application/map/get-map-content";

const createMockMapContentRepository = vi.hoisted(() => vi.fn());

vi.mock("@/infrastructure/repositories/factory", () => ({
  createMapContentRepository: () => createMockMapContentRepository(),
}));

import { getMapContentForPage } from "./map";

describe("getMapContentForPage (composition)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("マップ内容が空のときデフォルトの MindNode を返す", async () => {
    createMockMapContentRepository.mockReturnValue({
      getContent: vi.fn().mockResolvedValue(null),
      saveContent: vi.fn(),
    });

    const result = await getMapContentForPage("ws-1", "map-1");

    expect(result).toEqual(DEFAULT_MAP_CONTENT_MIND_NODE);
  });

  it("マップ内容があるとき変換した MindNode を返す", async () => {
    const aggregate = {
      mapId: "map-1" as MapId,
      nodes: [
        {
          id: "root",
          mapId: "map-1" as MapId,
          parentId: null,
          text: "ルート",
          position: { x: 0, y: 0 },
          order: 0,
          type: "root" as const,
        },
      ],
    };
    createMockMapContentRepository.mockReturnValue({
      getContent: vi.fn().mockResolvedValue(aggregate),
      saveContent: vi.fn(),
    });

    const result = await getMapContentForPage("ws-1", "map-1");

    expect(result).toEqual({
      id: "root",
      title: "ルート",
      children: undefined,
    });
  });
});
