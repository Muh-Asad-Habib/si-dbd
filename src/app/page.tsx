"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronRight, Phone } from "lucide-react";
import { store, type HistoryItem } from "@/lib/storage";
import type { Profile } from "@/lib/validation";
import { LevelBadge } from "@/components/LevelBadge";
import { StartScreeningButton } from "@/components/ConsentDialog";

const USE_IF = [
  "demam mendadak dalam 2–7 hari terakhir,",
  "badan pegal, sakit kepala, atau nyeri di belakang mata,",
  "muncul bintik merah di kulit, atau",
  "ada kasus DBD di rumah, sekolah, atau lingkungan sekitar.",
];

const DANGER = [
  "nyeri perut yang hebat",
  "muntah terus-menerus atau tidak bisa minum",
  "mimisan, gusi berdarah, muntah darah, atau BAB hitam",
  "sangat lemas, gelisah, atau sulit dibangunkan",
  "tangan dan kaki dingin, sesak napas, atau jarang buang air kecil",
];


const FAQ = [
  {
    q: "Apakah skrining ini bisa memastikan saya terkena DBD?",
    a: "Tidak. Skrining membantu menilai apakah gejala Anda perlu diperiksa. Kepastian DBD memerlukan pemeriksaan dokter dan tes darah.",
  },
  {
    q: "Bolehkah saya mengisi untuk anak atau orang tua?",
    a: "Boleh. Jawab sesuai kondisi orang yang diperiksa. Pilih \"Isi data lain\" agar datanya tidak tercampur.",
  },
  {
    q: "Kenapa lain kali saya tidak perlu mengisi data lagi?",
    a: "Usia, jenis kelamin, dan wilayah disimpan di HP Anda sendiri. Anda bisa menghapusnya di menu Riwayat.",
  },
];

export default function HomePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [last, setLast] = useState<HistoryItem | null>(null);

  useEffect(() => {
    setProfile(store.getProfile());
    setLast(store.getHistory()[0] ?? null);
  }, []);


  return (
    <div className="grid gap-10 md:grid-cols-[minmax(0,1fr)_16rem]">
      <article className="max-w-2xl">
        <h1 className="text-[2rem] font-bold leading-tight sm:text-[2.5rem]">
          Cek gejala Demam Berdarah Dengue (DBD)
        </h1>
        <p className="mt-4 text-xl leading-relaxed">
          Jawab 10 pertanyaan singkat untuk mengetahui apakah gejala Anda perlu diperiksa ke
          puskesmas, atau harus segera ke IGD.
        </p>

        {last && (
          <Link
            href={`/hasil/${last.code}`}
            className="mt-6 flex items-center justify-between gap-3 border-l-8 border-brand-600 bg-white p-4 hover:bg-brand-50"
          >
            <span>
              <span className="block text-muted">Hasil skrining terakhir Anda</span>
              <span className="font-mono text-lg font-bold text-brand-600 underline underline-offset-4">
                {last.code}
              </span>
            </span>
            <LevelBadge level={last.level} />
          </Link>
        )}

        <h2 className="mt-8 text-2xl font-bold">Gunakan layanan ini jika Anda mengalami:</h2>
        <ul className="mt-3 list-disc space-y-1.5 pl-7 text-lg marker:text-brand-600">
          {USE_IF.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
        <p className="mt-4 text-lg">
          Butuh sekitar <b>2 menit</b>. Anda juga boleh mengisinya untuk anak atau anggota keluarga.
        </p>

        {/* Kotak darurat: harus terlihat sebelum tombol mulai. */}
        <section aria-labelledby="darurat" className="mt-8 overflow-hidden rounded-md border-2 border-[#c8102e] bg-white">
          <h2 id="darurat" className="bg-[#c8102e] px-5 py-3 text-xl font-bold text-white">
            Jangan menunggu hasil skrining. Segera ke IGD bila ada:
          </h2>
          <div className="p-5">
            <ul className="list-disc space-y-1.5 pl-6 text-lg marker:text-[#c8102e]">
              {DANGER.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
            <a
              href="tel:112"
              className="btn mt-5 w-full bg-[#c8102e] text-white shadow-[0_4px_0_#7a0a1c] hover:bg-[#a00d25] sm:w-auto"
            >
              <Phone className="h-5 w-5" aria-hidden /> Telepon 112
            </a>
          </div>
        </section>

        <section id="mulai" aria-labelledby="sebelum" className="mt-10 scroll-mt-6">
          <h2 id="sebelum" className="text-2xl font-bold">
            Mulai skrining
          </h2>
          <p className="mt-2 text-lg">
            Anda akan diminta persetujuan terlebih dahulu. Data dicatat tanpa nama dan tanpa nomor HP.
          </p>

          {profile && (
            <p className="mt-4 border-l-8 border-line pl-4 text-lg">
              Data tersimpan di HP ini: {profile.age} tahun, {profile.gender.toLowerCase()},{" "}
              {profile.kelurahan}, {profile.kecamatan}. Anda tidak perlu mengisinya lagi.
            </p>
          )}

          <StartScreeningButton className="btn-go mt-6 w-full px-6 text-xl sm:w-auto">
            Mulai skrining <ChevronRight className="h-6 w-6" strokeWidth={3} aria-hidden />
          </StartScreeningButton>
        </section>

        <section aria-labelledby="faq" className="mt-12">
          <h2 id="faq" className="text-2xl font-bold">
            Pertanyaan yang sering diajukan
          </h2>
          <div className="mt-3 border-b border-line">
            {FAQ.map((f) => (
              <details key={f.q} className="group border-t border-line">
                <summary className="flex min-h-14 list-none items-center gap-3 py-3 text-lg font-bold text-brand-600 [&::-webkit-details-marker]:hidden">
                  <ChevronRight
                    className="h-5 w-5 shrink-0 transition-transform group-open:rotate-90"
                    strokeWidth={3}
                    aria-hidden
                  />
                  <span className="underline underline-offset-4">{f.q}</span>
                </summary>
                <p className="mb-4 ml-8 border-l-4 border-line pl-4 text-lg">{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      </article>

      <aside aria-labelledby="terkait" className="md:pt-3">
        <div className="border-t-4 border-brand-600 pt-3">
          <h2 id="terkait" className="text-lg font-bold">
            Informasi terkait
          </h2>
          <ul className="mt-2 space-y-2 text-lg">
            <li>
              <Link href="/edukasi" className="text-brand-600 underline underline-offset-4">
                Gejala, fase, dan cara merawat DBD
              </Link>
            </li>
            <li>
              <Link href="/edukasi#pencegahan" className="text-brand-600 underline underline-offset-4">
                Mencegah DBD dengan 3M Plus
              </Link>
            </li>
            <li>
              <Link href="/layanan" className="text-brand-600 underline underline-offset-4">
                Daftar puskesmas dan rumah sakit
              </Link>
            </li>
            <li>
              <Link href="/riwayat" className="text-brand-600 underline underline-offset-4">
                Riwayat skrining saya
              </Link>
            </li>
          </ul>
        </div>
      </aside>
    </div>
  );
}
