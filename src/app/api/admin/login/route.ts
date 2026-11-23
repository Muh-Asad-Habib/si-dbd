import { NextResponse } from "next/server";
import { checkPassword, ADMIN_COOKIE } from "@/lib/auth";

// Batas percobaan login per IP (in-memory, cukup untuk satu server).
const MAX_FAIL = 5;
const LOCK_MS = 15 * 60 * 1000;
const fails = new Map<string, { n: number; until: number }>();

function clientIp(req: Request) {
  return (
    req.headers.get("cf-connecting-ip") ??
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "local"
  );
}

export async function POST(req: Request) {
  const ip = clientIp(req);
  const now = Date.now();
  const rec = fails.get(ip);
  if (rec && rec.until > now) {
    const menit = Math.ceil((rec.until - now) / 60000);
    return NextResponse.json(
      { error: `Terlalu banyak percobaan. Coba lagi dalam ${menit} menit.` },
      { status: 429 },
    );
  }

  const { password } = await req.json().catch(() => ({ password: "" }));
  const token = checkPassword(String(password ?? ""));
  if (!token) {
    const n = (rec && rec.until > 0 && rec.until <= now ? 0 : rec?.n ?? 0) + 1;
    fails.set(ip, { n, until: n >= MAX_FAIL ? now + LOCK_MS : 0 });
    await new Promise((r) => setTimeout(r, 600));
    const sisa = MAX_FAIL - n;
    return NextResponse.json(
      { error: sisa > 0 ? `Password salah. Sisa ${sisa} percobaan.` : "Password salah. Akses dikunci 15 menit." },
      { status: 401 },
    );
  }

  fails.delete(ip);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(ADMIN_COOKIE);
  return res;
}
