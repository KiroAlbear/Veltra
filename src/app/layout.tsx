import type { Metadata } from "next";
import { Inter, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/veltra/theme-provider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Veltra — The Clinic Operating System",
  description: "Runs your clinic from the first call to the final follow-up. The operating system for modern healthcare clinics. HIPAA, GDPR, NPHIES compliant.",
  keywords: ["Veltra", "Clinic Operating System", "Healthcare OS", "Clinic Management", "EMR", "HIPAA", "GDPR", "NPHIES", "PDPL", "Clinical Memory", "Patient Records", "Healthcare SaaS"],
  authors: [{ name: "Veltra Technologies" }],
  creator: "Veltra Technologies",
  metadataBase: new URL("https://veltrahealth.co"),
  alternates: {
    canonical: "/",
    languages: {
      "en": "/",
      "ar": "/?lang=ar",
    },
  },
  icons: {
    icon: [
      { url: "/logo-symbol.png", type: "image/png" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180" },
    ],
  },
  openGraph: {
    title: "Veltra — The Clinic Operating System",
    description: "Runs your clinic from the first call to the final follow-up. Technology disappears. Care remains.",
    siteName: "Veltra",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "Veltra — The Clinic Operating System",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Veltra — The Clinic Operating System",
    description: "Runs your clinic from the first call to the final follow-up.",
    images: ["/og-image.svg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  category: "technology",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/logo-symbol.png" type="image/png" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#39CFA2" />
        <meta property="og:image" content="/og-image.svg" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="/og-image.svg" />
        {/* CJK fonts — lazy-loaded only when needed (zh/ja/ko).
            Inter stays primary; Noto Sans CJK is fallback for Chinese/Japanese/Korean glyphs. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;600;700&family=Noto+Sans+JP:wght@400;500;600;700&family=Noto+Sans+KR:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        {/* Structured Data — helps search engines understand Veltra */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "Veltra",
              "description": "The Clinic Operating System. Runs your clinic from the first call to the final follow-up.",
              "applicationCategory": "HealthApplication",
              "operatingSystem": "Web",
              "offers": [
                { "@type": "Offer", "name": "Veltra Platform", "price": "999", "priceCurrency": "USD", "description": "The Clinic Operating System. From $999/month." },
                { "@type": "Offer", "name": "Enterprise", "priceCurrency": "USD", "description": "Custom pricing for healthcare organizations." }
              ],
              "publisher": {
                "@type": "Organization",
                "name": "Veltra Technologies",
                "url": "https://veltrahealth.co"
              }
            })
          }}
        />
        {/* PWA: Register service worker */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js').catch(() => {});
                });
              }
            `,
          }}
        />
        {/* Print styles for Brief */}
        <style>{`
          @media print {
            .no-print { display: none !important; }
            .veltra-glass, .veltra-shadow, .veltra-shadow-lg { box-shadow: none !important; backdrop-filter: none !important; background: white !important; color: black !important; }
            body { background: white !important; }
          }
        `}</style>
      </head>
      <body
        className={`${inter.variable} ${instrumentSerif.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
