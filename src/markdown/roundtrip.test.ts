import { describe, it, expect } from "vitest";
import { parseMarkdownToMindNode } from "./parse";
import { serializeMindNodeToMarkdown } from "./serialize";

interface NodeLike {
  title: string;
  children?: NodeLike[];
}

describe("markdown roundtrip", () => {
  function assertSameStructure(a: NodeLike, b: NodeLike): void {
    expect(a.title).toBe(b.title);
    if (a.children || b.children) {
      expect(a.children?.length ?? 0).toBe(b.children?.length ?? 0);
      (a.children ?? []).forEach((ac, i) => {
        const bc = b.children![i];
        assertSameStructure(ac, bc);
      });
    }
  }

  it("ルートのみ: パース → シリアライズ → パース で構造が一致する", () => {
    const md = "# Only";
    const node = parseMarkdownToMindNode(md);
    const back = serializeMindNodeToMarkdown(node);
    const again = parseMarkdownToMindNode(back);
    assertSameStructure(node, again);
    expect(again.title).toBe("Only");
  });

  it("多階層: パース → シリアライズ → パース で構造が一致する", () => {
    const md = `# Root
## A
### A1
## B
`;
    const node = parseMarkdownToMindNode(md);
    const back = serializeMindNodeToMarkdown(node);
    const again = parseMarkdownToMindNode(back);
    assertSameStructure(node, again);
  });

  it("MindNode → シリアライズ → パース でタイトルと階層が復元される", () => {
    const node = parseMarkdownToMindNode("# X\n## Y\n### Z");
    const md = serializeMindNodeToMarkdown(node);
    const back = parseMarkdownToMindNode(md);
    expect(back.title).toBe("X");
    expect(back.children![0].title).toBe("Y");
    expect(back.children![0].children![0].title).toBe("Z");
  });
});
