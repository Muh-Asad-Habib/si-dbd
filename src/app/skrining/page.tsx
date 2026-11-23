"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Loader2, Square, Volume2 } from "lucide-react";
import regions from "@/data/regions.json";
import { QUESTIONS } from "@/lib/questions";
import { store } from "@/lib/storage";
import { LAINNYA, profileSchema, type Profile } from "@/lib/validation";
import { EmergencyBanner } from "@/components/EmergencyBanner";
import { ConsentDialog } from "@/components/ConsentDialog";

type Phase = "loading" | "consent" | "profile" | "questions" | "review";
const KEC = regions.kecamatan as Record<string, string[]>;
const KEC_NAMES = Object.keys(KEC).sort();
const EMPTY = Array<boolean | null>(QUESTIONS.length).fill(null);

function useSpeech() {
  const [supported, setSupported] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  useEffect(() => {
    setSupported(typeof window !== "undefined" && "speechSynthesis" in window);
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
    };
  }, []);
  function speak(text: string) {
    if (!supported) return;
    const synth = window.speechSynthesis;
    if (speaking) {
      synth.cancel();
      setSpeaking(false);
      return;
    }
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "id-ID";
    u.rate = 0.9;
    const voice = synth.getVoices().find((v) => v.lang.toLowerCase().startsWith("id"));
    if (voice) u.voice = voice;
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    setSpeaking(true);
    synth.speak(u);
  }
  function stop() {
    if (supported) window.speechSynthesis.cancel();
    setSpeaking(false);
  }
  return { supported, speaking, speak, stop };
}

function BackLink({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="-ml-1 inline-flex min-h-12 items-center gap-1 text-lg text-ink underline underline-offset-4"
    >
      <ChevronLeft className="h-5 w-5" strokeWidth={3} aria-hidden />
      {children}
    </button>
  );
}

