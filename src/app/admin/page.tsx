import type { Metadata } from "next";
import { desc, sql } from "drizzle-orm";
import { isAdmin } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { responses } from "@/lib/schema";
import { QUESTIONS } from "@/lib/questions";
import type { RiskLevel } from "@/lib/scoring";
import { AdminLogin } from "./AdminLogin";
import { AdminDashboard } from "./AdminDashboard";

export const metadata: Metadata = { title: "Admin · SI-DBD", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const gate = (process.env.ADMIN_PATH ?? "").replace(/^\/+|\/+$/g, "");
  if (!(await isAdmin())) return <AdminLogin gate={gate} />;

  const db = getDb();
  const [byLevel, byKec, byDay, recent, symptoms] = await Promise.all([
    db
      .select({ level: responses.riskLevel, n: sql<number>`count(*)::int` })
      .from(responses)
      .groupBy(responses.riskLevel),
    db
      .select({ kec: responses.kecamatan, n: sql<number>`count(*)::int` })
      .from(responses)
      .groupBy(responses.kecamatan)
      .orderBy(desc(sql`count(*)`))
      .limit(10),
    db
      .select({
        day: sql<string>`to_char(${responses.createdAt} at time zone 'Asia/Makassar', 'YYYY-MM-DD')`,
        n: sql<number>`count(*)::int`,
      })
      .from(responses)
      .where(sql`${responses.createdAt} > now() - interval '30 days'`)
      .groupBy(sql`1`)
      .orderBy(sql`1`),
    db.select().from(responses).orderBy(desc(responses.createdAt)).limit(15),
    db.execute(
      sql`select (idx - 1)::int as i, count(*)::int as n
          from ${responses}, jsonb_array_elements(${responses.answers}) with ordinality as t(v, idx)
          where v = 'true'::jsonb group by idx order by idx`,
    ),
  ]);

  const levels: Record<RiskLevel, number> = { merah: 0, kuning: 0, hijau: 0 };
  byLevel.forEach((r) => (levels[r.level as RiskLevel] = r.n));
  const total = levels.merah + levels.kuning + levels.hijau;

  const symptomRows = (symptoms.rows as { i: number; n: number }[]) ?? [];
  const symptomData = QUESTIONS.map((q, i) => ({
    name: `Q${q.id}`,
    label: q.text,
    n: symptomRows.find((s) => s.i === i)?.n ?? 0,
  }));

  return (
    <AdminDashboard
      gate={gate}
      total={total}
      levels={levels}
      byKec={byKec}
      byDay={byDay}
      symptoms={symptomData}
      recent={recent.map((r) => ({
        code: r.code,
        createdAt: r.createdAt.toISOString(),
        age: r.age,
        gender: r.gender,
        kecamatan: r.kecamatan,
        kelurahan: r.kelurahan,
        level: r.riskLevel as RiskLevel,
        componentsMet: r.componentsMet,
      }))}
    />
  );
}
