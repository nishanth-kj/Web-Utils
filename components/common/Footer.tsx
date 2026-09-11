import React from "react";
import Link from "next/link";

const FOOTER_LINKS = [
    { href: "/docs", label: "Docs" },
    { href: "/faq", label: "FAQ" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
    { href: "/privacy", label: "Privacy" },
    { href: "/terms", label: "Terms" },
];

export default function Footer() {
    const year = new Date().getFullYear();

    return (
        <footer className="w-full border-t bg-background">
            <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-6 sm:flex-row sm:px-6">
                <p className="text-sm text-muted-foreground">
                    &copy; {year > 2026 ? `2026 – ${year}` : "2026"} Web Utils
                </p>
                <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
                    {FOOTER_LINKS.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="transition-colors hover:text-foreground"
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>
            </div>
        </footer>
    );
}
