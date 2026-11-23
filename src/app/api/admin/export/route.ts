import ExcelJS from "exceljs";
import { desc } from "drizzle-orm";
import { isAdmin } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { responses } from "@/lib/schema";
import { QUESTIONS } from "@/lib/questions";

export const runtime = "nodejs";

const LEVEL: Record<string, string> = {
  merah: "Segera ditangani",
  kuning: "Perlu diperiksa",
  hijau: "Risiko rendah",
};

function safe(v: string) {
  // Cegah formula injection saat dibuka di Excel.
  return /^[=+\-@\t\r]/.test(v) ? `'${v}` : v;
}

export async function GET() {
  if (!(await isAdmin())) return new Response("Unauthorized", { status: 401 });

  const rows = await getDb().select().from(responses).orderBy(desc(responses.createdAt));

  const wb = new ExcelJS.Workbook();
  wb.creator = "SI-DBD";
  const ws = wb.addWorksheet("Responden", { views: [{ state: "frozen", ySplit: 1 }] });
  ws.columns = [
    { header: "Kode", key: "kode", width: 20 },
    { header: "Waktu (WITA)", key: "waktu", width: 18, style: { numFmt: "dd/mm/yyyy hh:mm" } },
    { header: "Nama", key: "nama", width: 24 },
    { header: "Usia", key: "usia", width: 7 },
    { header: "Jenis kelamin", key: "jk", width: 14 },
    { header: "Kecamatan", key: "kec", width: 18 },
    { header: "Kelurahan", key: "kel", width: 18 },
    ...QUESTIONS.map((q) => ({ header: `P${q.id}`, key: `p${q.id}`, width: 7 })),
    { header: "Komponen (dari 4)", key: "komp", width: 12 },
    { header: "Tingkat risiko", key: "risk", width: 18 },
    { header: "Tanda bahaya", key: "bahaya", width: 13 },
  ];

  for (const r of rows) {
    const row: Record<string, unknown> = {
      kode: r.code,
      // Excel tidak menyimpan zona waktu; tulis sebagai jam Makassar (UTC+8).
      waktu: new Date(r.createdAt.getTime() + 8 * 3600_000),
      nama: safe(r.name ?? ""),
      usia: r.age,
      jk: r.gender,
      kec: safe(r.kecamatan),
      kel: safe(r.kelurahan),
      komp: r.componentsMet,
      risk: LEVEL[r.riskLevel] ?? r.riskLevel,
      bahaya: r.warningSigns ? "Ya" : "Tidak",
    };
    r.answers.forEach((a, i) => (row[`p${QUESTIONS[i]?.id ?? i + 1}`] = a ? "Ya" : "Tidak"));
    ws.addRow(row);
  }

  const head = ws.getRow(1);
  head.font = { bold: true, color: { argb: "FFFFFFFF" } };
  head.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0B4C8C" } };
  head.alignment = { vertical: "middle", wrapText: true };
  ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: ws.columnCount } };

  const qs = wb.addWorksheet("Pertanyaan");
  qs.columns = [
    { header: "No", key: "no", width: 6 },
    { header: "Pertanyaan", key: "teks", width: 90 },
  ];
  QUESTIONS.forEach((q) => qs.addRow({ no: `P${q.id}`, teks: q.text }));
  qs.getRow(1).font = { bold: true };

  const buf = await wb.xlsx.writeBuffer();
  const date = new Date().toISOString().slice(0, 10);
  return new Response(buf as ArrayBuffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="si-dbd-${date}.xlsx"`,
      "Cache-Control": "no-store",
    },
  });
}
