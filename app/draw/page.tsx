import { DrawPage } from "@/components/draw/draw-page";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Excalidraw Diagram Editor | Web Utils",
  description: "Create beautiful hand-drawn diagrams, wireframes, and flowcharts directly in your browser with our Excalidraw integration.",
  keywords: ["excalidraw", "online drawing", "diagram tool", "flowchart maker", "wireframe tool", "whiteboard"],
  alternates: { canonical: '/draw' },
};

export default function Page() {
    return <DrawPage />;
}
