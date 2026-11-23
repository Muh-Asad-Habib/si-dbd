import type { Metadata } from "next";
import { FACILITIES, mapsUrl } from "@/data/facilities";

export const metadata: Metadata = { title: "Layanan Kesehatan · SI-DBD" };

export default function LayananPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-[2rem] font-bold leading-tight sm:text-[2.5rem]">Puskesmas dan rumah sakit</h1>
      <p className="mt-3 text-xl">Tempat pemeriksaan DBD dan nomor darurat.</p>

      <section aria-labelledby="darurat" className="mt-8 border-l-8 border-[#c8102e] bg-white p-4">
        <h2 id="darurat" className="text-xl font-bold">
          Keadaan darurat
        </h2>
        <p className="mt-1 text-lg">Telepon gratis, 24 jam.</p>
        <div className="mt-4 grid gap-3 sm:flex">
          <a
            href="tel:112"
            className="btn w-full bg-[#c8102e] text-white shadow-[0_4px_0_#7a0a1c] hover:bg-[#a00d25] sm:w-auto"
          >
            Telepon 112 (darurat)
          </a>
          <a href="tel:119" className="btn-ghost w-full sm:w-auto">
            Telepon 119 (ambulans)
          </a>
        </div>
      </section>

      <section aria-labelledby="terdekat" className="mt-10">
        <h2 id="terdekat" className="text-2xl font-bold">
          Cari yang paling dekat
        </h2>
        <p className="mt-2 text-lg">Buka Google Maps untuk melihat puskesmas di sekitar lokasi Anda.</p>
        <a
          href="https://www.google.com/maps/search/puskesmas+terdekat"
          target="_blank"
          rel="noreferrer"
          className="btn-primary mt-4 w-full sm:w-auto"
        >
          Buka puskesmas terdekat di peta
        </a>
      </section>

      <section aria-labelledby="daftar" className="mt-10">
        <h2 id="daftar" className="text-2xl font-bold">
          Daftar fasilitas kesehatan
        </h2>
        <ul className="mt-3 border-t border-line">
          {FACILITIES.map((f) => (
            <li key={f.name} className="border-b border-line py-4">
              <h3 className="text-xl font-bold">{f.name}</h3>
              <p className="text-muted">
                {f.type}
                {f.igd24 && (
                  <>
                    {" · "}
                    <b className="text-[#a00d25]">IGD 24 jam</b>
                  </>
                )}
              </p>
              <p className="mt-1 text-lg">{f.address}</p>
              <ul className="mt-2 flex flex-wrap gap-x-6">
                <li>
                  <a
                    href={mapsUrl(f)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-12 items-center text-lg text-brand-600 underline underline-offset-4"
                  >
                    Petunjuk arah
                  </a>
                </li>
                {f.phone && (
                  <li>
                    <a
                      href={`tel:${f.phone.replace(/[^\d+]/g, "")}`}
                      className="inline-flex min-h-12 items-center text-lg text-brand-600 underline underline-offset-4"
                    >
                      Telepon {f.phone}
                    </a>
                  </li>
                )}
              </ul>
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-8 text-muted">
        Data fasilitas masih contoh. Pastikan alamat dan nomor telepon sebelum berkunjung.
      </p>
    </div>
  );
}
