import { TOOLS } from "@/lib/constants/tools";

export interface BreadcrumbSegment {
    label: string;
    href: string;
}

// Static/informational pages that aren't in the TOOLS list.
const STATIC_PAGE_LABELS: Record<string, string> = {
    "/about": "About",
    "/faq": "FAQ",
    "/contact": "Contact",
    "/privacy": "Privacy Policy",
    "/terms": "Terms of Service",
    "/documentation": "Documentation",
    "/docs": "API & System Docs",
    "/settings": "Settings",
};

// Format abbreviations that should stay fully uppercase in a breadcrumb label.
const ACRONYMS = new Set(["html", "xml", "csv", "svg", "sql", "json", "yaml"]);

function formatWord(word: string): string {
    return ACRONYMS.has(word.toLowerCase())
        ? word.toUpperCase()
        : word.charAt(0).toUpperCase() + word.slice(1);
}

function titleCaseSegment(segment: string): string {
    return segment.split("-").map(formatWord).join(" ");
}

// Builds the trail after "Home" for the current path — a tool's own page,
// one of its sub-options (e.g. /view/json under Live Previewer), a known
// informational page, or a best-effort label derived from the URL itself.
export function getBreadcrumbs(pathname: string): BreadcrumbSegment[] {
    if (pathname === "/") return [];

    const tool = TOOLS.find((t) => t.href === pathname);
    if (tool) return [{ label: tool.name, href: tool.href }];

    for (const t of TOOLS) {
        const sub = t.subOptions?.find((s) => s.href === pathname);
        if (sub) {
            return [
                { label: t.name, href: t.href },
                { label: titleCaseSegment(sub.name), href: sub.href },
            ];
        }
    }

    if (STATIC_PAGE_LABELS[pathname]) {
        return [{ label: STATIC_PAGE_LABELS[pathname], href: pathname }];
    }

    const segments = pathname.split("/").filter(Boolean);
    if (segments.length === 0) return [];
    return [{ label: titleCaseSegment(segments[segments.length - 1]), href: pathname }];
}
