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
  title: "Web Utils | Universal Code Previewer",
    description:
        "A professional tool for editing and previewing HTML, JSON, YAML, and React code with ease.",
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