import { desc } from "drizzle-orm";
import { isAdmin } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { responses } from "@/lib/schema";
import { QUESTIONS } from "@/lib/questions";

function csvCell(v: unknown) {
  const s = String(v ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export async function GET() {
  if (!(await isAdmin())) return new Response("Unauthorized", { status: 401 });

  const rows = await getDb().select().from(responses).orderBy(desc(responses.createdAt));
  const header = [
    "kode",
    "waktu",
    "usia",
    "jenis_kelamin",
    "kecamatan",
    "kelurahan",
    ...QUESTIONS.map((q) => `Q${q.id}`),
    "komponen_terpenuhi",
    "tingkat_risiko",
    "tanda_bahaya",
  ];
  const lines = rows.map((r) =>
    [
      r.code,
      r.createdAt.toISOString(),
      r.age,
      r.gender,
      r.kecamatan,
      r.kelurahan,
      ...r.answers.map((a) => (a ? "Ya" : "Tidak")),
      r.componentsMet,
      r.riskLevel,
      r.warningSigns ? "Ya" : "Tidak",
    ]
      .map(csvCell)
      .join(","),
  );
  const csv = "\uFEFF" + [header.join(","), ...lines].join("\n");
  const date = new Date().toISOString().slice(0, 10);

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="si-dbd-${date}.csv"`,
    },
  });
}
