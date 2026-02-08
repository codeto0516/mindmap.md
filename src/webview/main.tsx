/**
 * VSCode 拡張の Webview 用エントリ。
 * 拡張から postMessage で受け取ったマークダウンをパースして MindMap に表示し、
 * 編集内容をシリアライズして拡張に送り返す。
 */
import { StrictMode, useEffect, useState, useCallback, useRef } from "react";
import { createRoot } from "react-dom/client";
import MindMap from "@/components/MindMap";
import type { MindNode } from "@/types/mind-node";
import { parseMarkdownToMindNode, serializeMindNodeToMarkdown } from "@/markdown";
import "@/main.css";

declare global {
  interface Window {
    acquireVsCodeApi?: () => { postMessage: (msg: unknown) => void };
  }
}

const defaultData: MindNode = {
  id: "root",
  title: "ルート",
  children: [],
};

const DEBOUNCE_MS = 400;

export function WebviewApp() {
  const [data, setData] = useState<MindNode>(defaultData);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const vscodeRef = useRef<ReturnType<NonNullable<typeof window.acquireVsCodeApi>> | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const api = typeof window.acquireVsCodeApi === "function" ? window.acquireVsCodeApi() : null;
    vscodeRef.current = api;

    const handler = (event: MessageEvent) => {
      const msg = event.data as { type: string; text?: string; theme?: "light" | "dark" };
      if (msg.type === "init") {
        if (typeof msg.text === "string") setData(parseMarkdownToMindNode(msg.text));
        if (msg.theme) setTheme(msg.theme);
      }
      if (msg.type === "theme" && msg.theme) setTheme(msg.theme);
    };
    window.addEventListener("message", handler);
    if (api) api.postMessage({ type: "ready" });
    return () => window.removeEventListener("message", handler);
  }, []);

  const handleChange = useCallback(
    (newData: MindNode) => {
      setData(newData);
      const api = vscodeRef.current;
      if (!api) return;
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        debounceRef.current = null;
        api.postMessage({
          type: "save",
          text: serializeMindNodeToMarkdown(newData),
        });
      }, DEBOUNCE_MS);
    },
    []
  );

  return (
    <div className={`h-screen w-screen ${theme === "dark" ? "dark" : ""}`}>
      <MindMap data={data} onChange={handleChange} />
    </div>
  );
}

const rootEl = document.getElementById("root");
if (!rootEl) throw new Error("Root element not found");

createRoot(rootEl).render(
  <StrictMode>
    <WebviewApp />
  </StrictMode>
);
