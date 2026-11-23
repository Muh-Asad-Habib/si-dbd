"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Download, LogOut, RefreshCw } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { RiskLevel } from "@/lib/scoring";
import { GATE_HEADER } from "@/lib/admin-gate";
import { LEVEL_STYLE, LevelBadge } from "@/components/LevelBadge";

type Props = {
  gate: string;
  total: number;
  levels: Record<RiskLevel, number>;
  byKec: { kec: string; n: number }[];
  byDay: { day: string; n: number }[];
  symptoms: { name: string; label: string; n: number }[];
  recent: {
    code: string;
    createdAt: string;
    age: number;
    gender: string;
    kecamatan: string;
    kelurahan: string;
    level: RiskLevel;
    componentsMet: number;
  }[];
};

const LEVEL_ORDER: RiskLevel[] = ["merah", "kuning", "hijau"];
const TABS = [
  { id: "ringkasan", label: "Ringkasan" },
  { id: "wilayah", label: "Wilayah" },
  { id: "gejala", label: "Gejala" },
  { id: "terbaru", label: "Terbaru" },
] as const;
type Tab = (typeof TABS)[number]["id"];

function fmtTime(iso: string) {
  return new Date(iso).toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function AdminDashboard({ gate, total, levels, byKec, byDay, symptoms, recent }: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("ringkasan");
  const [refreshing, setRefreshing] = useState(false);

  async function logout() {
    await fetch("/api/admin/login", { method: "DELETE", headers: { [GATE_HEADER]: gate } });
    router.refresh();
  }

  function refresh() {
    setRefreshing(true);
    router.refresh();
    setTimeout(() => setRefreshing(false), 800);
  }

  const maxKec = Math.max(1, ...byKec.map((k) => k.n));
  const todayKey = new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Makassar" });
  const today = byDay.find((d) => d.day === todayKey)?.n ?? 0;

  return (
    <div data-admin-page className="-mt-2">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-[1.75rem] font-bold leading-tight">Data skrining</h1>
          <p className="text-muted">Semua respons, tanpa identitas.</p>
        </div>
        <button onClick={logout} className="action-btn shrink-0" aria-label="Keluar">
          <LogOut className="h-5 w-5" aria-hidden /> <span className="hidden sm:inline">Keluar</span>
        </button>
      </div>

      {/* Angka utama: selalu terlihat tanpa scroll di HP. */}
      <dl className="mt-5 grid grid-cols-2 gap-px border border-line bg-line sm:grid-cols-4">
        <div className="bg-white p-3">
          <dt className="text-muted">Total responden</dt>
          <dd className="text-[2rem] font-bold leading-tight">{total}</dd>
          <dd className="text-sm text-muted">{today} hari ini</dd>
        </div>
        {LEVEL_ORDER.map((l) => (
          <div key={l} className="border-t-4 bg-white p-3" style={{ borderTopColor: LEVEL_STYLE[l].ring }}>
            <dt className="text-muted">{LEVEL_STYLE[l].short}</dt>
            <dd className={`text-[2rem] font-bold leading-tight ${LEVEL_STYLE[l].text}`}>{levels[l]}</dd>
            <dd className="text-sm text-muted">{total ? Math.round((levels[l] / total) * 100) : 0}% dari total</dd>
          </div>
        ))}
      </dl>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <button onClick={refresh} className="action-btn justify-center">
          <RefreshCw className={`h-5 w-5 ${refreshing ? "animate-spin" : ""}`} aria-hidden /> Muat ulang
        </button>
        <a href="/api/admin/export" className="action-btn justify-center">
          <Download className="h-5 w-5" aria-hidden /> Unduh CSV
        </a>
      </div>

      {/* Tab menempel di atas saat scroll agar mudah dipakai satu tangan. */}
      <div
        role="tablist"
        aria-label="Bagian data"
        className="sticky top-0 z-30 -mx-4 mt-6 flex overflow-x-auto border-b-2 border-line bg-paper px-4"
      >
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            id={`tab-${t.id}`}
            aria-selected={tab === t.id}
            aria-controls={`panel-${t.id}`}
            onClick={() => setTab(t.id)}
            className={`-mb-0.5 min-h-12 shrink-0 border-b-4 px-3 text-lg ${
              tab === t.id ? "border-brand-600 font-bold text-ink" : "border-transparent text-brand-600 underline underline-offset-4"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} className="pt-5">
        {tab === "ringkasan" && (
          <section>
            <h2 className="text-xl font-bold">Respons 30 hari terakhir</h2>
            {byDay.length === 0 ? (
              <Empty />
            ) : (
              <div className="mt-3 h-56 bg-white p-2 sm:h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={byDay} margin={{ left: -18, right: 4, top: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#d8dde0" />
                    <XAxis dataKey="day" tickFormatter={(d: string) => d.slice(8)} fontSize={12} />
                    <YAxis allowDecimals={false} fontSize={12} />
                    <Tooltip labelFormatter={(d) => String(d)} />
                    <Bar dataKey="n" name="Respons" fill="#0b4f8a" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            <h2 className="mt-8 text-xl font-bold">Komposisi tingkat risiko</h2>
            <div className="mt-3 flex h-8 w-full overflow-hidden border-2 border-ink bg-white" aria-hidden>
              {LEVEL_ORDER.map((l) =>
                levels[l] ? (
                  <div key={l} style={{ width: `${(levels[l] / Math.max(1, total)) * 100}%`, background: LEVEL_STYLE[l].ring }} />
                ) : null,
              )}
            </div>
            <ul className="mt-3 space-y-1 text-lg">
              {LEVEL_ORDER.map((l) => (
                <li key={l} className="flex justify-between border-b border-line py-1.5">
                  <span>{LEVEL_STYLE[l].short}</span>
                  <b>{levels[l]}</b>
                </li>
              ))}
            </ul>
          </section>
        )}

        {tab === "wilayah" && (
          <section>
            <h2 className="text-xl font-bold">Kecamatan dengan respons terbanyak</h2>
            {byKec.length === 0 ? (
              <Empty />
            ) : (
              <ol className="mt-3">
                {byKec.map((k, i) => (
                  <li key={k.kec} className="border-b border-line py-3">
                    <div className="flex justify-between gap-3 text-lg">
                      <span>
                        <span className="text-muted">{i + 1}.</span> {k.kec}
                      </span>
                      <b>{k.n}</b>
                    </div>
                    <div className="mt-1.5 h-2.5 bg-brand-100">
                      <div className="h-full bg-brand-600" style={{ width: `${(k.n / maxKec) * 100}%` }} />
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </section>
        )}

        {tab === "gejala" && (
          <section>
            <h2 className="text-xl font-bold">Jumlah jawaban &quot;Ya&quot; per pertanyaan</h2>
            <p className="mt-1 text-muted">Merah = tanda bahaya (pertanyaan 6–10).</p>
            <ol className="mt-3">
              {symptoms.map((s, i) => {
                const max = Math.max(1, ...symptoms.map((x) => x.n));
                const danger = i >= 5;
                return (
                  <li key={s.name} className="border-b border-line py-3">
                    <div className="flex justify-between gap-3">
                      <span>
                        <b>{i + 1}.</b> {s.label}
                      </span>
                      <b className={`text-lg ${danger ? "text-[#a00d25]" : ""}`}>{s.n}</b>
                    </div>
                    <div className="mt-1.5 h-2.5 bg-line/60">
                      <div
                        className="h-full"
                        style={{ width: `${(s.n / max) * 100}%`, background: danger ? "#c8102e" : "#e0a100" }}
                      />
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>
        )}

        {tab === "terbaru" && (
          <section>
            <h2 className="text-xl font-bold">15 respons terbaru</h2>
            {recent.length === 0 ? (
              <Empty />
            ) : (
              <>
                {/* HP: daftar kartu */}
                <ul className="mt-3 sm:hidden">
                  {recent.map((r) => (
                    <li key={r.code} className="border-b border-line py-3">
                      <div className="flex items-center justify-between gap-2">
                        <Link href={`/hasil/${r.code}`} className="font-mono text-lg font-bold text-brand-600 underline underline-offset-4">
                          {r.code}
                        </Link>
                        <LevelBadge level={r.level} />
                      </div>
                      <p className="mt-1">
                        {r.age} th · {r.gender === "Laki-laki" ? "Laki-laki" : "Perempuan"} · {r.componentsMet}/4 komponen
                      </p>
                      <p className="text-muted">
                        {r.kelurahan}, {r.kecamatan} · {fmtTime(r.createdAt)}
                      </p>
                    </li>
                  ))}
                </ul>
                {/* Tablet/desktop: tabel */}
                <div className="mt-3 hidden overflow-x-auto bg-white sm:block">
                  <table className="w-full text-left">
                    <thead className="border-b-2 border-ink">
                      <tr>
                        <th className="p-2">Kode</th>
                        <th className="p-2">Waktu</th>
                        <th className="p-2">Usia/JK</th>
                        <th className="p-2">Domisili</th>
                        <th className="p-2">Komp.</th>
                        <th className="p-2">Risiko</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recent.map((r) => (
                        <tr key={r.code} className="border-b border-line">
                          <td className="p-2 font-mono">
                            <Link href={`/hasil/${r.code}`} className="text-brand-600 underline underline-offset-4">
                              {r.code}
                            </Link>
                          </td>
                          <td className="p-2">{fmtTime(r.createdAt)}</td>
                          <td className="p-2">
                            {r.age} · {r.gender === "Laki-laki" ? "L" : "P"}
                          </td>
                          <td className="p-2">
                            {r.kelurahan}, {r.kecamatan}
                          </td>
                          <td className="p-2">{r.componentsMet}/4</td>
                          <td className="p-2">
                            <LevelBadge level={r.level} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </section>
        )}
      </div>
    </div>
  );
}

function Empty() {
  return <p className="mt-3 border-l-8 border-line py-2 pl-4 text-lg text-muted">Belum ada data.</p>;
}
