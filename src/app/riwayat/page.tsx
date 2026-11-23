"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";
import { store, type HistoryItem } from "@/lib/storage";
import { CODE_PATTERN } from "@/lib/code-pattern";
import type { Profile } from "@/lib/validation";
import { LevelBadge } from "@/components/LevelBadge";
import { StartScreeningButton } from "@/components/ConsentDialog";

export default function RiwayatPage() {
  const router = useRouter();
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [code, setCode] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    setItems(store.getHistory());
    setProfile(store.getProfile());
  }, []);

  function lookup(e: React.FormEvent) {
    e.preventDefault();
    const c = code.trim().toUpperCase();
    if (!CODE_PATTERN.test(c)) {
      setErr("Kode tidak sesuai. Contoh kode: DBD-250101-A1B2C3");
      document.getElementById("kode")?.focus();
      return;
    }
    router.push(`/hasil/${c}`);
  }

  function forgetProfile() {
    if (!confirm("Hapus data usia, jenis kelamin, dan wilayah dari HP ini?")) return;
    store.clearProfile();
    setProfile(null);
  }

  function clearAll() {
    if (!confirm("Hapus semua riwayat dan data yang tersimpan di HP ini?")) return;
    store.clearAll();
    setItems([]);
    setProfile(null);
  }

  const link = "min-h-12 text-lg text-brand-600 underline underline-offset-4";

  return (
    <div className="max-w-2xl">
      <h1 className="page-title">Riwayat skrining</h1>
      <p className="mt-3 text-xl">Hasil skrining yang pernah diisi di HP ini.</p>

      <section aria-labelledby="daftar" className="mt-8">
        <h2 id="daftar" className="text-2xl font-bold">
          Hasil sebelumnya
        </h2>
        {items.length === 0 ? (
          <div className="mt-3">
            <p className="text-lg">Belum ada hasil skrining di HP ini.</p>
            <StartScreeningButton className="btn-go mt-4 w-full px-6 text-xl sm:w-auto">
              Mulai skrining <ChevronRight className="h-6 w-6" strokeWidth={3} aria-hidden />
            </StartScreeningButton>
          </div>
        ) : (
          <ul className="mt-3 border-t border-line">
            {items.map((h) => (
              <li key={h.code} className="border-b border-line">
                <Link
                  href={`/hasil/${h.code}`}
                  className="flex min-h-16 items-center justify-between gap-3 py-3 hover:bg-white"
                >
                  <span>
                    <span className="block font-mono text-lg font-bold text-brand-600 underline underline-offset-4">
                      {h.code}
                    </span>
                    <span className="block text-muted">
                      {new Date(h.date).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}
                      {" · "}
                      {h.componentsMet}/4 komponen
                    </span>
                  </span>
                  <LevelBadge level={h.level} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="cari" className="mt-10">
        <h2 id="cari" className="text-2xl font-bold">
          Cari hasil dengan kode
        </h2>
        <form onSubmit={lookup} noValidate className={`mt-3 ${err ? "border-l-8 border-[#c8102e] pl-4" : ""}`}>
          <label htmlFor="kode" className="block text-lg font-bold">
            Kode hasil
          </label>
          <p id="kode-hint" className="text-muted">
            Contoh: DBD-250101-A1B2C3
          </p>
          {err && (
            <p id="kode-err" className="mt-1 text-lg font-bold text-[#c8102e]">
              {err}
            </p>
          )}
          <input
            id="kode"
            value={code}
            autoCapitalize="characters"
            autoComplete="off"
            spellCheck={false}
            aria-describedby={err ? "kode-hint kode-err" : "kode-hint"}
            aria-invalid={!!err}
            onChange={(e) => {
              setCode(e.target.value);
              setErr("");
            }}
            className="input mt-2 font-mono uppercase"
          />
          <button className="btn-primary mt-4 w-full sm:w-auto">Cari hasil</button>
        </form>
      </section>

      <section aria-labelledby="data" className="mt-10">
        <h2 id="data" className="text-2xl font-bold">
          Data yang tersimpan di HP ini
        </h2>
        {profile ? (
          <p className="mt-3 text-lg">
            {profile.name}, {profile.age} tahun, {profile.gender.toLowerCase()}, {profile.kelurahan}, {profile.kecamatan}.
          </p>
        ) : (
          <p className="mt-3 text-lg">Tidak ada data responden tersimpan.</p>
        )}
        <ul className="mt-2">
          {profile && (
            <li>
              <button onClick={forgetProfile} className={link}>
                Hapus data responden (untuk mengisi data orang lain)
              </button>
            </li>
          )}
          {(items.length > 0 || profile) && (
            <li>
              <button onClick={clearAll} className="min-h-12 text-lg text-[#a00d25] underline underline-offset-4">
                Hapus semua data di HP ini
              </button>
            </li>
          )}
        </ul>
      </section>
    </div>
  );
}
