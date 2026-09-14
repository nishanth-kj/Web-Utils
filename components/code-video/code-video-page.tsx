"use client";

import { JetBrains_Mono } from "next/font/google";
import { CodeVideoContainer } from "./code-video-container";

// Loaded here (not the root layout) so its ~40KB woff2 only ships to this
// route — every other page keeps using Geist Mono.
const jetbrainsMono = JetBrains_Mono({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
    display: "swap",
});

export function CodeVideoPage() {
    return <CodeVideoContainer fontClassName={jetbrainsMono.className} />;
}