export default function SkriningPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("loading");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [answers, setAnswers] = useState<(boolean | null)[]>(EMPTY);
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const headingRef = useRef<HTMLHeadingElement>(null);
  const tts = useSpeech();

  useEffect(() => {
    tts.stop();
    window.scrollTo({ top: 0 });
    headingRef.current?.focus({ preventScroll: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, phase]);

  function begin() {
    const p = store.getProfile();
    const d = store.getDraft();
    if (d && d.answers.length === QUESTIONS.length) {
      setAnswers(d.answers);
      setStep(Math.min(d.step, QUESTIONS.length - 1));
    }
    setProfile(p);
    setPhase(p ? "questions" : "profile");
  }

  useEffect(() => {
    if (store.getConsent()) begin();
    else setPhase("consent");
  }, []);

  useEffect(() => {
    if (phase === "questions" || phase === "review") store.setDraft({ answers, step });
  }, [answers, step, phase]);

  const warningYes = useMemo(
    () => QUESTIONS.some((q, i) => q.warning && answers[i] === true),
    [answers],
  );

  function answer(value: boolean) {
    const next = [...answers];
    next[step] = value;
    setAnswers(next);
    // Jeda singkat agar pilihan terlihat sebelum pindah soal.
    setTimeout(() => {
      if (step < QUESTIONS.length - 1) setStep(step + 1);
      else setPhase("review");
    }, 250);
  }

  function resetAnswers() {
    setAnswers(EMPTY);
    setStep(0);
    store.clearDraft();
    setPhase("questions");
  }

  async function submit() {
    if (!profile || answers.some((a) => a === null)) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/responses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile, answers, consent: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gagal mengirim");
      store.addHistory({
        code: data.code,
        level: data.level,
        componentsMet: data.componentsMet,
        date: new Date().toISOString(),
      });
      store.clearDraft();
      // Persetujuan berlaku untuk satu kali skrining.
      store.setConsent(false);
      router.push(`/hasil/${data.code}`);
    } catch (e) {
      setError(
        e instanceof Error && e.message !== "Failed to fetch"
          ? e.message
          : "Tidak dapat terhubung. Periksa koneksi internet, lalu coba lagi.",
      );
      setSubmitting(false);
    }
  }

  if (phase === "loading") {
    return (
      <div className="grid place-items-center py-24 text-brand-600">
        <Loader2 className="h-8 w-8 animate-spin" aria-label="Memuat" />
      </div>
    );
  }

  if (phase === "consent") {
    return (
      <div className="max-w-2xl">
        <h1 className="page-title">Skrining DBD</h1>
        <p className="mt-2 text-lg">Setujui keterangan skrining terlebih dahulu untuk memulai.</p>
        <ConsentDialog open onAgree={begin} onCancel={() => router.push("/")} />
      </div>
    );
  }

  if (phase === "profile") {
    return (
      <ProfileForm
        initial={profile ?? store.getProfileDraft()}
        onBack={profile ? () => setPhase("questions") : () => router.push("/")}
        onSave={(p) => {
          store.setProfile(p);
          setProfile(p);
          setPhase("questions");
        }}
      />
    );
  }

  const answered = answers.filter((a) => a !== null).length;
  const Q = QUESTIONS[step];

  if (phase === "review") {
    return (
      <div className="max-w-2xl">
        <BackLink onClick={() => setPhase("questions")}>Kembali</BackLink>
        <h1 ref={headingRef} tabIndex={-1} className="mt-3 page-title outline-none">
          Periksa jawaban Anda
        </h1>
        <p className="mt-2 text-lg">Pastikan jawaban sudah benar sebelum melihat hasil.</p>

        {warningYes && (
          <div className="mt-5">
            <EmergencyBanner />
          </div>
        )}

        <h2 className="mt-8 text-xl font-bold">Orang yang diperiksa</h2>
        <dl className="mt-2 border-t border-line">
          <SummaryRow
            label="Data"
            value={
              profile
                ? `${profile.name}, ${profile.age} tahun, ${profile.gender.toLowerCase()}, ${profile.kelurahan}, ${profile.kecamatan}`
                : "-"
            }
            onChange={() => setPhase("profile")}
            changeLabel="data orang yang diperiksa"
          />
        </dl>

        <h2 className="mt-8 text-xl font-bold">Gejala</h2>
        <dl className="mt-2 border-t border-line">
          {QUESTIONS.map((q, i) => (
            <SummaryRow
              key={q.id}
              label={`${q.id}. ${q.text}`}
              value={answers[i] ? "Ya" : "Tidak"}
              strong={!!answers[i]}
              onChange={() => {
                setStep(i);
                setPhase("questions");
              }}
              changeLabel={`jawaban pertanyaan ${q.id}`}
            />
          ))}
        </dl>

        {error && (
          <div role="alert" className="mt-6 border-l-8 border-[#c8102e] bg-white p-4 text-lg font-bold text-[#8a0b20]">
            {error}
          </div>
        )}

        <h2 className="mt-8 text-xl font-bold">Kirim jawaban</h2>
        <p className="mt-2 text-lg">
          Nama dan jawaban dikirim ke petugas kesehatan untuk pemantauan. Anda akan mendapat kode hasil untuk
          ditunjukkan ke petugas.
        </p>
        <button onClick={submit} disabled={submitting} className="btn-go mt-5 w-full text-xl sm:w-auto">
          {submitting && <Loader2 className="h-5 w-5 animate-spin" aria-hidden />}
          Kirim dan lihat hasil
        </button>
        <p className="mt-6">
          <button onClick={resetAnswers} className="min-h-12 text-lg text-brand-600 underline underline-offset-4">
            Hapus semua jawaban dan ulangi
          </button>
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      {step > 0 ? (
        <BackLink onClick={() => setStep(step - 1)}>Pertanyaan sebelumnya</BackLink>
      ) : (
        <BackLink onClick={() => router.push("/")}>Beranda</BackLink>
      )}

      {profile && (
        <p className="mt-2 border-b border-line pb-3 text-muted">
          Untuk: <b className="text-ink">{profile.name}</b>, {profile.age} th, {profile.gender.toLowerCase()}.{" "}
          <button
            onClick={() => setPhase("profile")}
            className="inline min-h-0 text-brand-600 underline underline-offset-4"
          >
            Ganti orang
          </button>
        </p>
      )}

      {warningYes && (
        <div className="mt-4">
          <EmergencyBanner compact />
        </div>
      )}

      <div className="mt-5">
        <div className="flex items-baseline justify-between text-lg text-muted">
          <span>
            Pertanyaan {step + 1} dari {QUESTIONS.length}
          </span>
          {answered === QUESTIONS.length && (
            <button
              onClick={() => setPhase("review")}
              className="inline-flex min-h-12 items-center text-brand-600 underline underline-offset-4"
            >
              Ke ringkasan <ChevronRight className="h-5 w-5" aria-hidden />
            </button>
          )}
        </div>
        <div
          className="mt-2 h-2 w-full bg-line"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={QUESTIONS.length}
          aria-valuenow={answered}
          aria-label="Jumlah pertanyaan terjawab"
        >
          <div className="h-full bg-brand-600 transition-[width]" style={{ width: `${(answered / QUESTIONS.length) * 100}%` }} />
        </div>
      </div>

      <fieldset className="mt-6" key={step}>
        <legend className="w-full">
          {Q.warning && (
            <strong className="mb-3 inline-block bg-[#c8102e] px-2 py-0.5 text-sm uppercase tracking-wide text-white">
              Tanda bahaya
            </strong>
          )}
          <h1 ref={headingRef} tabIndex={-1} className="block page-title outline-none">
            {Q.text}
          </h1>
        </legend>
        <p className="mt-2 text-lg text-muted">{Q.hint}</p>

        {tts.supported && (
          <button
            type="button"
            onClick={() => tts.speak(`${Q.text}. ${Q.hint}`)}
            aria-pressed={tts.speaking}
            className="mt-2 inline-flex min-h-12 items-center gap-2 text-lg text-brand-600 underline underline-offset-4"
          >
            {tts.speaking ? <Square className="h-5 w-5" aria-hidden /> : <Volume2 className="h-5 w-5" aria-hidden />}
            {tts.speaking ? "Hentikan suara" : "Bacakan pertanyaan"}
          </button>
        )}

        <div className="mt-5 space-y-3">
          <Choice name={`q${Q.id}`} label="Ya" checked={answers[step] === true} onPick={() => answer(true)} />
          <Choice name={`q${Q.id}`} label="Tidak" checked={answers[step] === false} onPick={() => answer(false)} />
        </div>
      </fieldset>

      <p className="mt-6 text-muted">Jawaban tersimpan otomatis. Anda bisa lanjutkan nanti.</p>
    </div>
  );
}

function Choice({
  name,
  label,
  checked,
  onPick,
}: {
  name: string;
  label: string;
  checked: boolean;
  onPick: () => void;
}) {
  return (
    <label
      className={`flex min-h-[4.5rem] cursor-pointer items-center gap-4 rounded-md border-2 px-4 text-2xl font-bold ${
        checked ? "border-brand-600 bg-brand-50" : "border-ink bg-white hover:bg-paper"
      }`}
    >
      <input
        type="radio"
        name={name}
        checked={checked}
        onChange={onPick}
        onClick={() => checked && onPick()}
        className="h-9 w-9 shrink-0 accent-brand-600"
      />
      {label}
    </label>
  );
}

function SummaryRow({
  label,
  value,
  strong,
  onChange,
  changeLabel,
}: {
  label: string;
  value: string;
  strong?: boolean;
  onChange: () => void;
  changeLabel: string;
}) {
  return (
    <div className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 border-b border-line py-3 sm:grid-cols-[1fr_6rem_auto]">
      <dt className="col-span-2 text-lg sm:col-span-1">{label}</dt>
      <dd className={`text-lg ${strong ? "font-bold" : ""}`}>{value}</dd>
      <dd className="text-right">
        <button onClick={onChange} className="min-h-10 text-lg text-brand-600 underline underline-offset-4">
          Ubah<span className="sr-only"> {changeLabel}</span>
        </button>
      </dd>
    </div>
  );
}

function ProfileForm({
  initial,
  onSave,
  onBack,
}: {
  initial: Partial<Profile> | null;
  onSave: (p: Profile) => void;
  onBack: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [age, setAge] = useState(initial?.age ? String(initial.age) : "");
  const [gender, setGender] = useState<string>(initial?.gender ?? "");
  const [kec, setKec] = useState(initial?.kecamatan ?? "");
  const [kel, setKel] = useState(initial?.kelurahan ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const summaryRef = useRef<HTMLDivElement>(null);

  const kelList = kec && kec !== LAINNYA ? KEC[kec] ?? [] : [];

  function save(e: React.FormEvent) {
    e.preventDefault();
    const n = Number(age);
    const errs: Record<string, string> = {};
    const nm = name.trim().replace(/\s+/g, " ");
    if (nm.length < 2) errs.nama = "Tulis nama orang yang diperiksa";
    else if (!/^[\p{L}\p{M} .,'-]+$/u.test(nm)) errs.nama = "Nama hanya boleh berisi huruf";
    if (!age || !Number.isInteger(n) || n < 1 || n > 120) errs.usia = "Masukkan usia antara 1 sampai 120 tahun";
    if (!gender) errs.jk = "Pilih jenis kelamin";
    if (!kec) errs.kec = "Pilih kecamatan";
    else if (kec !== LAINNYA && !kel) errs.kel = "Pilih kelurahan";
    setErrors(errs);
    if (Object.keys(errs).length) {
      setTimeout(() => summaryRef.current?.focus(), 0);
      return;
    }
    const parsed = profileSchema.safeParse({
      name: nm,
      age: n,
      gender,
      kecamatan: kec,
      kelurahan: kec === LAINNYA ? LAINNYA : kel,
    });
    if (!parsed.success) {
      setErrors({ usia: "Periksa kembali data Anda" });
      return;
    }
    onSave(parsed.data);
  }

  const errClass = (k: string) => (errors[k] ? "border-l-8 border-[#c8102e] pl-4" : "");
  const ErrMsg = ({ k }: { k: string }) =>
    errors[k] ? (
      <p id={`${k}-err`} className="mb-2 text-lg font-bold text-[#c8102e]">
        {errors[k]}
      </p>
    ) : null;

  return (
    <form onSubmit={save} noValidate className="max-w-xl">
      <BackLink onClick={onBack}>Kembali</BackLink>

      {Object.keys(errors).length > 0 && (
        <div
          ref={summaryRef}
          tabIndex={-1}
          role="alert"
          className="mt-4 border-4 border-[#c8102e] bg-white p-4 outline-none"
        >
          <h2 className="text-xl font-bold">Ada data yang belum benar</h2>
          <ul className="mt-2 space-y-1 text-lg">
            {Object.entries(errors).map(([k, v]) => (
              <li key={k}>
                <a href={`#${k === "jk" ? "jk-laki" : k}`} className="font-bold text-[#c8102e] underline underline-offset-4">
                  {v}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="mt-4 text-lg text-muted">Langkah 1 dari 2</p>
      <h1 className="page-title">Tentang orang yang diperiksa</h1>
      <p className="mt-2 text-lg">
        Nama dikirim ke petugas kesehatan bersama hasil skrining. Data ini juga disimpan di HP Anda agar tidak
        perlu diisi ulang.
      </p>

      <div className={`mt-8 ${errClass("nama")}`}>
        <label htmlFor="nama" className="block text-xl font-bold">
          Nama
        </label>
        <p className="text-muted">Nama lengkap atau panggilan.</p>
        <ErrMsg k="nama" />
        <input
          id="nama"
          type="text"
          autoComplete="name"
          autoCapitalize="words"
          maxLength={80}
          value={name}
          onChange={(e) => setName(e.target.value)}
          aria-describedby={errors.nama ? "nama-err" : undefined}
          className="input mt-2 w-full text-xl"
        />
      </div>

      <div className={`mt-8 ${errClass("usia")}`}>
        <label htmlFor="usia" className="block text-xl font-bold">
          Usia
        </label>
        <p className="text-muted">Dalam tahun. Untuk bayi di bawah 1 tahun, isi 1.</p>
        <ErrMsg k="usia" />
        <div className="mt-2 flex items-center gap-3">
          <input
            id="usia"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={3}
            autoComplete="off"
            value={age}
            onChange={(e) => setAge(e.target.value.replace(/\D/g, ""))}
            aria-describedby={errors.usia ? "usia-err" : undefined}
            className="input w-28 text-center text-xl"
          />
          <span className="text-lg">tahun</span>
        </div>
      </div>

      <fieldset className={`mt-8 ${errClass("jk")}`} aria-describedby={errors.jk ? "jk-err" : undefined}>
        <legend className="text-xl font-bold">Jenis kelamin</legend>
        <ErrMsg k="jk" />
        <div className="mt-2 space-y-3">
          {["Laki-laki", "Perempuan"].map((g) => (
            <label
              key={g}
              className={`flex min-h-16 cursor-pointer items-center gap-4 rounded-md border-2 px-4 text-xl ${
                gender === g ? "border-brand-600 bg-brand-50 font-bold" : "border-ink bg-white"
              }`}
            >
              <input
                id={g === "Laki-laki" ? "jk-laki" : "jk-perempuan"}
                type="radio"
                name="jk"
                checked={gender === g}
                onChange={() => setGender(g)}
                className="h-8 w-8 shrink-0 accent-brand-600"
              />
              {g}
            </label>
          ))}
        </div>
      </fieldset>

      <div className={`mt-8 ${errClass("kec")}`}>
        <label htmlFor="kec" className="block text-xl font-bold">
          Kecamatan tempat tinggal
        </label>
        <p className="text-muted">{regions.wilayah}</p>
        <ErrMsg k="kec" />
        <select
          id="kec"
          value={kec}
          onChange={(e) => {
            setKec(e.target.value);
            setKel("");
          }}
          aria-describedby={errors.kec ? "kec-err" : undefined}
          className="input mt-2"
        >
          <option value="">Pilih kecamatan</option>
          {KEC_NAMES.map((k) => (
            <option key={k}>{k}</option>
          ))}
          <option value={LAINNYA}>Di luar {regions.wilayah}</option>
        </select>
      </div>

      {kec && kec !== LAINNYA && (
        <div className={`mt-8 ${errClass("kel")}`}>
          <label htmlFor="kel" className="block text-xl font-bold">
            Kelurahan
          </label>
          <ErrMsg k="kel" />
          <select
            id="kel"
            value={kel}
            onChange={(e) => setKel(e.target.value)}
            aria-describedby={errors.kel ? "kel-err" : undefined}
            className="input mt-2"
          >
            <option value="">Pilih kelurahan</option>
            {kelList.map((k) => (
              <option key={k}>{k}</option>
            ))}
            <option value={LAINNYA}>Lainnya</option>
          </select>
        </div>
      )}

      <button type="submit" className="btn-go mt-10 w-full text-xl sm:w-auto">
        Lanjutkan
      </button>
    </form>
  );
}
