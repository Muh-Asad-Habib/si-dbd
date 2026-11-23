"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  BookOpen,
  Check,
  ChevronRight,
  Clock,
  Droplets,
  History,
  Hospital,
  ListChecks,
  Phone,
  ShieldCheck,
} from "lucide-react";
import { store, type HistoryItem } from "@/lib/storage";
import type { Profile } from "@/lib/validation";
import { LevelBadge } from "@/components/LevelBadge";
import { StartScreeningButton } from "@/components/ConsentDialog";

const USE_IF = [
  "Demam mendadak dalam 2–7 hari terakhir",
  "Sakit kepala, nyeri di belakang mata, atau badan pegal",
  "Muncul bintik merah di kulit",
  "Ada kasus DBD di rumah, sekolah, atau lingkungan",
];

const STEPS = [
  { t: "Setujui", d: "Baca penjelasan singkat dan beri persetujuan." },
  { t: "Isi data singkat", d: "Nama, usia, jenis kelamin, dan wilayah." },
  { t: "Jawab 10 pertanyaan", d: "Cukup pilih Ya atau Tidak." },
  { t: "Lihat hasil", d: "Dapatkan saran tindak lanjut dan edukasi." },
];

const DANGER = [
  "Nyeri perut hebat",
  "Muntah terus-menerus atau tidak bisa minum",
  "Mimisan, gusi berdarah, muntah darah, atau BAB hitam",
  "Sangat lemas, gelisah, atau sulit dibangunkan",
  "Tangan-kaki dingin, sesak napas, atau jarang buang air kecil",
];

const LINKS = [
  { href: "/edukasi", icon: BookOpen, t: "Kenali DBD", d: "Gejala, fase kritis, dan perawatan di rumah" },
  { href: "/edukasi#pencegahan", icon: Droplets, t: "Cegah dengan 3M Plus", d: "Langkah sederhana memutus jentik nyamuk" },
  { href: "/layanan", icon: Hospital, t: "Fasilitas kesehatan", d: "Puskesmas dan rumah sakit terdekat" },
  { href: "/riwayat", icon: History, t: "Riwayat saya", d: "Hasil skrining yang tersimpan di HP ini" },
];

