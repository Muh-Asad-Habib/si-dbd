"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AlertTriangle, ChevronRight, Download, Loader2, LogOut, RefreshCw, Trash2 } from "lucide-react";
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
    id: string;
    code: string;
    name: string;
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
type Row = Props["recent"][number];
type Pending = { kind: "one"; row: Row } | { kind: "all" } | null;

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
  const [filter, setFilter] = useState<"semua" | RiskLevel>("semua");
  const [pending, setPending] = useState<Pending>(null);
  const [notice, setNotice] = useState("");

  async function remove(target: NonNullable<Pending>) {
    const body = target.kind === "one" ? { id: target.row.id } : { all: true, confirm: "HAPUS" };
    const res = await fetch("/api/admin/responses", {
      method: "DELETE",
      headers: { "content-type": "application/json", [GATE_HEADER]: gate },
      body: JSON.stringify(body),
    });
    const data = (await res.json().catch(() => ({}))) as { deleted?: number; error?: string };
    if (!res.ok) throw new Error(data.error ?? "Gagal menghapus. Coba lagi.");
    setPending(null);
    setNotice(
      target.kind === "one"
        ? `Data ${target.row.name || target.row.code} sudah dihapus.`
        : `${data.deleted ?? 0} data responden sudah dihapus.`,
    );
    router.refresh();
  }

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
  const maxSym = Math.max(1, ...symptoms.map((x) => x.n));
  const todayKey = new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Makassar" });
  const today = byDay.find((d) => d.day === todayKey)?.n ?? 0;
  const urgentRecent = recent.filter((r) => r.level === "merah").length;
  const shown = filter === "semua" ? recent : recent.filter((r) => r.level === filter);
  // HP: satu panel per tab. Desktop: semua panel tampil dalam grid.
  const vis = (id: Tab) => (tab === id ? "block" : "hidden lg:block");

  return (
    <div data-admin-page>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="page-title">Data skrining</h1>
          <p className="text-muted">Hanya untuk petugas. Jangan bagikan data responden.</p>
        </div>
        <div className="grid w-full grid-cols-3 gap-2 sm:w-auto sm:flex">
          <button onClick={refresh} className="tool-btn">
            <RefreshCw className={`h-5 w-5 ${refreshing ? "animate-spin" : ""}`} aria-hidden /> Muat ulang
          </button>
          <a href="/api/admin/export" className="tool-btn">
            <Download className="h-5 w-5" aria-hidden /> CSV
          </a>
          <button onClick={logout} className="tool-btn">
            <LogOut className="h-5 w-5" aria-hidden /> Keluar
          </button>
        </div>
      </div>

      <dl className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-md border border-line bg-white p-4">
          <dt className="text-sm font-bold text-muted">Total responden</dt>
          <dd className="mt-1 text-[1.75rem] font-bold leading-none">{total}</dd>
          <dd className="mt-2 text-sm text-muted">
            <b className="text-ink">{today}</b> hari ini
          </dd>
        </div>
        {LEVEL_ORDER.map((l) => (
          <div key={l} className="rounded-md border border-line border-l-[6px] bg-white p-4" style={{ borderLeftColor: LEVEL_STYLE[l].ring }}>
            <dt className="text-sm font-bold text-muted">{LEVEL_STYLE[l].short}</dt>
            <dd className={`mt-1 text-[1.75rem] font-bold leading-none ${LEVEL_STYLE[l].text}`}>{levels[l]}</dd>
            <dd className="mt-2 text-sm text-muted">{total ? Math.round((levels[l] / total) * 100) : 0}% dari total</dd>
          </div>
        ))}
      </dl>

      {urgentRecent > 0 && (
        <button
          onClick={() => {
            setTab("terbaru");
            setFilter("merah");
            document.getElementById("panel-terbaru")?.scrollIntoView({ block: "start" });
          }}
          className="mt-3 flex w-full items-center gap-3 rounded-md border-2 border-[#c8102e] bg-[#fdf1f2] p-3 text-left"
        >
          <AlertTriangle className="h-6 w-6 shrink-0 text-[#c8102e]" aria-hidden />
          <span className="flex-1">
            <b>{urgentRecent} respons perlu segera ditangani</b>
            <span className="block text-sm text-muted">dari 15 respons terbaru. Ketuk untuk melihat.</span>
          </span>
          <ChevronRight className="h-5 w-5 shrink-0 text-[#a00d25]" aria-hidden />
        </button>
      )}

      <div
        role="tablist"
        aria-label="Bagian data"
        className="sticky top-0 z-30 -mx-4 mt-6 flex overflow-x-auto border-b border-line bg-paper px-4 lg:hidden"
      >
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            id={`tab-${t.id}`}
            aria-selected={tab === t.id}
            aria-controls={`panel-${t.id}`}
            onClick={() => setTab(t.id)}
            className={`-mb-px min-h-12 flex-1 shrink-0 border-b-4 px-3 font-bold ${
              tab === t.id ? "border-brand-600 text-ink" : "border-transparent text-muted"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:mt-6 lg:grid-cols-2">
        <section id="panel-ringkasan" role="tabpanel" aria-labelledby="tab-ringkasan" className={`panel scroll-mt-16 lg:col-span-2 ${vis("ringkasan")}`}>
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
            <div>
              <h2 className="font-bold">Respons 30 hari terakhir</h2>
              {byDay.length === 0 ? (
                <Empty />
              ) : (
                <div className="mt-3 h-52 sm:h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={byDay} margin={{ left: -22, right: 4, top: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#d8dde0" />
                      <XAxis dataKey="day" tickFormatter={(d: string) => d.slice(8)} fontSize={12} tickLine={false} />
                      <YAxis allowDecimals={false} fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip labelFormatter={(d) => String(d)} cursor={{ fill: "#eef4fa" }} />
                      <Bar dataKey="n" name="Respons" fill="#0b4f8a" radius={[3, 3, 0, 0]} maxBarSize={36} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
            <div>
              <h2 className="font-bold">Komposisi tingkat risiko</h2>
              <div className="mt-3 flex h-3 w-full overflow-hidden rounded-full bg-line" aria-hidden>
                {LEVEL_ORDER.map((l) =>
                  levels[l] ? (
                    <div key={l} style={{ width: `${(levels[l] / Math.max(1, total)) * 100}%`, background: LEVEL_STYLE[l].ring }} />
                  ) : null,
                )}
              </div>
              <ul className="mt-3">
                {LEVEL_ORDER.map((l) => (
                  <li key={l} className="flex items-center gap-2 border-b border-line py-2 last:border-0">
                    <span aria-hidden className="h-3 w-3 rounded-full" style={{ background: LEVEL_STYLE[l].ring }} />
                    <span className="flex-1">{LEVEL_STYLE[l].short}</span>
                    <b>{levels[l]}</b>
                    <span className="w-11 text-right text-sm text-muted">
                      {total ? Math.round((levels[l] / total) * 100) : 0}%
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section id="panel-wilayah" role="tabpanel" aria-labelledby="tab-wilayah" className={`panel scroll-mt-16 ${vis("wilayah")}`}>
          <h2 className="font-bold">Kecamatan dengan respons terbanyak</h2>
          {byKec.length === 0 ? (
            <Empty />
          ) : (
            <ol className="mt-2">
              {byKec.map((k, i) => (
                <li key={k.kec} className="border-b border-line py-2.5 last:border-0">
                  <div className="flex justify-between gap-3">
                    <span>
                      <span className="inline-block w-6 text-muted">{i + 1}.</span>
                      {k.kec}
                    </span>
                    <b>{k.n}</b>
                  </div>
                  <div className="ml-6 mt-1.5 h-2 overflow-hidden rounded-full bg-brand-50">
                    <div className="h-full rounded-full bg-brand-600" style={{ width: `${(k.n / maxKec) * 100}%` }} />
                  </div>
                </li>
              ))}
            </ol>
          )}
        </section>

        <section id="panel-gejala" role="tabpanel" aria-labelledby="tab-gejala" className={`panel scroll-mt-16 ${vis("gejala")}`}>
          <h2 className="font-bold">Jawaban &quot;Ya&quot; per pertanyaan</h2>
          <p className="text-sm text-muted">Merah = tanda bahaya (pertanyaan 6–10).</p>
          <ol className="mt-2">
            {symptoms.map((s, i) => {
              const danger = i >= 5;
              return (
                <li key={s.name} className="border-b border-line py-2.5 last:border-0">
                  <div className="flex justify-between gap-3">
                    <span className="text-[0.95rem] leading-snug">
                      <b className="inline-block w-6">{i + 1}.</b>
                      {s.label}
                    </span>
                    <b className={danger ? "text-[#a00d25]" : ""}>{s.n}</b>
                  </div>
                  <div className="ml-6 mt-1.5 h-2 overflow-hidden rounded-full bg-paper">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${(s.n / maxSym) * 100}%`, background: danger ? "#c8102e" : "#e0a100" }}
                    />
                  </div>
                </li>
              );
            })}
          </ol>
        </section>

        <section id="panel-terbaru" role="tabpanel" aria-labelledby="tab-terbaru" className={`panel scroll-mt-16 lg:col-span-2 ${vis("terbaru")}`}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-bold">15 respons terbaru</h2>
            <div className="flex flex-wrap gap-1.5" role="group" aria-label="Saring tingkat risiko">
              {(["semua", ...LEVEL_ORDER] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  aria-pressed={filter === f}
                  className={`min-h-9 rounded-full border px-3 text-sm font-bold ${
                    filter === f ? "border-brand-600 bg-brand-600 text-white" : "border-line bg-white text-ink hover:border-brand-600"
                  }`}
                >
                  {f === "semua" ? "Semua" : LEVEL_STYLE[f].short}
                </button>
              ))}
            </div>
          </div>
          {shown.length === 0 ? (
            <Empty />
          ) : (
            <>
              <ul className="mt-2 sm:hidden">
                {shown.map((r) => (
                  <li key={r.code} className="border-b border-line py-3 last:border-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="min-w-0 break-words text-lg font-bold leading-snug">{r.name || "(tanpa nama)"}</p>
                      <LevelBadge level={r.level} />
                    </div>
                    <p className="mt-1 text-[0.95rem]">
                      {r.age} th · {r.gender} · {r.componentsMet}/4 komponen
                    </p>
                    <p className="text-sm text-muted">
                      {r.kelurahan}, {r.kecamatan} · {fmtTime(r.createdAt)}
                    </p>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <Link href={`/hasil/${r.code}`} className="inline-flex min-h-11 items-center font-mono font-bold text-brand-600 underline underline-offset-4">
                        {r.code}
                      </Link>
                      <button onClick={() => setPending({ kind: "one", row: r })} className="del-btn">
                        <Trash2 className="h-4 w-4" aria-hidden /> Hapus<span className="sr-only"> data {r.name || r.code}</span>
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-3 hidden overflow-x-auto sm:block">
                <table className="w-full text-left text-[0.95rem]">
                  <thead className="border-b-2 border-line text-sm text-muted">
                    <tr>
                      <th className="py-2 pr-3 font-bold">Nama</th>
                      <th className="py-2 pr-3 font-bold">Kode</th>
                      <th className="py-2 pr-3 font-bold">Waktu</th>
                      <th className="py-2 pr-3 font-bold">Usia/JK</th>
                      <th className="py-2 pr-3 font-bold">Domisili</th>
                      <th className="py-2 pr-3 font-bold">Komp.</th>
                      <th className="py-2 pr-3 font-bold">Risiko</th>
                      <th className="py-2 font-bold"><span className="sr-only">Aksi</span></th>
                    </tr>
                  </thead>
                  <tbody>
                    {shown.map((r) => (
                      <tr key={r.code} className="border-b border-line last:border-0 hover:bg-paper">
                        <td className="py-2.5 pr-3 font-bold">{r.name || "(tanpa nama)"}</td>
                        <td className="py-2.5 pr-3 font-mono">
                          <Link href={`/hasil/${r.code}`} className="text-brand-600 underline underline-offset-4">
                            {r.code}
                          </Link>
                        </td>
                        <td className="whitespace-nowrap py-2.5 pr-3">{fmtTime(r.createdAt)}</td>
                        <td className="py-2.5 pr-3">
                          {r.age} · {r.gender === "Laki-laki" ? "L" : "P"}
                        </td>
                        <td className="py-2.5 pr-3">
                          {r.kelurahan}, {r.kecamatan}
                        </td>
                        <td className="py-2.5 pr-3">{r.componentsMet}/4</td>
                        <td className="py-2.5 pr-3">
                          <LevelBadge level={r.level} />
                        </td>
                        <td className="py-2.5 text-right">
                          <button onClick={() => setPending({ kind: "one", row: r })} className="del-btn">
                            <Trash2 className="h-4 w-4" aria-hidden /> Hapus<span className="sr-only"> data {r.name || r.code}</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </section>
      </div>

      <section aria-labelledby="zona-hapus" className="mt-8 rounded-md border-2 border-[#c8102e]/40 bg-white p-4">
        <h2 id="zona-hapus" className="font-bold text-[#a00d25]">Hapus semua data</h2>
        <p className="mt-1 text-[0.95rem] text-muted">
          Untuk membersihkan data uji coba. Semua {total} data responden akan dihapus permanen dan tidak bisa
          dikembalikan. Unduh CSV dulu bila perlu.
        </p>
        <button
          onClick={() => setPending({ kind: "all" })}
          disabled={total === 0}
          className="del-btn mt-3 min-h-12 px-4 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Trash2 className="h-5 w-5" aria-hidden /> Hapus semua data responden
        </button>
      </section>

      <p role="status" aria-live="polite" className={notice ? "fixed inset-x-4 bottom-4 z-50 mx-auto max-w-md rounded-md bg-ink p-3 text-center font-bold text-white shadow-lg" : "sr-only"}>
        {notice}
        {notice && (
          <button onClick={() => setNotice("")} className="ml-3 underline underline-offset-4">
            Tutup
          </button>
        )}
      </p>

      <DeleteDialog
        pending={pending}
        total={total}
        onCancel={() => setPending(null)}
        onConfirm={() => remove(pending!)}
      />
    </div>
  );
}

function DeleteDialog({
  pending,
  total,
  onCancel,
  onConfirm,
}: {
  pending: Pending;
  total: number;
  onCancel: () => void;
  onConfirm: () => Promise<void>;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [typed, setTyped] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (pending && !d.open) {
      setTyped("");
      setErr("");
      d.showModal();
    } else if (!pending && d.open) d.close();
  }, [pending]);

  const all = pending?.kind === "all";
  const ready = !all || typed.trim().toUpperCase() === "HAPUS";

  async function confirm() {
    if (!ready || busy) return;
    setBusy(true);
    setErr("");
    try {
      await onConfirm();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Gagal menghapus.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <dialog
      ref={ref}
      className="consent-dialog"
      aria-labelledby="hapus-judul"
      onCancel={(e) => {
        e.preventDefault();
        if (!busy) onCancel();
      }}
      onClick={(e) => e.target === e.currentTarget && !busy && onCancel()}
    >
      <div className="consent-panel !border-t-[#c8102e]">
        <div className="overflow-y-auto p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-7 w-7 shrink-0 text-[#c8102e]" aria-hidden />
            <div>
              <h2 id="hapus-judul" className="text-xl font-bold">
                {all ? "Hapus semua data responden?" : "Hapus data responden ini?"}
              </h2>
              <p className="mt-1 font-bold text-[#a00d25]">Data yang dihapus tidak bisa dikembalikan.</p>
            </div>
          </div>

          {pending?.kind === "one" && (
            <dl className="mt-4 rounded-md bg-paper p-3 text-[0.95rem]">
              <div className="flex gap-2"><dt className="w-20 shrink-0 text-muted">Nama</dt><dd className="font-bold">{pending.row.name || "(tanpa nama)"}</dd></div>
              <div className="flex gap-2"><dt className="w-20 shrink-0 text-muted">Kode</dt><dd className="font-mono">{pending.row.code}</dd></div>
              <div className="flex gap-2"><dt className="w-20 shrink-0 text-muted">Waktu</dt><dd>{fmtTime(pending.row.createdAt)}</dd></div>
              <div className="flex gap-2"><dt className="w-20 shrink-0 text-muted">Domisili</dt><dd>{pending.row.kelurahan}, {pending.row.kecamatan}</dd></div>
            </dl>
          )}

          {all && (
            <>
              <p className="mt-4">
                Sebanyak <b>{total} data</b> akan dihapus dari database, termasuk statistik dan grafik. Kode hasil
                yang sudah dibagikan tidak bisa dibuka lagi.
              </p>
              <label htmlFor="ketik-hapus" className="mt-4 block font-bold">
                Ketik <span className="font-mono">HAPUS</span> untuk melanjutkan
              </label>
              <input
                id="ketik-hapus"
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                autoComplete="off"
                autoCapitalize="characters"
                className="input mt-2 w-full font-mono text-lg"
              />
            </>
          )}

          {err && (
            <p role="alert" className="mt-3 font-bold text-[#a00d25]">
              {err}
            </p>
          )}
        </div>
        <div className="grid gap-2 border-t border-line p-4 sm:flex sm:flex-row-reverse">
          <button
            onClick={confirm}
            disabled={!ready || busy}
            className="btn min-h-12 bg-[#c8102e] text-white hover:bg-[#a00d25] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden /> : <Trash2 className="h-5 w-5" aria-hidden />}
            {all ? "Ya, hapus semua" : "Ya, hapus"}
          </button>
          <button onClick={onCancel} disabled={busy} autoFocus className="btn btn-ghost min-h-12">
            Batal
          </button>
        </div>
      </div>
    </dialog>
  );
}

function Empty() {
  return <p className="mt-3 rounded-md bg-paper p-4 text-center text-muted">Belum ada data.</p>;
}
