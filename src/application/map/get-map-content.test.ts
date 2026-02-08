import { describe, it, expect, vi } from "vitest";
import {
  getMapContent,
  DEFAULT_MAP_CONTENT_MIND_NODE,
} from "./get-map-content";
import type { MapContentRepository } from "@/domain/model/map/map-content-repository";
import type { MapId } from "@/domain/model/map/value-object/map-id";

describe("getMapContent", () => {
  it("getContent が null のときデフォルト MindNode を返す", async () => {
    const repo: MapContentRepository = {
      getContent: vi.fn().mockResolvedValue(null),
      saveContent: vi.fn(),
    };
    const result = await getMapContent("ws-1", "map-1", repo);
    expect(result).toEqual(DEFAULT_MAP_CONTENT_MIND_NODE);
    expect(repo.getContent).toHaveBeenCalledWith("map-1" as MapId);
  });

  it("getContent が MapAggregate を返すとき変換した MindNode を返す", async () => {
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
    const repo: MapContentRepository = {
      getContent: vi.fn().mockResolvedValue(aggregate),
      saveContent: vi.fn(),
    };
    const result = await getMapContent("ws-1", "map-1", repo);
    expect(result).toEqual({
      id: "root",
      title: "ルート",
      children: undefined,
    });
    expect(repo.getContent).toHaveBeenCalledWith("map-1" as MapId);
  });
});
