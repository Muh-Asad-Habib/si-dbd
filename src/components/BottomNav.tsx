"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS, isActive } from "./nav-items";

export function BottomNav() {
  const path = usePathname();
  return (
    <nav
      aria-label="Menu utama"
      className="bottom-nav no-print fixed inset-x-0 bottom-0 z-40 border-t-2 border-line bg-white pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <ul className="mx-auto grid max-w-lg grid-cols-5">
        {NAV_ITEMS.map((n) => {
          const active = isActive(path, n.href);
          return (
            <li key={n.href}>
              <Link
                href={n.href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-16 flex-col items-center justify-center gap-0.5 border-t-4 text-[0.8rem] font-bold ${
                  active ? "border-brand-600 text-brand-600" : "border-transparent text-muted"
                }`}
              >
                <n.icon className="h-6 w-6" strokeWidth={active ? 2.5 : 2} aria-hidden />
                {n.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
