import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Advanced Password Generator & Checker | Web Utils',
  description: 'Generate highly secure passwords and check their strength against leaked databases using high-performance Rust WebAssembly. Ensure your digital safety client-side.',
  keywords: ["password generator", "password strength checker", "secure password", "leaked password check", "wasm", "rust webassembly", "client side security"],
  openGraph: {
    title: 'Advanced Password Generator & Checker | Web Utils',
    description: 'Generate highly secure passwords and check their strength against leaked databases using high-performance Rust WebAssembly.',
    url: 'https://webutils.site/password',
  },
  twitter: {
    title: 'Advanced Password Generator & Checker | Web Utils',
    description: 'Generate highly secure passwords and check their strength against leaked databases.',
  },
  alternates: {
    canonical: '/password',
  }
}

export default function PasswordLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Advanced Password Generator & Checker",
    "description": "Generate highly secure passwords and check their strength against leaked databases using high-performance Rust WebAssembly.",
    "url": "https://webutils.site/password",
    "applicationCategory": "SecurityApplication",
    "operatingSystem": "Any"
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="min-h-screen bg-background">
        {children}
      </div>
    </>
  )
}
