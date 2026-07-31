import type {Metadata} from "next";
import {Geist, Geist_Mono} from "next/font/google";
import "./globals.css";
import {ThemeProvider} from "@/components/layout/theme-provider";
import {ClientLayout} from "@/components/layout/client-layout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://webutils.site'),
  title: {
    default: "Web Utils | Universal Code Previewer",
    template: "%s | Web Utils"
  },
  description: "A professional tool for editing and previewing HTML, JSON, YAML, and React code with ease.",
  keywords: ["developer tools", "code editor", "html preview", "json formatter", "yaml parser", "react preview", "online tools"],
  authors: [{ name: "Web Utils" }],
  alternates: {
    canonical: '/'
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://webutils.site",
    title: "Web Utils | Universal Code Previewer",
    description: "A professional tool for editing and previewing HTML, JSON, YAML, and React code with ease.",
    siteName: "Web Utils",
  },
  twitter: {
    card: "summary_large_image",
    title: "Web Utils | Universal Code Previewer",
    description: "A professional tool for editing and previewing HTML, JSON, YAML, and React code with ease.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
                                   }: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full">
    <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-full overflow-hidden`}
    >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "Web Utils",
              "operatingSystem": "Web Browser",
              "applicationCategory": "DeveloperApplication",
              "url": "https://webutils.dev",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "description": "A professional tool for editing and previewing HTML, JSON, YAML, and React code with ease."
            }).replace(/</g, '\\u003c')
          }}
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
            {/* CLIENT PART MOVED HERE */}
            <ClientLayout>{children}</ClientLayout>
        </ThemeProvider>
      </body>
    </html>
  );
}