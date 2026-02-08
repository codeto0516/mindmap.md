import { describe, it, expect, vi } from "vitest";
import { saveMapContent } from "./save-map-content";
import type { MapContentRepository } from "@/domain/model/map/map-content-repository";

describe("saveMapContent", () => {
  it("MindNode を MapAggregate に変換して saveContent を呼ぶ", async () => {
    const saveContentMock = vi.fn().mockResolvedValue(undefined);
    const mapContentRepository: MapContentRepository = {
      getContent: vi.fn(),
      saveContent: saveContentMock,
    };

    const mindNode = {
      id: "root",
      title: "ルート",
      children: [{ id: "child-1", title: "子1", children: [] }],
    };

    await saveMapContent("map-1", mindNode, mapContentRepository);

    expect(saveContentMock).toHaveBeenCalledTimes(1);
    const [aggregate] = saveContentMock.mock.calls[0];
    expect(aggregate.mapId).toBe("map-1");
    expect(aggregate.nodes).toHaveLength(2);
    const root = aggregate.nodes.find(
      (n: { parentId: string | null }) => n.parentId === null,
    );
    const child = aggregate.nodes.find(
      (n: { parentId: string | null }) => n.parentId === "root",
    );
    expect(root).toBeDefined();
    expect(root.text).toBe("ルート");
    expect(root.type).toBe("root");
    expect(child).toBeDefined();
    expect(child.text).toBe("子1");
    expect(child.type).toBe("default");
  });

  it("空の children でも saveContent が呼ばれる", async () => {
    const saveContentMock = vi.fn().mockResolvedValue(undefined);
    const mapContentRepository: MapContentRepository = {
      getContent: vi.fn(),
      saveContent: saveContentMock,
    };

    await saveMapContent(
      "map-2",
      { id: "root", title: "無題" },
      mapContentRepository,
    );

    expect(saveContentMock).toHaveBeenCalledTimes(1);
    const [aggregate] = saveContentMock.mock.calls[0];
    expect(aggregate.nodes).toHaveLength(1);
    expect(aggregate.nodes[0].parentId).toBeNull();
    expect(aggregate.nodes[0].text).toBe("無題");
  });
});
