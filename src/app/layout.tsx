import type { Metadata, Viewport } from "next";
import { Atkinson_Hyperlegible } from "next/font/google";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import "./globals.css";

const atkinson = Atkinson_Hyperlegible({
  variable: "--font-atkinson",
  subsets: ["latin"],
  weight: ["400", "700"],
});

// Netlify mengisi URL saat build; gambar pratinjau WhatsApp butuh alamat absolut.
const SITE_URL = process.env.SITE_URL || process.env.URL || "https://si-dbd-skrining.netlify.app";
const TITLE = "SI-DBD · Skrining Demam Berdarah Dengue";
const DESC = "Cek gejala DBD dalam ±2 menit. 10 pertanyaan Ya/Tidak, gratis, langsung dapat saran tindak lanjut.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESC,
  applicationName: "SI-DBD",
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: "SI-DBD",
    title: "Skrining DBD Mandiri · SI-DBD",
    description: DESC,
  },
  twitter: { card: "summary_large_image", title: "Skrining DBD Mandiri · SI-DBD", description: DESC },
};

export const viewport: Viewport = {
  themeColor: "#0b4f8a",
};

// Terapkan ukuran huruf tersimpan sebelum halaman tampil agar tidak berkedip.
const TEXT_SIZE_SCRIPT = `try{var t=localStorage.getItem("sidbd.textSize");if(t==="l"||t==="xl")document.documentElement.dataset.text=t}catch(e){}`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: TEXT_SIZE_SCRIPT }} />
      </head>
      <body className={`${atkinson.variable} font-sans antialiased`}>
        <a
          href="#konten"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-focus focus:px-4 focus:py-3 focus:font-bold focus:text-ink"
        >
          Langsung ke konten
        </a>
        <div className="flex min-h-dvh flex-col">
          <SiteHeader />
          <main id="konten" className="mx-auto w-full max-w-5xl flex-1 px-4 pt-6 sm:px-6 sm:pt-8">
            {children}
          </main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
