import type { RiskLevel } from "@/lib/scoring";

export const LEVEL_STYLE: Record<
  RiskLevel,
  { badge: string; text: string; ring: string; soft: string; short: string }
> = {
  merah: {
    badge: "bg-[#fdf1f2] text-[#8a0b20] border-[#c8102e]",
    text: "text-[#a00d25]",
    ring: "#c8102e",
    soft: "bg-[#fdf1f2]",
    short: "Segera ditangani",
  },
  kuning: {
    badge: "bg-[#fff4d6] text-[#5c4000] border-[#d99a00]",
    text: "text-[#7a5500]",
    ring: "#e0a100",
    soft: "bg-[#fff4d6]",
    short: "Perlu diperiksa",
  },
  hijau: {
    badge: "bg-[#e5f2e8] text-go-700 border-go-600",
    text: "text-go-700",
    ring: "#1a7f37",
    soft: "bg-[#e5f2e8]",
    short: "Risiko rendah",
  },
};

export function LevelBadge({ level }: { level: RiskLevel }) {
  const s = LEVEL_STYLE[level];
  return (
    <span className={`inline-block whitespace-nowrap rounded-sm border-l-4 px-2.5 py-1 text-sm font-bold ${s.badge}`}>
      {s.short}
    </span>
  );
}
