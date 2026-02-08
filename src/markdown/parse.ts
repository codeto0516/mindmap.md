import type { MindNode } from "@/types/mind-node";

const ROOT_ID = "root";
const HEADING_REGEX = /^(#+)\s+(.*)$/;

/**
 * マークダウン文字列を MindNode ツリーに変換する。
 * 見出しレベルで階層を表現する（# = ルート、## = 2階層目、### = 3階層目…）。
 * 空行は無視する。先頭の # 1個をルートとし、以降 ## 以下を子孫とする。
 * 有効な見出しが無い場合はルートのみのデフォルト MindNode を返す。
 */
export function parseMarkdownToMindNode(content: string): MindNode {
  const lines = content.split(/\r?\n/);
  const headings: { level: number; title: string }[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed === "") continue;
    const match = trimmed.match(HEADING_REGEX);
    if (match) {
      const level = match[1].length;
      const title = match[2].trim();
      headings.push({ level, title });
    }
  }

  if (headings.length === 0) {
    return { id: ROOT_ID, title: "無題", children: [] };
  }

  let idCounter = 0;
  function nextId(): string {
    idCounter += 1;
    return `node-${idCounter}`;
  }

  const root = headings[0];
  if (root.level !== 1) {
    return { id: ROOT_ID, title: "無題", children: [] };
  }

  const stack: { node: MindNode; level: number }[] = [];
  const rootNode: MindNode = {
    id: ROOT_ID,
    title: root.title,
    children: [],
  };
  stack.push({ node: rootNode, level: 1 });

  for (let i = 1; i < headings.length; i++) {
    const { level, title } = headings[i];
    const childNode: MindNode = { id: nextId(), title, children: [] };

    while (stack.length > 1 && stack[stack.length - 1].level >= level) {
      stack.pop();
    }
    const parent = stack[stack.length - 1].node;
    if (!parent.children) parent.children = [];
    parent.children.push(childNode);
    stack.push({ node: childNode, level });
  }

  if (rootNode.children?.length === 0) rootNode.children = undefined;
  return rootNode;
}
