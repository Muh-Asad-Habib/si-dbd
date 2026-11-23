"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronRight, Menu, X } from "lucide-react";
import { Logo } from "./Logo";
import { TextSizeControl } from "./TextSizeControl";
import { NAV_ITEMS, isActive } from "./nav-items";

export function SiteHeader() {
  const path = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [path]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="no-print relative z-40 bg-brand-600 text-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-2 px-4 py-2.5 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5 hover:underline" aria-label="SI-DBD, ke beranda">
          <Logo className="h-9 w-9 shrink-0" />
          <span className="leading-tight">
            <span className="block text-lg font-bold">SI-DBD</span>
            <span className="block text-[0.8rem] text-white/85">Skrining Demam Berdarah</span>
          </span>
          <span className="admin-tag ml-1 hidden rounded-sm bg-white/15 px-2 py-0.5 text-sm font-bold">Petugas</span>
        </Link>
        <div className="flex items-center gap-2">
          <TextSizeControl />
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="menu-hp"
            className="site-menu-btn inline-flex min-h-11 items-center gap-1.5 rounded-md border-2 border-white/70 px-3 font-bold hover:bg-white/10 md:hidden"
          >
            {open ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
            Menu
          </button>
        </div>
      </div>

      <nav aria-label="Menu utama" className="site-nav hidden border-t border-white/20 md:block">
        <ul className="mx-auto flex max-w-5xl px-6">
          {NAV_ITEMS.map((n) => {
            const active = isActive(path, n.href);
            return (
              <li key={n.href}>
                <Link
                  href={n.href}
                  aria-current={active ? "page" : undefined}
                  className={`inline-flex min-h-11 items-center border-b-4 px-4 font-bold ${
                    active ? "border-white" : "border-transparent text-white/90 hover:border-white/50"
                  }`}
                >
                  {n.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {open && (
        <>
          <button
            type="button"
            aria-label="Tutup menu"
            tabIndex={-1}
            onClick={() => setOpen(false)}
            className="absolute inset-x-0 top-full h-dvh cursor-default bg-ink/40 md:hidden"
          />
          <nav
            id="menu-hp"
            aria-label="Menu utama"
            className="site-nav absolute inset-x-0 top-full z-10 border-b-4 border-brand-600 bg-white text-ink shadow-[0_8px_0_rgb(0_0_0/0.06)] md:hidden"
          >
            <ul className="divide-y divide-line">
              {NAV_ITEMS.map((n) => {
                const active = isActive(path, n.href);
                return (
                  <li key={n.href}>
                    <Link
                      href={n.href}
                      aria-current={active ? "page" : undefined}
                      className={`flex min-h-14 items-center gap-3 border-l-[6px] px-4 text-lg font-bold ${
                        active ? "border-brand-600 bg-brand-50 text-brand-700" : "border-transparent hover:bg-paper"
                      }`}
                    >
                      <n.icon className="h-6 w-6 text-brand-600" aria-hidden />
                      <span className="flex-1">{n.label}</span>
                      <ChevronRight className="h-5 w-5 text-muted" aria-hidden />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </>
      )}
    </header>
  );
}
