import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

import { ADMIN_COOKIE_NAME } from "./admin-gate";

export const ADMIN_COOKIE = ADMIN_COOKIE_NAME;

function expectedToken() {
  const password = process.env.ADMIN_PASSWORD;
  const secret = process.env.ADMIN_SECRET;
  if (!password || !secret) throw new Error("ADMIN_PASSWORD / ADMIN_SECRET belum diatur");
  return createHmac("sha256", secret).update(password).digest("hex");
}

function safeEqual(a: string, b: string) {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

export function checkPassword(input: string) {
  if (!input) return null;
  return safeEqual(input, process.env.ADMIN_PASSWORD ?? "") ? expectedToken() : null;
}

export async function isAdmin() {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  return !!token && safeEqual(token, expectedToken());
}
