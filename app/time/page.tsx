import { TimePage } from "@/components/time";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Unix Epoch Time Converter | Web Utils",
  description: "Convert Unix timestamps to human-readable dates and vice-versa. A fast, free online time manipulation tool for developers.",
  keywords: ["epoch converter", "unix time", "timestamp converter", "date format", "developer time tool"],
  alternates: { canonical: '/time' },
};

export default function Page() {
    return <TimePage />;
}
