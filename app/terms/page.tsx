import React from 'react';
import Footer from "@/components/common/Footer";

import type { Metadata } from "next";

// Update this date whenever the terms change.
const EFFECTIVE_DATE = "October 14, 2026";
const GITHUB_URL = "https://github.com/nishanth-kj/Web-Utils";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Read the Terms of Service for using the Web Utils suite of developer utilities.",
  keywords: ["terms of service", "TOS", "legal", "usage terms", "conditions", "user agreement", "web utils terms"],
  openGraph: {
    title: "Terms of Service | Web Utils",
    description: "Read the Terms of Service.",
    url: "https://webutils.site/terms",
  },
  alternates: { canonical: "/terms" }
};

export default function TermsOfServicePage() {
    return (
        <main className="h-full overflow-auto bg-background custom-scrollbar flex flex-col">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "WebPage",
                        "name": "Terms of Service",
                        "url": "https://webutils.site/terms"
                    })
                }}
            />
            <div className="max-w-4xl mx-auto space-y-8 flex-1 w-full p-6 py-12">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Terms of Service</h1>
                <p className="text-muted-foreground">Effective date: {EFFECTIVE_DATE}</p>
                
                <div className="space-y-6 text-foreground/80 leading-relaxed">
                    <section>
                        <h2 className="text-xl font-semibold text-foreground mb-3">1. Terms</h2>
                        <p>By accessing this Website, accessible from https://webutils.site, you are agreeing to be bound by these Website Terms and Conditions of Use and agree that you are responsible for the agreement with any applicable local laws. If you disagree with any of these terms, you are prohibited from accessing this site.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground mb-3">2. Using the tools</h2>
                        <p>You may use the tools on this Website free of charge for personal and commercial work. Anything you create with them (formatted code, converted files, images, videos, diagrams) belongs to you, and you are responsible for having the right to use the content you put into them.</p>
                        <p className="mt-2">You agree not to:</p>
                        <ul className="list-disc pl-6 mt-2 space-y-1">
                            <li>disrupt or overload the Website, for example with automated requests at an abusive rate;</li>
                            <li>use the Website to distribute malware or to break the law;</li>
                            <li>present the Website, or a copy of it, as an official Web Utils service when it is not.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground mb-3">3. Source code license</h2>
                        <p>The Web Utils source code is published under the <a href={`${GITHUB_URL}/blob/main/LICENSE`} className="text-primary underline-offset-4 hover:underline" target="_blank" rel="noopener noreferrer">MIT License</a> on <a href={GITHUB_URL} className="text-primary underline-offset-4 hover:underline" target="_blank" rel="noopener noreferrer">GitHub</a>. That license governs copying, modifying and redistributing the code; these Terms govern use of the hosted Website at webutils.site. The Web Utils name and logo are not covered by the code license.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground mb-3">4. Disclaimer</h2>
                        <p>All the materials on Web Utils&apos;s Website are provided &quot;as is&quot;. Web Utils makes no warranties, expressed or implied, and disclaims all other warranties. Furthermore, Web Utils does not make any representations concerning the accuracy or reliability of the use of the materials on its Website or otherwise relating to such materials or any sites linked to this Website.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground mb-3">5. Limitations</h2>
                        <p>Web Utils or its suppliers will not be held accountable for any damages that will arise with the use or inability to use the materials on Web Utils&apos;s Website, even if Web Utils or an authorized representative of this Website has been notified, orally or written, of the possibility of such damage.</p>
                    </section>
                </div>
            </div>
            <Footer />
        </main>
    );
}
