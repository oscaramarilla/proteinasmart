import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter, Sora } from "next/font/google";
import "./globals.css";
import { negocio } from "../lib/negocio";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Usadas solo por el Smart Quiz (.quiz-shell en globals.css), para mantener
// la tipografia del sitio vanilla (css/styles.css). El resto de /web sigue
// con Geist.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL(negocio.dominio),
  title: `${negocio.marca} | ${negocio.claim}`,
  description: negocio.descripcion,
  alternates: { canonical: "/" },
  openGraph: {
    title: `${negocio.marca} | ${negocio.claim}`,
    description: negocio.descripcion,
    url: negocio.dominio,
    siteName: negocio.marca,
    locale: "es_PY",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: negocio.descripcion }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${negocio.marca} | ${negocio.claim}`,
    description: negocio.descripcion,
    images: ["/og-image.png"],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} ${sora.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Store",
              name: negocio.marca,
              alternateName: negocio.claim,
              description: negocio.descripcion,
              url: negocio.dominio,
              telephone: `+${negocio.contacto.whatsapp}`,
              address: {
                "@type": "PostalAddress",
                addressLocality: "Asuncion",
                addressCountry: "PY",
              },
              areaServed: "Paraguay",
              currenciesAccepted: "PYG",
              paymentAccepted: negocio.operacion.pagos,
              openingHours: "Mo-Sa 08:00-19:00",
            }),
          }}
        />
      </body>
    </html>
  );
}
