import { randomBytes } from "crypto";

export function generateCode(date = new Date()) {
  const wita = new Date(date.getTime() + 8 * 3600 * 1000);
  const ymd = wita.toISOString().slice(2, 10).replace(/-/g, "");
  const rand = randomBytes(3).toString("hex").toUpperCase();
  return `DBD-${ymd}-${rand}`;
}

export { CODE_PATTERN } from "./code-pattern";
