import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { responses } from "@/lib/schema";
import { score } from "@/lib/scoring";
import { submissionSchema } from "@/lib/validation";
import { generateCode } from "@/lib/code";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = submissionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });
  }

  const { profile, answers } = parsed.data;
  const result = score(answers);

  for (let attempt = 0; attempt < 3; attempt++) {
    const code = generateCode();
    try {
      await getDb().insert(responses).values({
        code,
        name: profile.name,
        age: profile.age,
        gender: profile.gender,
        kecamatan: profile.kecamatan,
        kelurahan: profile.kelurahan,
        answers,
        componentsMet: result.componentsMet,
        riskLevel: result.level,
        warningSigns: result.warningSigns,
        consent: true,
      });
      return NextResponse.json({ code, level: result.level, componentsMet: result.componentsMet });
    } catch (e) {
      if (!String(e).includes("duplicate")) {
        console.error(e);
        return NextResponse.json({ error: "Gagal menyimpan data" }, { status: 500 });
      }
    }
  }
  return NextResponse.json({ error: "Gagal membuat kode" }, { status: 500 });
}
