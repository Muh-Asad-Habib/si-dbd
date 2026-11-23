"use client";

import { useEffect, useState } from "react";

const SIZES = [
  { key: "m", label: "Normal" },
  { key: "l", label: "Besar" },
  { key: "xl", label: "Sangat besar" },
] as const;

type Size = (typeof SIZES)[number]["key"];

export function TextSizeControl() {
  const [size, setSize] = useState<Size>("m");

  useEffect(() => {
    const t = document.documentElement.dataset.text;
    if (t === "l" || t === "xl") setSize(t);
  }, []);

  function cycle() {
    const idx = SIZES.findIndex((s) => s.key === size);
    const next = SIZES[(idx + 1) % SIZES.length].key;
    setSize(next);
    if (next === "m") delete document.documentElement.dataset.text;
    else document.documentElement.dataset.text = next;
    try {
      localStorage.setItem("sidbd.textSize", next);
    } catch {}
  }

  const label = SIZES.find((s) => s.key === size)!.label;

  return (
    <button
      onClick={cycle}
      aria-label={`Ukuran huruf: ${label}. Ketuk untuk mengubah.`}
      className="inline-flex min-h-11 items-center gap-1 rounded-md border-2 border-white/70 px-3 font-bold text-white hover:bg-white/10"
    >
      <span aria-hidden className="leading-none">
        <span className="text-sm">A</span>
        <span className="text-xl">A</span>
      </span>
      <span className="ml-1 hidden text-base sm:inline">{label}</span>
    </button>
  );
}
