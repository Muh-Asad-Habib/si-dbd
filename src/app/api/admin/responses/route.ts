import { NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";
import { isAdmin } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { responses } from "@/lib/schema";

const bodySchema = z.union([
  z.object({ id: z.string().uuid() }),
  z.object({ all: z.literal(true), confirm: z.literal("HAPUS") }),
]);

export async function DELETE(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Tidak diizinkan" }, { status: 401 });
  if (!req.headers.get("content-type")?.includes("application/json")) {
    return NextResponse.json({ error: "Format tidak valid" }, { status: 415 });
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Permintaan tidak valid" }, { status: 400 });

  const db = getDb();
  if ("id" in parsed.data) {
    const rows = await db.delete(responses).where(eq(responses.id, parsed.data.id)).returning({ id: responses.id });
    if (!rows.length) return NextResponse.json({ error: "Data tidak ditemukan" }, { status: 404 });
    return NextResponse.json({ deleted: 1 });
  }

  const rows = await db.delete(responses).where(sql`true`).returning({ id: responses.id });
  return NextResponse.json({ deleted: rows.length });
}
