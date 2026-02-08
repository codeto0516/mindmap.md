import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryProvider } from "@/presentation/shared/providers/query-provider";
import MindMap from "@/presentation/features/map/components/MindMap";
import type { MindNode } from "@/application/map/mind-node";
import "./main.css";

const defaultData: MindNode = {
  id: "root",
  title: "ルート",
  children: [],
};

const root = document.getElementById("root");
if (!root) throw new Error("Root element not found");

createRoot(root).render(
  <StrictMode>
    <QueryProvider>
      <div className="h-screen w-screen">
        <MindMap data={defaultData} />
      </div>
    </QueryProvider>
  </StrictMode>
);
