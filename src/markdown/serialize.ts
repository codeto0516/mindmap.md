import type { MindNode } from "@/types/mind-node";

/**
 * MindNode ツリーをマークダウン文字列に変換する。
 * 見出しレベルで階層を表現する（# = ルート、## = 2階層目、### = 3階層目…）。
 * collapsed / type / metadata は初版では出力しない。
 */
export function serializeMindNodeToMarkdown(node: MindNode): string {
  const lines: string[] = [];

  function visit(n: MindNode, depth: number): void {
    const prefix = "#".repeat(depth);
    const title = n.title || "";
    lines.push(`${prefix} ${title}`);
    if (n.children?.length) {
      for (const child of n.children) {
        visit(child, depth + 1);
      }
    }
  }

  visit(node, 1);
  return lines.join("\n");
}
