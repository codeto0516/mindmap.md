import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import MindMap from "@/components/MindMap";
import type { MindNode } from "@/types/mind-node";
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
    <div className="h-screen w-screen">
      <MindMap data={defaultData} />
    </div>
  </StrictMode>
);
