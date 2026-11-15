import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "QR Code Generator",
    description: "Create customizable QR codes for URLs, text, email, phone numbers and Wi-Fi. Generate and download PNG or SVG QR codes privately in your browser.",
    keywords: ["qr code generator", "free qr generator", "wifi qr code", "url qr code", "qr code png", "qr code svg"],
    alternates: { canonical: "/qr" },
    openGraph: {
        title: "QR Code Generator | Web Utils",
        description: "Create and download customizable QR codes privately in your browser.",
        url: "https://webutils.site/qr",
    },
};

export default function Layout({ children }: { children: React.ReactNode }) {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: "QR Code Generator | Web Utils",
        description: "Generate customizable QR codes for URLs, text, email, phone numbers and Wi-Fi locally in your browser.",
        url: "https://webutils.site/qr",
        applicationCategory: "UtilitiesApplication",
        operatingSystem: "Any",
    };

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
            {children}
        </>
    );
}
