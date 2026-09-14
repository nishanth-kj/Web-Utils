import { TimePage } from "@/components/time";
import type { Metadata } from "next";
import { ToolPageShell } from "@/components/shared/tool-page-shell";

export const metadata: Metadata = {
  title: "Unix Epoch Time Converter",
  description: "Convert Unix timestamps to human-readable dates and vice-versa. A fast, free online time manipulation tool for developers.",
  keywords: ["epoch converter", "unix time", "timestamp converter", "date format", "developer time tool"],
  alternates: { canonical: '/time' },
};

export default function Page() {
    return <ToolPageShell toolSlot={<TimePage />} />;
}
