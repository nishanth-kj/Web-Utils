import Link from "next/link";
import { ArrowUpRight, ShieldCheck, AlertTriangle } from "lucide-react";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { JsonLdSchema } from "@/components/seo/Schema";
import { TOOLS } from "@/lib/constants/tools";

export interface ToolFaqEntry {
    question: string;
    answer: string;
}

export interface ToolErrorEntry {
    title: string;
    description: string;
}

export interface ToolSeoContent {
    /** Human name used in headings, e.g. "JSON Formatter". */
    toolName: string;
    /** Canonical path this content describes, e.g. "/view/json". Used for the FAQPage schema URL. */
    pagePath: string;
    /** 2-4 sentence answer to "what is this and who is it for". */
    what: string;
    /** 3-6 short imperative steps. */
    steps: string[];
    errors: ToolErrorEntry[];
    faqs: ToolFaqEntry[];
    /** hrefs from lib/constants/tools.ts to cross-link. */
    relatedHrefs: string[];
}

export function ToolSeoSection({ toolName, pagePath, what, steps, errors, faqs, relatedHrefs }: ToolSeoContent) {
    const relatedTools = relatedHrefs
        .map((href) => TOOLS.find((t) => t.href === href))
        .filter((t): t is NonNullable<typeof t> => Boolean(t));

    return (
        <section className="mx-auto w-full max-w-4xl space-y-12 px-4 py-12 sm:px-6">
            {faqs.length > 0 && (
                <JsonLdSchema
                    type="FAQPage"
                    data={{
                        url: `https://webutils.site${pagePath}`,
                        mainEntity: faqs.map((faq) => ({
                            "@type": "Question",
                            name: faq.question,
                            acceptedAnswer: {
                                "@type": "Answer",
                                text: faq.answer,
                            },
                        })),
                    }}
                />
            )}

            <div className="flex items-start gap-3 rounded-xl border border-border bg-muted/30 px-4 py-3">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <p className="text-sm text-foreground">
                    Your data stays in the browser. {toolName} runs entirely client-side — nothing you paste or upload is sent to a server.
                </p>
            </div>

            <div className="space-y-3">
                <h2 className="text-xl font-semibold tracking-tight text-foreground">What is the {toolName}?</h2>
                <p className="leading-relaxed text-muted-foreground">{what}</p>
            </div>

            <div className="space-y-3">
                <h2 className="text-xl font-semibold tracking-tight text-foreground">How to use it</h2>
                <ol className="space-y-2">
                    {steps.map((step, i) => (
                        <li key={i} className="flex gap-3 text-sm leading-relaxed text-muted-foreground">
                            <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-foreground/10 text-xs font-semibold text-foreground">
                                {i + 1}
                            </span>
                            <span className="pt-0.5">{step}</span>
                        </li>
                    ))}
                </ol>
            </div>

            {errors.length > 0 && (
                <div className="space-y-3">
                    <h2 className="text-xl font-semibold tracking-tight text-foreground">Common errors</h2>
                    <div className="space-y-2">
                        {errors.map((err, i) => (
                            <div key={i} className="flex gap-3 rounded-lg border border-border bg-card px-4 py-3">
                                <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
                                <div>
                                    <p className="text-sm font-medium text-foreground">{err.title}</p>
                                    <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">{err.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {faqs.length > 0 && (
                <div className="space-y-3">
                    <h2 className="text-xl font-semibold tracking-tight text-foreground">Frequently asked questions</h2>
                    <Accordion type="single" collapsible className="w-full space-y-2">
                        {faqs.map((faq, i) => (
                            <AccordionItem key={i} value={`faq-${i}`} className="rounded-lg border bg-card px-4">
                                <AccordionTrigger className="text-left text-sm font-medium text-foreground hover:no-underline hover:text-primary">
                                    {faq.question}
                                </AccordionTrigger>
                                <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                                    {faq.answer}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>
            )}

            {relatedTools.length > 0 && (
                <div className="space-y-3">
                    <h2 className="text-xl font-semibold tracking-tight text-foreground">Related tools</h2>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {relatedTools.map((tool) => (
                            <Link
                                key={tool.href}
                                href={tool.href}
                                className="group flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-foreground/15 hover:bg-accent/40"
                            >
                                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-background text-foreground">
                                    <tool.icon className="size-4" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-semibold text-foreground">{tool.name}</p>
                                    <p className="truncate text-xs text-muted-foreground">{tool.description}</p>
                                </div>
                                <ArrowUpRight className="size-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </section>
    );
}
