import type {Metadata} from "next";
import {Geist, Geist_Mono} from "next/font/google";
import { GoogleTagManager } from '@next/third-parties/google';
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
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://webutils.site",
    title: "Web Utils | Professional Developer Tools",
    description: "The ultimate suite of fast, precise, and free online developer tools. Format, convert, and preview your code instantly.",
    siteName: "Web Utils",
    images: [
      {
        url: 'https://webutils.site/opengraph-image.png',
        width: 1200,
        height: 630,
        alt: 'Web Utils Open Graph Image',
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Web Utils | Universal Code Previewer & Editor",
    description: "A professional suite of developer tools for editing, previewing, and formatting code. Built for high performance.",
    site: "@webutils",
    creator: "@webutils",
    images: ['https://webutils.site/opengraph-image.png'],
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
    yandex: "yandex-verification-placeholder",
    yahoo: "yahoo-verification-placeholder",
  },
  appleWebApp: {
    title: "Web Utils",
    statusBarStyle: "black-translucent",
  },
  category: "technology",
  other: {
    "google-adsense-account": "ca-pub-2215957287486434",
    "msvalidate.01": "bing-verification-placeholder"
  },
};

export const viewport = {
  themeColor: "#ffffff",
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
        <meta name="google-site-verification" content="b8Me6fVb2f6bXx3XPQH8XGKf8zikGX0y5WlNjBRgOmw" />
      </head>
    <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-full overflow-hidden`}
    >
        <GoogleTagManager gtmId="GTM-WN2W26ZP" />
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