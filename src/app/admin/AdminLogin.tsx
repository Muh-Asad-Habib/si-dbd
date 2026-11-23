"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { GATE_HEADER } from "@/lib/admin-gate";

export function AdminLogin({ gate }: { gate: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json", [GATE_HEADER]: gate },
      body: JSON.stringify({ password }),
    }).catch(() => null);
    setLoading(false);
    if (!res?.ok) {
      const body = await res?.json().catch(() => null);
      setErr(body?.error ?? "Tidak dapat terhubung. Periksa koneksi internet.");
      return;
    }
    router.refresh();
  }

  return (
    <div data-admin-page className="mx-auto max-w-md rounded-md border border-line border-t-[6px] border-t-brand-600 bg-white p-5 sm:mt-6 sm:p-7">
      <h1 className="page-title">Masuk petugas</h1>
      <p className="mt-2 text-muted">Khusus petugas kesehatan. Jangan bagikan alamat halaman ini.</p>

      <form onSubmit={submit} className="mt-6 space-y-5">
        <div className={err ? "border-l-8 border-[#c8102e] pl-4" : ""}>
          <label htmlFor="pw" className="block text-lg font-bold">
            Kata sandi
          </label>
          {err && (
            <p id="pw-err" role="alert" className="mt-1 text-lg font-bold text-[#c8102e]">
              {err}
            </p>
          )}
          <div className="mt-2 flex">
            <input
              id="pw"
              type={show ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-describedby={err ? "pw-err" : undefined}
              className="input rounded-r-none"
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              aria-label={show ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
              className="flex w-14 shrink-0 items-center justify-center rounded-r-md border-2 border-l-0 border-ink bg-white"
            >
              {show ? <EyeOff className="h-6 w-6" aria-hidden /> : <Eye className="h-6 w-6" aria-hidden />}
            </button>
          </div>
        </div>
        <button disabled={loading || !password} className="btn-go w-full text-xl">
          {loading && <Loader2 className="h-5 w-5 animate-spin" aria-hidden />} Masuk
        </button>
      </form>
    </div>
  );
}
