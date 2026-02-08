import { describe, it, expect } from "vitest";
import { serializeMindNodeToMarkdown } from "./serialize";
import type { MindNode } from "@/types/mind-node";

describe("serializeMindNodeToMarkdown", () => {
  it("ルートのみのとき # タイトル 1行を返す", () => {
    const node: MindNode = { id: "root", title: "ルート", children: [] };
    expect(serializeMindNodeToMarkdown(node)).toBe("# ルート");
  });

  it("子が1つのとき # と ## の2行を返す", () => {
    const node: MindNode = {
      id: "root",
      title: "R",
      children: [{ id: "1", title: "A", children: [] }],
    };
    expect(serializeMindNodeToMarkdown(node)).toBe("# R\n## A");
  });

  it("多階層のとき見出しレベルで階層を表現する", () => {
    const node: MindNode = {
      id: "root",
      title: "Root",
      children: [
        {
          id: "1",
          title: "A",
          children: [
            { id: "1-1", title: "A1", children: [] },
            { id: "1-2", title: "A2", children: [] },
          ],
        },
        { id: "2", title: "B", children: [] },
      ],
    };
    const expected = `# Root
## A
### A1
### A2
## B`;
    expect(serializeMindNodeToMarkdown(node)).toBe(expected);
  });
});
