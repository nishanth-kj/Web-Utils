import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { GoogleTagManager } from '@next/third-parties/google';
import Script from "next/script";
import "./globals.css";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { ClientLayout } from "@/components/layout/client-layout";
import { CookieConsent } from "@/components/common/CookieConsent";
import { DeferOnPrerender } from "@/components/common/DeferOnPrerender";
import { ConsentGate } from "@/components/common/ConsentGate";

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
    default: "Web Utils | Universal Code Previewer & Developer Tools",
    template: "%s | Web Utils"
  },
  description: "A professional, fast, and comprehensive suite of developer tools for editing, previewing, formatting, and converting HTML, JSON, YAML, SQL, and Markdown.",
  applicationName: "Web Utils",
  authors: [{ name: "Web Utils Team", url: "https://webutils.site/about" }],
  generator: "Next.js",
  keywords: ["developer tools", "code editor", "html preview", "json formatter", "yaml parser", "react preview", "online tools", "base64 encoding", "url decoding", "sql formatting", "epoch converter", "diagram drawing"],
  referrer: "origin-when-cross-origin",
  creator: "Web Utils Team",
  publisher: "Web Utils",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {},
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://webutils.site",
    title: "Web Utils | Developer tools that stay in your browser",
    description: "Format, convert, preview, and generate. Free, local-first developer tools — no signup, nothing uploaded.",
    siteName: "Web Utils",
  },
  twitter: {
    card: "summary_large_image",
    title: "Web Utils | Developer tools that stay in your browser",
    description: "Format, convert, preview, and generate. Free, local-first developer tools — no signup, nothing uploaded.",
    site: "@webutils",
    creator: "@webutils",
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: "b8Me6fVb2f6bXx3XPQH8XGKf8zikGX0y5WlNjBRgOmw",
  },
  appleWebApp: {
    title: "Web Utils",
    statusBarStyle: "black-translucent",
  },
  category: "technology",
  other: {
    "google-adsense-account": "ca-pub-2215957287486434",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full">
      <head>
        {/* The critical rendering path only reaches these two third-party origins (GTM, AdSense) */}
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://pagead2.googlesyndication.com" crossOrigin="anonymous" />
        {/* Same-origin navigations may be prerendered speculatively; the AdSense loader is
            deferred via DeferOnPrerender so an impression isn't counted for a
            page that was only hovered, never visited. */}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-full overflow-hidden`}
      >
        <Script
          id="speculation-rules"
          type="speculationrules"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              prerender: [
                {
                  where: {
                    and: [
                      { href_matches: "/*" },
                      {
                        not: {
                          href_matches: [
                            "/editor",
                            "/ide",
                            "/draw",
                            "/view",
                            "/view/*",
                            "/time",
                            "/crypto",
                            "/password",
                            "/dummy"
                          ]
                        }
                      }
                    ]
                  },
                  eagerness: "moderate"
                }
              ]
            })
          }}
        />
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[300] focus:rounded-md focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-foreground focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring"
        >
          Skip to main content
        </a>
        <DeferOnPrerender>
          <ConsentGate>
            <GoogleTagManager gtmId="GTM-WN2W26ZP" />
            <Script
              id="adsense-script"
              strategy="afterInteractive"
              src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2215957287486434"
              crossOrigin="anonymous"
            />
          </ConsentGate>
        </DeferOnPrerender>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "Web Utils",
              "operatingSystem": "Web Browser",
              "applicationCategory": "DeveloperApplication",
              "url": "https://webutils.site",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "description": "A professional tool for editing and previewing HTML, JSON, YAML, and React code with ease."
            }).replace(/</g, '\\u003c')
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "Web Utils",
              "url": "https://webutils.site"
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
        <CookieConsent />
      </body>
    </html>
  );
}