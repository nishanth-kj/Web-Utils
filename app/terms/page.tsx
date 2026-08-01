import React from 'react';
import Footer from "@/components/common/Footer";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | Web Utils",
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
                <p className="text-muted-foreground">Effective Date: {new Date().toLocaleDateString()}</p>
                
                <div className="space-y-6 text-foreground/80 leading-relaxed">
                    <section>
                        <h2 className="text-xl font-semibold text-foreground mb-3">1. Terms</h2>
                        <p>By accessing this Website, accessible from https://webutils.site, you are agreeing to be bound by these Website Terms and Conditions of Use and agree that you are responsible for the agreement with any applicable local laws. If you disagree with any of these terms, you are prohibited from accessing this site.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground mb-3">2. Use License</h2>
                        <p>Permission is granted to temporarily download one copy of the materials on Web Utils's Website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:</p>
                        <ul className="list-disc pl-6 mt-2 space-y-1">
                            <li>modify or copy the materials;</li>
                            <li>use the materials for any commercial purpose or for any public display;</li>
                            <li>attempt to reverse engineer any software contained on Web Utils's Website;</li>
                            <li>remove any copyright or other proprietary notations from the materials.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground mb-3">3. Disclaimer</h2>
                        <p>All the materials on Web Utils's Website are provided "as is". Web Utils makes no warranties, may it be expressed or implied, therefore negates all other warranties. Furthermore, Web Utils does not make any representations concerning the accuracy or reliability of the use of the materials on its Website or otherwise relating to such materials or any sites linked to this Website.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground mb-3">4. Limitations</h2>
                        <p>Web Utils or its suppliers will not be hold accountable for any damages that will arise with the use or inability to use the materials on Web Utils's Website, even if Web Utils or an authorize representative of this Website has been notified, orally or written, of the possibility of such damage.</p>
                    </section>
                </div>
            </div>
            <Footer />
        </main>
    );
}
