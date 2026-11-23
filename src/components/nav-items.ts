import { BookOpen, ClipboardCheck, History, House, Hospital } from "lucide-react";

export const NAV_ITEMS = [
  { href: "/", label: "Beranda", icon: House },
  { href: "/skrining", label: "Skrining", icon: ClipboardCheck },
  { href: "/edukasi", label: "Edukasi", icon: BookOpen },
  { href: "/layanan", label: "Layanan", icon: Hospital },
  { href: "/riwayat", label: "Riwayat", icon: History },
];

export function isActive(path: string, href: string) {
  if (href === "/") return path === "/";
  if (href === "/skrining") return path.startsWith("/skrining") || path.startsWith("/hasil");
  return path.startsWith(href);
}
