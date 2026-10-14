import React from 'react';
import Link from "next/link";
import Footer from "@/components/common/Footer";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Web Utils handles your data: tools process your input in the browser, and analytics and ads load only after you accept cookies.",
  keywords: ["privacy policy", "data protection", "GDPR", "cookie policy", "user privacy", "secure tools", "client side processing"],
  openGraph: {
    title: "Privacy Policy | Web Utils",
    description: "Read the Web Utils Privacy Policy.",
    url: "https://webutils.site/privacy",
  },
  alternates: { canonical: "/privacy" }
};

// Update this date whenever the policy text changes.
const EFFECTIVE_DATE = "October 14, 2026";

const linkClass = "text-primary underline-offset-4 hover:underline";

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
                <p className="text-muted-foreground">Effective date: {EFFECTIVE_DATE}</p>

                <div className="space-y-6 text-foreground/80 leading-relaxed">
                    <section>
                        <h2 className="text-xl font-semibold text-foreground mb-3">1. Summary</h2>
                        <p>Web Utils (webutils.site) is a set of free developer tools. The text, code, images and videos you put into the tools are processed in your browser and are not uploaded to us. We have no user accounts. If you accept cookies, we use Google services for analytics and advertising, described below.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground mb-3">2. Your tool data</h2>
                        <p>Formatting, converting, previewing, editing and generating all run with JavaScript and WebAssembly on your device. That content is not sent to our servers and we cannot see it.</p>
                        <p className="mt-2">Some tools download open-source libraries from public CDNs when you use them: the HTML preview (Bootstrap and Tailwind CSS from cdn.jsdelivr.net and cdn.tailwindcss.com), the diagram editor (rough.js from cdn.jsdelivr.net) and the Python code visualizer (Pyodide from cdn.jsdelivr.net). Like any web request, these providers receive your IP address and browser details, but not your content. Markup you preview can itself load external resources, which is under your control.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground mb-3">3. Data stored in your browser</h2>
                        <p>We store a few preferences in your browser&apos;s local storage: theme, editor settings, time and clock display preferences, whether you have seen the intro animation, and your cookie choice. The Settings page lets you export or clear them. Viewer drafts are kept in session storage so they survive a page reload and are cleared when you close the tab. None of this is sent to us.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground mb-3">4. Hosting</h2>
                        <p>The site is hosted on Vercel. Like any web host, Vercel processes request data such as your IP address, browser user agent and the pages requested in order to deliver the site and protect it from abuse.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground mb-3">5. Cookies, analytics and advertising</h2>
                        <p>On your first visit we ask whether you accept cookies. Google Tag Manager (which loads our analytics) and Google AdSense load only after you click &quot;Accept&quot;. If you decline, they are not loaded and the tools work exactly the same. You can change your choice at any time with the &quot;Cookie settings&quot; link in the footer.</p>
                        <p className="mt-2">When you accept:</p>
                        <ul className="list-disc pl-6 mt-2 space-y-1">
                            <li>Analytics records which pages are visited, approximate location derived from IP address, device and browser type, and how the site is used, so we can see which tools are useful and fix problems.</li>
                            <li>Third-party vendors, including Google, use cookies to serve ads based on your prior visits to this website or other websites. Google&apos;s use of advertising cookies enables it and its partners to serve ads to you based on your visit to this site and/or other sites on the Internet.</li>
                        </ul>
                        <p className="mt-2">
                            You can opt out of personalized advertising in Google&apos;s{" "}
                            <a href="https://myadcenter.google.com/" className={linkClass} target="_blank" rel="noopener noreferrer">My Ad Center</a>,
                            or opt out of many third-party vendors&apos; cookies at{" "}
                            <a href="https://www.aboutads.info/choices/" className={linkClass} target="_blank" rel="noopener noreferrer">aboutads.info</a>.
                            Learn{" "}
                            <a href="https://policies.google.com/technologies/partner-sites" className={linkClass} target="_blank" rel="noopener noreferrer">how Google uses information from sites that use its services</a>.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground mb-3">6. Your rights</h2>
                        <p>Depending on where you live (for example under the GDPR in the EU and UK, or the CCPA in California), you may have the right to access, correct, delete or object to the processing of your personal data, and to withdraw consent. We don&apos;t hold tool content or accounts, so analytics and advertising data is held by Google; you can manage it through your Google account and the links above. For anything else, contact us.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground mb-3">7. Children</h2>
                        <p>Web Utils is a developer tool site and is not directed at children under 13. We do not knowingly collect personal information from children.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground mb-3">8. Changes and contact</h2>
                        <p>If this policy changes, we will update the effective date above. Questions or requests can be sent through the <Link href="/contact" className={linkClass}>contact page</Link>.</p>
                    </section>
                </div>
            </div>
            <Footer />
        </main>
    );
}
