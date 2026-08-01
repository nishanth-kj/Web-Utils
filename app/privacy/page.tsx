import React from 'react';
import Footer from "@/components/common/Footer";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Web Utils",
  description: "Read the Web Utils Privacy Policy. We prioritize client-side processing to keep your data secure.",
  keywords: ["privacy policy", "data protection", "GDPR", "cookie policy", "user privacy", "secure tools", "client side processing"],
  openGraph: {
    title: "Privacy Policy | Web Utils",
    description: "Read the Web Utils Privacy Policy.",
    url: "https://webutils.site/privacy",
  },
  alternates: { canonical: "/privacy" }
};

export default function PrivacyPolicyPage() {
    return (
        <main className="h-full overflow-auto bg-background custom-scrollbar flex flex-col">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "WebPage",
                        "name": "Privacy Policy",
                        "url": "https://webutils.site/privacy"
                    })
                }}
            />
            <div className="max-w-4xl mx-auto space-y-8 flex-1 w-full p-6 py-12">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Privacy Policy</h1>
                <p className="text-muted-foreground">Effective Date: {new Date().toLocaleDateString()}</p>
                
                <div className="space-y-6 text-foreground/80 leading-relaxed">
                    <section>
                        <h2 className="text-xl font-semibold text-foreground mb-3">1. Introduction</h2>
                        <p>Welcome to Web Utils. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground mb-3">2. The Data We Collect About You</h2>
                        <p>We may collect, use, store and transfer different kinds of personal data about you which we have grouped together follows:</p>
                        <ul className="list-disc pl-6 mt-2 space-y-1">
                            <li><strong>Technical Data:</strong> includes internet protocol (IP) address, your login data, browser type and version, time zone setting and location, browser plug-in types and versions, operating system and platform.</li>
                            <li><strong>Usage Data:</strong> includes information about how you use our website and services.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground mb-3">3. How We Use Your Personal Data</h2>
                        <p>We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:</p>
                        <ul className="list-disc pl-6 mt-2 space-y-1">
                            <li>Where we need to perform the contract we are about to enter into or have entered into with you.</li>
                            <li>Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.</li>
                            <li>To serve relevant advertisements using Google AdSense or other third-party vendors.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground mb-3">4. Google AdSense & Cookies</h2>
                        <p>We use Google AdSense Advertising on our website.</p>
                        <p className="mt-2">Google, as a third-party vendor, uses cookies to serve ads on our site. Google's use of the DART cookie enables it to serve ads to our users based on previous visits to our site and other sites on the Internet. Users may opt-out of the use of the DART cookie by visiting the Google Ad and Content Network privacy policy.</p>
                    </section>
                </div>
            </div>
            <Footer />
        </main>
    );
}
