import React from 'react';
import Footer from "@/components/common/Footer";

export const metadata = {
  title: "Contact Us | Web Utils",
  description: "Get in touch with the Web Utils team for support, feedback, or business inquiries.",
  keywords: ["contact", "support", "help", "email", "feedback", "web utils contact"],
  openGraph: {
    title: "Contact Us | Web Utils",
    description: "Get in touch with the Web Utils team.",
    url: "https://webutils.site/contact",
  },
  alternates: { canonical: "/contact" }
};

export default function ContactPage() {
    return (
        <main className="h-full overflow-auto bg-background custom-scrollbar flex flex-col">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "ContactPage",
                        "name": "Contact Web Utils",
                        "url": "https://webutils.site/contact"
                    })
                }}
            />
            <div className="max-w-4xl mx-auto space-y-8 flex-1 w-full p-6 py-12">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Contact Us</h1>
                
                <div className="space-y-6 text-foreground/80 leading-relaxed mt-8">
                    <p>We value your feedback and are always here to help. Whether you have a question about one of our developer tools, want to report a bug, or have a business inquiry, please don't hesitate to reach out.</p>

                    <section className="bg-muted/30 p-6 rounded-lg border">
                        <h2 className="text-xl font-semibold text-foreground mb-4">Email Us</h2>
                        <p className="mb-2">For all general inquiries, support, and feedback, please email us directly at:</p>
                        <a href="mailto:support@webutils.site" className="text-primary font-medium hover:underline text-lg">
                            support@webutils.site
                        </a>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground mb-3">Response Time</h2>
                        <p>We aim to respond to all inquiries within 24-48 business hours. For complex technical issues regarding specific tools (like the Code Editor or Formatters), please include as much detail as possible so we can assist you quickly.</p>
                    </section>
                </div>
            </div>
            <Footer />
        </main>
    );
}
