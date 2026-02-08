import { describe, it, expect } from "vitest";
import { createMockMapContentRepository } from "./MockMapContentRepository";
import type { MapId } from "@/domain/model/map/value-object/map-id";
import type { NodeId } from "@/domain/model/map/value-object/node-id";

describe("MockMapContentRepository", () => {
  it("getContent は常に null を返す", async () => {
    const repo = createMockMapContentRepository();
    const mapId = "map-1" as MapId;

    const result = await repo.getContent(mapId);

    expect(result).toBeNull();
  });

  it("saveContent は呼び出してもエラーにならない", async () => {
    const repo = createMockMapContentRepository();
    const aggregate = {
      mapId: "map-1" as MapId,
      nodes: [
        {
          id: "root" as NodeId,
          mapId: "map-1" as MapId,
          parentId: null,
          text: "ルート",
          position: { x: 0, y: 0 },
          order: 0,
          type: "root" as const,
        },
      ],
    };

    await expect(repo.saveContent(aggregate)).resolves.toBeUndefined();
  });

  it("saveContent 後に getContent しても null のまま（永続化しない）", async () => {
    const repo = createMockMapContentRepository();
    const mapId = "map-1" as MapId;
    await repo.saveContent({
      mapId,
      nodes: [],
    });

    const result = await repo.getContent(mapId);
    expect(result).toBeNull();
  });
});