const FAQ = [
  {
    q: "Apakah skrining ini bisa memastikan saya terkena DBD?",
    a: "Tidak. Skrining membantu menilai apakah gejala Anda perlu diperiksa. Kepastian DBD memerlukan pemeriksaan dokter dan tes darah.",
  },
  {
    q: "Bolehkah saya mengisi untuk anak atau orang tua?",
    a: "Boleh. Jawab sesuai kondisi orang yang diperiksa. Pilih \"Ganti orang\" agar datanya tidak tercampur.",
  },
  {
    q: "Kenapa lain kali saya tidak perlu mengisi data lagi?",
    a: "Nama, usia, jenis kelamin, dan wilayah disimpan di HP Anda sendiri. Anda bisa menghapusnya di menu Riwayat.",
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
    <div className="space-y-10">
      <section aria-labelledby="judul" className="grid items-start gap-6 md:grid-cols-[minmax(0,1fr)_19rem] md:gap-10">
        <div>
          <p className="font-bold text-brand-600">Skrining mandiri · Gratis</p>
          <h1 id="judul" className="page-title mt-1">
            Cek gejala Demam Berdarah Dengue
          </h1>
          <p className="mt-3 max-w-xl text-lg leading-relaxed text-ink/90">
            Jawab 10 pertanyaan singkat untuk mengetahui apakah gejala perlu diperiksa ke puskesmas,
            atau harus segera ke IGD.
          </p>

          <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-muted">
            <li className="inline-flex items-center gap-1.5">
              <Clock className="h-[1.1em] w-[1.1em]" aria-hidden /> ± 2 menit
            </li>
            <li className="inline-flex items-center gap-1.5">
              <ListChecks className="h-[1.1em] w-[1.1em]" aria-hidden /> Pilihan Ya / Tidak
            </li>
            <li className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-[1.1em] w-[1.1em]" aria-hidden /> Tanpa NIK &amp; nomor HP
            </li>
          </ul>

          <StartScreeningButton className="btn-go mt-6 w-full px-6 text-lg sm:w-auto">
            Mulai skrining <ChevronRight className="h-5 w-5" strokeWidth={3} aria-hidden />
          </StartScreeningButton>

          {profile && (
            <p className="mt-3 text-muted">
              Data tersimpan: <b className="text-ink">{profile.name}</b>, {profile.age} th, {profile.gender.toLowerCase()}, {profile.kelurahan}. Tidak perlu
              diisi ulang.
            </p>
          )}

          {last && (
            <Link
              href={`/hasil/${last.code}`}
              className="mt-5 flex items-center justify-between gap-3 rounded-md border border-line bg-white p-3 hover:border-brand-600"
            >
              <span className="min-w-0">
                <span className="block text-sm text-muted">Hasil terakhir</span>
                <span className="block truncate font-mono font-bold text-brand-600">{last.code}</span>
              </span>
              <LevelBadge level={last.level} />
            </Link>
          )}
        </div>

        <div className="rounded-md border border-line bg-white p-5">
          <h2 className="font-bold">Cara kerjanya</h2>
          <ol className="mt-3 space-y-0">
            {STEPS.map((s, i) => (
              <li key={s.t} className="relative flex gap-3 pb-4 last:pb-0">
                {i < STEPS.length - 1 && (
                  <span aria-hidden className="absolute left-[0.9375rem] top-8 h-[calc(100%-2rem)] w-0.5 bg-line" />
                )}
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-brand-600 bg-white text-sm font-bold text-brand-600">
                  {i + 1}
                </span>
                <span className="pt-0.5">
                  <span className="block font-bold leading-snug">{s.t}</span>
                  <span className="block text-[0.95rem] leading-snug text-muted">{s.d}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section aria-labelledby="kapan" className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-md border border-line bg-white p-5">
          <h2 id="kapan" className="text-xl font-bold">
            Lakukan skrining bila mengalami
          </h2>
          <ul className="mt-3 space-y-2.5">
            {USE_IF.map((t) => (
              <li key={t} className="flex gap-2.5">
                <Check className="mt-1 h-5 w-5 shrink-0 text-go-600" strokeWidth={3} aria-hidden />
                <span>{t}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 border-t border-line pt-3 text-muted">
            Boleh diisi untuk anak atau anggota keluarga.
          </p>
        </div>

        {/* Tanda bahaya: harus terlihat sebelum orang menunggu hasil skrining. */}
        <div className="rounded-md border-2 border-[#c8102e] bg-white">
          <h2 className="bg-[#c8102e] px-5 py-3 text-lg font-bold leading-snug text-white">
            Jangan tunggu skrining. Segera ke IGD bila ada:
          </h2>
          <div className="p-5">
            <ul className="space-y-2">
              {DANGER.map((d) => (
                <li key={d} className="flex gap-2.5">
                  <span aria-hidden className="mt-2.5 h-2 w-2 shrink-0 rounded-full bg-[#c8102e]" />
                  <span>{d}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <a
                href="tel:112"
                className="btn bg-[#c8102e] text-white shadow-[0_4px_0_#7a0a1c] hover:bg-[#a00d25]"
              >
                <Phone className="h-5 w-5" aria-hidden /> 112
              </a>
              <a href="tel:119" className="btn border-2 border-[#c8102e] bg-white text-[#a00d25] hover:bg-[#fdf1f2]">
                <Phone className="h-5 w-5" aria-hidden /> Ambulans 119
              </a>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="terkait">
        <h2 id="terkait" className="text-xl font-bold">
          Informasi terkait
        </h2>
        <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {LINKS.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="group flex h-full items-start gap-3 rounded-md border border-line bg-white p-4 hover:border-brand-600"
              >
                <l.icon className="mt-0.5 h-6 w-6 shrink-0 text-brand-600" aria-hidden />
                <span className="min-w-0 flex-1">
                  <span className="block font-bold text-brand-600 group-hover:underline group-hover:underline-offset-4">
                    {l.t}
                  </span>
                  <span className="block text-[0.95rem] leading-snug text-muted">{l.d}</span>
                </span>
                <ChevronRight className="mt-0.5 h-5 w-5 shrink-0 text-muted lg:hidden" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="faq" className="max-w-3xl">
        <h2 id="faq" className="text-xl font-bold">
          Pertanyaan umum
        </h2>
        <div className="mt-3 rounded-md border border-line bg-white">
          {FAQ.map((f, i) => (
            <details key={f.q} className={`group ${i ? "border-t border-line" : ""}`}>
              <summary className="flex min-h-14 list-none items-center gap-3 px-4 py-3 font-bold [&::-webkit-details-marker]:hidden">
                <span className="flex-1">{f.q}</span>
                <ChevronRight
                  className="h-5 w-5 shrink-0 text-brand-600 transition-transform group-open:rotate-90"
                  strokeWidth={3}
                  aria-hidden
                />
              </summary>
              <p className="px-4 pb-4 text-ink/90">{f.a}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
