import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { responses } from "@/lib/schema";
import { CODE_PATTERN } from "@/lib/code";
import { LEVEL_INFO, score } from "@/lib/scoring";
import { QUESTIONS } from "@/lib/questions";
import { ResultActions } from "@/components/ResultActions";

export const dynamic = "force-dynamic";

const CARE_TIPS = [
  { title: "Minum yang banyak.", text: "2–3 liter sehari: air putih, oralit, jus buah, susu, atau sup." },
  {
    title: "Untuk demam, pakai parasetamol saja.",
    text: "Jangan minum aspirin, ibuprofen, atau obat antinyeri lain karena bisa memicu perdarahan.",
  },
  { title: "Catat suhu tubuh", text: "setiap 4–6 jam. Kompres hangat di dahi dan ketiak." },
  {
    title: "Tetap waspada saat demam turun.",
    text: "Hari ke-3 sampai ke-5 adalah fase kritis. Tanda bahaya sering muncul justru saat demam mereda.",
  },
];

// Warna panel hasil: kontras teks putih ≥ 4.5:1.
const PANEL = {
  merah: "bg-[#c8102e] text-white",
  kuning: "bg-[#ffdd00] text-ink",
  hijau: "bg-go-600 text-white",
} as const;

export default async function HasilPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  if (!CODE_PATTERN.test(code)) notFound();

  const [row] = await getDb().select().from(responses).where(eq(responses.code, code)).limit(1);
  if (!row) notFound();

  const result = score(row.answers);
  const info = LEVEL_INFO[result.level];
  const yesList = QUESTIONS.filter((_, i) => row.answers[i]);
  const date = new Intl.DateTimeFormat("id-ID", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Asia/Makassar",
  }).format(row.createdAt);

  return (
    <div className="max-w-2xl">
      <div className={`rounded-md p-6 text-center sm:p-8 ${PANEL[result.level]}`}>
        <p className="text-lg">Hasil skrining DBD</p>
        <h1 className="mt-1 page-title">{info.title}</h1>
        <p className="mt-4 text-xl">
          <b className="text-[2.5rem] leading-none">{result.componentsMet}</b>
          <span className="text-2xl"> / 4</span>
          <span className="block">komponen gejala terpenuhi</span>
        </p>
        <p className="mt-4 text-lg">
          Kode hasil: <b className="font-mono tracking-wider">{row.code}</b>
        </p>
      </div>
      <p className="mt-2 text-muted">{date} WITA</p>

      {result.warningSigns && (
        <div role="alert" className="mt-6 border-l-8 border-[#c8102e] bg-[#fdf1f2] p-4">
          <p className="text-xl font-bold text-[#8a0b20]">Ada tanda bahaya. Jangan menunda.</p>
          <p className="mt-1 text-lg">Segera ke IGD rumah sakit terdekat atau telepon 112.</p>
          <a
            href="tel:112"
            className="btn mt-4 w-full bg-[#c8102e] text-white shadow-[0_4px_0_#7a0a1c] hover:bg-[#a00d25] sm:w-auto"
          >
            Telepon 112 sekarang
          </a>
        </div>
      )}

      <h2 className="mt-8 text-2xl font-bold">Apa artinya</h2>
      <p className="mt-2 text-lg">{info.interpretation}</p>

      <h2 className="mt-8 text-2xl font-bold">Yang harus Anda lakukan</h2>
      <ol className="mt-3 list-decimal space-y-3 pl-7 text-lg marker:font-bold">
        {info.recommendations.map((r) => (
          <li key={r} className="pl-1">
            {r}
          </li>
        ))}
      </ol>
      <Link href="/layanan" className="btn-go no-print mt-6 w-full text-xl sm:w-auto">
        Cari puskesmas atau rumah sakit
      </Link>

      <h2 className="mt-10 text-2xl font-bold">Rincian skrining</h2>
      <dl className="mt-3 border-t border-line">
        {result.components.map((c) => (
          <div key={c.key} className="grid grid-cols-[1fr_auto] gap-x-4 border-b border-line py-3">
            <dt>
              <span className="text-lg font-bold">{c.label}</span>
              <span className="block text-muted">{c.description}</span>
            </dt>
            <dd
              className={`self-start text-lg font-bold ${
                c.met ? (c.key === "bahaya" ? "text-[#a00d25]" : "text-ink") : "text-muted"
              }`}
            >
              {c.met ? "Ya" : "Tidak"}
            </dd>
          </div>
        ))}
      </dl>

      {yesList.length > 0 && (
        <>
          <h3 className="mt-6 text-xl font-bold">Gejala yang Anda jawab &quot;Ya&quot;</h3>
          <ul className="mt-2 list-disc space-y-1 pl-7 text-lg">
            {yesList.map((q) => (
              <li key={q.id}>
                {q.text.replace(/^Apakah (Anda )?(mengalami )?/i, "").replace(/\?$/, "")}
                {q.warning && <b className="text-[#a00d25]"> (tanda bahaya)</b>}
              </li>
            ))}
          </ul>
        </>
      )}

      <h2 className="mt-10 text-2xl font-bold">Merawat di rumah sambil menunggu pemeriksaan</h2>
      <ul className="mt-3 list-disc space-y-3 pl-7 text-lg">
        {CARE_TIPS.map((t) => (
          <li key={t.title}>
            <b>{t.title}</b> {t.text}
          </li>
        ))}
      </ul>
      <p className="no-print mt-4 text-lg">
        <Link href="/edukasi" className="text-brand-600 underline underline-offset-4">
          Baca selengkapnya tentang DBD dan cara mencegahnya
        </Link>
      </p>

      <hr className="my-10 border-t-2 border-line" />

      <ResultActions code={row.code} level={result.level} componentsMet={result.componentsMet} />

      <p className="mt-10 border-l-8 border-line pl-4 text-lg text-muted">
        Hasil skrining ini bukan diagnosis. DBD hanya dapat dipastikan oleh tenaga kesehatan melalui
        pemeriksaan dan tes darah.
      </p>
    </div>
  );
}
