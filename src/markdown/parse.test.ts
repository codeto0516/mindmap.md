import { describe, it, expect } from "vitest";
import { parseMarkdownToMindNode } from "./parse";

describe("parseMarkdownToMindNode", () => {
  it("空文字のときルートのみのデフォルト MindNode を返す", () => {
    const result = parseMarkdownToMindNode("");
    expect(result).toEqual({ id: "root", title: "無題", children: [] });
  });

  it("空行のみのときルートのみのデフォルト MindNode を返す", () => {
    const result = parseMarkdownToMindNode("\n\n  \n");
    expect(result).toEqual({ id: "root", title: "無題", children: [] });
  });

  it("見出しが無い行だけのときルートのみのデフォルト MindNode を返す", () => {
    const result = parseMarkdownToMindNode("hello\nworld");
    expect(result).toEqual({ id: "root", title: "無題", children: [] });
  });

  it("先頭が # でない見出しのときルートのみのデフォルト MindNode を返す", () => {
    const result = parseMarkdownToMindNode("## Sub");
    expect(result).toEqual({ id: "root", title: "無題", children: [] });
  });

  it("ルートのみ # タイトル のときそのタイトルのルートを返す", () => {
    const result = parseMarkdownToMindNode("# ルート");
    expect(result.id).toBe("root");
    expect(result.title).toBe("ルート");
    expect(result.children).toBeUndefined();
  });

  it("# と ## のときルートと子1つを返す", () => {
    const result = parseMarkdownToMindNode("# R\n## A");
    expect(result.id).toBe("root");
    expect(result.title).toBe("R");
    expect(result.children).toHaveLength(1);
    expect(result.children![0].title).toBe("A");
    expect(result.children![0].children ?? []).toHaveLength(0);
  });

  it("多階層のとき階層構造を再現する", () => {
    const md = `# Root
## A
### A1
### A2
## B
`;
    const result = parseMarkdownToMindNode(md);
    expect(result.title).toBe("Root");
    expect(result.children).toHaveLength(2);
    expect(result.children![0].title).toBe("A");
    expect(result.children![0].children).toHaveLength(2);
    expect(result.children![0].children![0].title).toBe("A1");
    expect(result.children![0].children![1].title).toBe("A2");
    expect(result.children![1].title).toBe("B");
  });

  it("見出しレベルが戻る場合（兄弟）を正しく扱う", () => {
    const md = `# R
## A
## B
`;
    const result = parseMarkdownToMindNode(md);
    expect(result.children).toHaveLength(2);
    expect(result.children![0].title).toBe("A");
    expect(result.children![1].title).toBe("B");
  });
});
