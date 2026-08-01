import React from 'react';
import Footer from "@/components/common/Footer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Frequently Asked Questions | Web Utils",
  description: "Answers to common questions about using Web Utils tools, privacy, and data storage.",
  keywords: ["faq", "frequently asked questions", "help", "support", "web utils help", "knowledge base", "questions"],
  openGraph: {
    title: "Frequently Asked Questions | Web Utils",
    description: "Answers to common questions about using Web Utils tools.",
    url: "https://webutils.site/faq",
  },
  alternates: { canonical: "/faq" }
};

const FAQS = [
  {
    question: "Is Web Utils free to use?",
    answer: "Yes! Web Utils is completely free to use. There are no hidden fees or subscriptions required."
  },
  {
    question: "Do you store my code or data?",
    answer: "No. The vast majority of our tools process your data locally in your browser. We do not store your code, API keys, or JSON payloads on our servers."
  },
  {
    question: "Do I need to create an account?",
    answer: "No account is required to use any of the tools on Web Utils. You can simply open the site and start formatting or converting immediately."
  },
  {
    question: "Is there an API available?",
    answer: "Currently, Web Utils is designed as a frontend graphical interface for developers. We do not offer a public API at this time."
  },
  {
    question: "Can I use Web Utils on my mobile device?",
    answer: "Yes, our website is fully responsive and can be used on mobile devices, though some tools (like code editors) are best experienced on a desktop or tablet screen."
  }
];

export default function FAQPage() {
    return (
        <main className="h-full overflow-auto bg-background custom-scrollbar flex flex-col">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "FAQPage",
                        "name": "Frequently Asked Questions",
                        "url": "https://webutils.site/faq"
                    })
                }}
            />
            <div className="max-w-4xl mx-auto space-y-8 flex-1 w-full p-6 py-12">
                <div className="space-y-4">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Frequently Asked Questions</h1>
                    <p className="text-muted-foreground text-lg">
                        Find answers to common questions about using our developer tools.
                    </p>
                </div>
                
                <div className="mt-8">
                    <Accordion type="single" collapsible className="w-full space-y-4">
                        {FAQS.map((faq, i) => (
                            <AccordionItem key={i} value={`item-${i}`} className="border rounded-lg px-4 bg-card">
                                <AccordionTrigger className="text-left font-medium text-foreground hover:no-underline hover:text-primary transition-colors">
                                    {faq.question}
                                </AccordionTrigger>
                                <AccordionContent className="text-muted-foreground leading-relaxed">
                                    {faq.answer}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>
            </div>
            <Footer />
        </main>
    );
}
