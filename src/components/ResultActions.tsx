"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LEVEL_INFO, type RiskLevel } from "@/lib/scoring";

export function ResultActions({
  code,
  level,
  componentsMet,
}: {
  code: string;
  level: RiskLevel;
  componentsMet: number;
}) {
  const [copied, setCopied] = useState(false);
  const [url, setUrl] = useState("");

  useEffect(() => {
    setUrl(window.location.href);
  }, []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }

  const shareText = `Hasil skrining DBD (SI-DBD): ${LEVEL_INFO[level].label}, ${componentsMet}/4 komponen. Kode: ${code}\n${url}`;

  const reminder = new URL("https://calendar.google.com/calendar/render");
  reminder.searchParams.set("action", "TEMPLATE");
  reminder.searchParams.set("text", "Skrining ulang DBD / cek ke puskesmas");
  reminder.searchParams.set("details", `Pantau gejala dan ulangi skrining. Kode sebelumnya: ${code}`);

  const link = "min-h-12 text-left text-lg text-brand-600 underline underline-offset-4";

  return (
    <section aria-labelledby="simpan" className="no-print">
      <h2 id="simpan" className="text-2xl font-bold">
        Simpan atau bagikan hasil
      </h2>
      <p className="mt-2 text-lg">Tunjukkan kode hasil ini kepada petugas puskesmas.</p>
      <div className="mt-4 grid gap-3 sm:flex sm:flex-wrap">
        <a
          href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
          target="_blank"
          rel="noreferrer"
          className="btn-primary"
        >
          Kirim lewat WhatsApp
        </a>
        <button onClick={() => window.print()} className="btn-ghost">
          Simpan sebagai PDF
        </button>
      </div>
      <ul className="mt-4 space-y-1">
        <li>
          <button onClick={copy} className={link} aria-live="polite">
            {copied ? "Kode sudah disalin" : `Salin kode ${code}`}
          </button>
        </li>
        <li>
          <a href={reminder.toString()} target="_blank" rel="noreferrer" className={`${link} inline-flex items-center`}>
            Buat pengingat skrining ulang di Google Kalender
          </a>
        </li>
        <li>
          <Link href="/skrining" className={`${link} inline-flex items-center`}>
            Skrining lagi atau untuk orang lain
          </Link>
        </li>
      </ul>
    </section>
  );
}
