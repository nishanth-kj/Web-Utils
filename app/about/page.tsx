import React from 'react';
import Footer from "@/components/common/Footer";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Web Utils",
  description: "Learn about the mission, features, and privacy-first architecture behind Web Utils.",
  keywords: ["about us", "mission", "web utils team", "developer tools history", "privacy first", "client side architecture"],
  openGraph: {
    title: "About Web Utils",
    description: "Learn about the mission, features, and privacy-first architecture behind Web Utils.",
    url: "https://webutils.site/about",
  },
  alternates: { canonical: "/about" }
};

export default function AboutPage() {
    return (
        <main className="h-full overflow-auto bg-background custom-scrollbar flex flex-col">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "AboutPage",
                        "name": "About Web Utils",
                        "url": "https://webutils.site/about"
                    })
                }}
            />
            <div className="max-w-4xl mx-auto space-y-8 flex-1 w-full p-6 py-12">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">About Web Utils</h1>
                
                <div className="space-y-6 text-foreground/80 leading-relaxed mt-8">
                    <section>
                        <h2 className="text-xl font-semibold text-foreground mb-3">Our Mission</h2>
                        <p>At Web Utils, our mission is to provide developers, designers, and everyday users with a comprehensive suite of powerful, easy-to-use tools. We believe that simple, elegant utilities can significantly boost productivity and streamline workflows.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground mb-3">What We Offer</h2>
                        <p>We offer a growing collection of utilities spanning various categories, including:</p>
                        <ul className="list-disc pl-6 mt-2 space-y-1">
                            <li>Code editing and formatting (HTML, JSON, YAML)</li>
                            <li>Data conversion and manipulation</li>
                            <li>Time and epoch calculators</li>
                            <li>Drawing and diagramming tools</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground mb-3">Privacy & Security</h2>
                        <p>We take your privacy seriously. Most of our tools process data locally within your browser, ensuring that sensitive information never leaves your device unless explicitly stated otherwise.</p>
                    </section>
                </div>
            </div>
            <Footer />
        </main>
    );
}
