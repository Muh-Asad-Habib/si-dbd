import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="no-print mt-14 border-t-4 border-brand-600 bg-white">
      <div className="mx-auto max-w-5xl space-y-5 px-4 pb-32 pt-8 sm:px-6 md:pb-10">
        <div className="border-l-8 border-[#c8102e] bg-[#fdf1f2] p-4">
          <p className="text-lg font-bold">Keadaan darurat?</p>
          <p className="mt-1">
            Hubungi{" "}
            <a href="tel:112" className="font-bold text-[#a00d25] underline underline-offset-4">
              112
            </a>{" "}
            (panggilan darurat) atau{" "}
            <a href="tel:119" className="font-bold text-[#a00d25] underline underline-offset-4">
              119
            </a>{" "}
            (ambulans), atau langsung ke IGD terdekat.
          </p>
        </div>
        <p className="max-w-2xl text-muted">
          SI-DBD adalah alat bantu skrining, bukan diagnosis. DBD hanya dapat dipastikan melalui
          pemeriksaan tenaga kesehatan dan laboratorium.
        </p>
        <ul className="flex flex-wrap gap-x-6 gap-y-2 font-bold">
          <li>
            <Link href="/edukasi" className="text-brand-600 underline underline-offset-4">
              Tentang DBD
            </Link>
          </li>
          <li>
            <Link href="/layanan" className="text-brand-600 underline underline-offset-4">
              Fasilitas kesehatan
            </Link>
          </li>
          <li>
            <Link href="/riwayat" className="text-brand-600 underline underline-offset-4">
              Data saya
            </Link>
          </li>
        </ul>
      </div>
    </footer>
  );
}
