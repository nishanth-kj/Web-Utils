"use client";

import { FloatingAd } from "@/components/floating-ad";
import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { Footer } from "@/components/landing/footer";

export default function Home() {
  return (
    <div className="h-full overflow-y-auto scrollbar-none scroll-smooth">
      <Hero />
      <Features />
      <Footer />
      <FloatingAd />
    </div>
  );
}
