"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { X } from "lucide-react";
import { store } from "@/lib/storage";

export const CONSENT_POINTS = [
  "Skrining ini sukarela. Anda boleh berhenti kapan saja.",
  "Kami tidak meminta nama, NIK, atau nomor HP.",
  "Usia, jenis kelamin, wilayah, dan jawaban disimpan tanpa identitas untuk pemantauan DBD per wilayah.",
  "Hasil skrining bukan diagnosis. Diagnosis hanya oleh tenaga kesehatan.",
];

/**
 * Pop-up persetujuan. Memakai <dialog> bawaan browser agar fokus terkunci,
 * tombol Esc berfungsi, dan pembaca layar mengenalinya sebagai dialog.
 */
export function ConsentDialog({
  open,
  onAgree,
  onCancel,
}: {
  open: boolean;
  onAgree: () => void;
  onCancel: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [agree, setAgree] = useState(false);
  const [showErr, setShowErr] = useState(false);
  const titleId = useId();
  const errId = useId();
  const boxId = useId();

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      setAgree(false);
      setShowErr(false);
      d.showModal();
    } else if (!open && d.open) {
      d.close();
    }
  }, [open]);

  function submit() {
    if (!agree) {
      setShowErr(true);
      document.getElementById(boxId)?.focus();
      return;
    }
    store.setConsent(true);
    onAgree();
  }

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onCancel={(e) => {
        e.preventDefault();
        onCancel();
      }}
      onClick={(e) => {
        if (e.target === ref.current) onCancel();
      }}
      className="consent-dialog"
    >
      <div className="consent-panel">
        <div className="flex items-start justify-between gap-3 border-b border-line px-5 pb-3 pt-5">
          <h2 id={titleId} className="text-2xl font-bold leading-tight">
            Persetujuan mengikuti skrining
          </h2>
          <button
            type="button"
            onClick={onCancel}
            className="-mr-2 -mt-1 grid h-12 w-12 shrink-0 place-items-center text-ink"
            aria-label="Tutup"
          >
            <X className="h-7 w-7" strokeWidth={2.5} aria-hidden />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4">
          <p className="text-lg">Sebelum mulai, mohon baca keterangan berikut:</p>
          <ul className="mt-3 list-disc space-y-2 pl-6 text-lg marker:text-brand-600">
            {CONSENT_POINTS.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>

          <div className={`mt-5 ${showErr && !agree ? "border-l-8 border-[#c8102e] pl-4" : ""}`}>
            {showErr && !agree && (
              <p id={errId} className="mb-1 text-lg font-bold text-[#c8102e]">
                Centang kotak persetujuan untuk melanjutkan
              </p>
            )}
            <label htmlFor={boxId} className="flex items-start gap-4 bg-paper p-3">
              <input
                id={boxId}
                type="checkbox"
                checked={agree}
                aria-describedby={showErr && !agree ? errId : undefined}
                onChange={(e) => {
                  setAgree(e.target.checked);
                  setShowErr(false);
                }}
                className="h-10 w-10 shrink-0 accent-brand-600"
              />
              <span className="pt-1.5 text-lg">
                Saya sudah membaca dan <b>setuju mengikuti skrining</b>.
              </span>
            </label>
          </div>
        </div>

        <div className="grid gap-2 border-t border-line px-5 pb-5 pt-4 sm:flex sm:flex-row-reverse sm:justify-start sm:gap-4">
          <button type="button" onClick={submit} className="btn-go w-full text-xl sm:w-auto">
            Setuju, mulai skrining
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="min-h-12 text-lg text-brand-600 underline underline-offset-4"
          >
            Batal
          </button>
        </div>
      </div>
    </dialog>
  );
}

/** Tombol yang selalu membuka pop-up persetujuan sebelum masuk ke skrining. */
export function StartScreeningButton({
  className = "btn-go",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}>
        {children}
      </button>
      <ConsentDialog
        open={open}
        onCancel={() => setOpen(false)}
        onAgree={() => {
          setOpen(false);
          router.push("/skrining");
        }}
      />
    </>
  );
}
