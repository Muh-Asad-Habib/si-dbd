import type { Metadata, Viewport } from "next";
import { Atkinson_Hyperlegible } from "next/font/google";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { BottomNav } from "@/components/BottomNav";
import "./globals.css";

const atkinson = Atkinson_Hyperlegible({
  variable: "--font-atkinson",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "SI-DBD · Skrining Demam Berdarah Dengue",
  description:
    "Skrining mandiri gejala Demam Berdarah Dengue (DBD). Cepat, anonim, dan langsung mendapat rekomendasi tindak lanjut.",
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
        <BottomNav />
      </body>
    </html>
  );
}
