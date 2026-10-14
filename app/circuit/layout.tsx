import type { Metadata } from "next";

const DESCRIPTION = "Build circuits with batteries, resistors, bulbs, LEDs, switches and capacitors, and see voltages and currents live. Free circuit simulator in your browser.";

export const metadata: Metadata = {
  title: "Circuit Simulator",
  description: DESCRIPTION,
  keywords: ["circuit simulator", "online circuit simulator", "electronics simulator", "ohm's law calculator", "led resistor circuit", "rc circuit simulator", "voltage divider", "electric circuit builder"],
  openGraph: {
    title: "Circuit Simulator | Web Utils",
    description: DESCRIPTION,
    url: "https://webutils.site/circuit",
  },
  alternates: { canonical: "/circuit" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Circuit Simulator | Web Utils",
    "description": DESCRIPTION,
    "url": "https://webutils.site/circuit",
    "applicationCategory": "EducationalApplication",
    "operatingSystem": "Any"
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  );
}
