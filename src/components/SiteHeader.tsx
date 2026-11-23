"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./Logo";
import { TextSizeControl } from "./TextSizeControl";
import { NAV_ITEMS, isActive } from "./nav-items";

export function SiteHeader() {
  const path = usePathname();
  return (
    <header className="no-print bg-brand-600 text-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-3 hover:underline" aria-label="SI-DBD, ke beranda">
          <Logo className="h-10 w-10 shrink-0" />
          <span className="leading-tight">
            <span className="block text-xl font-bold">SI-DBD</span>
            <span className="block text-sm text-white/85">Skrining Demam Berdarah</span>
          </span>
        </Link>
        <TextSizeControl />
      </div>
      <nav aria-label="Menu utama" className="hidden border-t border-white/20 md:block">
        <ul className="mx-auto flex max-w-5xl px-6">
          {NAV_ITEMS.map((n) => {
            const active = isActive(path, n.href);
            return (
              <li key={n.href}>
                <Link
                  href={n.href}
                  aria-current={active ? "page" : undefined}
                  className={`inline-flex min-h-12 items-center border-b-4 px-4 font-bold ${
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
    </header>
  );
}
