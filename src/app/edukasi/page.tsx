import Link from "next/link";
import type { Metadata } from "next";
import { ChevronRight } from "lucide-react";
import { StartScreeningButton } from "@/components/ConsentDialog";

export const metadata: Metadata = { title: "Edukasi DBD · SI-DBD" };

const PHASES = [
  {
    day: "Hari 1–3",
    name: "Fase demam",
    text: "Demam tinggi mendadak, sakit kepala, nyeri di belakang mata, pegal otot dan sendi, mual, kadang muncul ruam.",
    bar: "border-[#e0a100]",
  },
  {
    day: "Hari 3–5",
    name: "Fase kritis",
    text: "Demam turun, tetapi ini saat paling berbahaya. Bisa terjadi kebocoran plasma, perdarahan, dan syok.",
    bar: "border-[#c8102e]",
  },
  {
    day: "Hari 6–7",
    name: "Fase pemulihan",
    text: "Nafsu makan kembali dan trombosit naik. Tetap minum yang cukup dan istirahat.",
    bar: "border-go-600",
  },
];

const WARNING = [
  "nyeri perut hebat atau terus-menerus",
  "muntah terus-menerus atau tidak bisa minum",
  "mimisan, gusi berdarah, muntah darah, atau BAB hitam",
  "sangat lemas, gelisah, atau sangat mengantuk",
  "tangan dan kaki dingin serta lembap",
  "sesak napas atau jarang buang air kecil",
];

const M3 = [
  { title: "Menguras", text: "bak mandi dan tempat penampungan air, minimal seminggu sekali." },
  { title: "Menutup", text: "rapat tempat penampungan air seperti tempayan, ember, dan drum." },
  { title: "Mendaur ulang", text: "barang bekas yang bisa menampung air hujan, misalnya ban, botol, dan kaleng." },
  {
    title: "Plus:",
    text: "pakai lotion antinyamuk, kelambu, dan kasa jendela; pelihara ikan pemakan jentik; jangan menggantung pakaian di dalam rumah.",
  },
];

const MYTHS = [
  {
    myth: "Jus jambu pasti menaikkan trombosit.",
    fact: "Jus jambu baik untuk cairan dan vitamin, tetapi bukan obat DBD. Yang utama adalah cukup cairan dan pemeriksaan oleh tenaga kesehatan.",
  },
  {
    myth: "Kalau demam sudah turun berarti sudah sembuh.",
    fact: "Justru saat demam turun (hari ke-3 sampai ke-5) adalah fase kritis. Tetap waspada tanda bahaya.",
  },
  {
    myth: "Pengasapan (fogging) cukup untuk mencegah DBD.",
    fact: "Fogging hanya membunuh nyamuk dewasa. Jentik tetap hidup. Pencegahan terbaik adalah PSN 3M Plus.",
  },
];

const TOC = [
  ["#apa-itu", "Apa itu DBD"],
  ["#perjalanan", "Perjalanan penyakit"],
  ["#tanda-bahaya", "Tanda bahaya"],
  ["#perawatan", "Perawatan di rumah"],
  ["#pencegahan", "Pencegahan 3M Plus"],
  ["#mitos", "Mitos dan fakta"],
];

export default function EdukasiPage() {
  return (
    <article className="max-w-2xl">
      <h1 className="page-title">Demam Berdarah Dengue (DBD)</h1>
      <p className="mt-3 text-xl">Kenali gejala, tanda bahaya, cara merawat, dan cara mencegahnya.</p>

      <nav aria-labelledby="isi" className="mt-6 border-l-8 border-line pl-4">
        <h2 id="isi" className="text-lg font-bold">
          Isi halaman
        </h2>
        <ul className="mt-1 text-lg">
          {TOC.map(([href, label]) => (
            <li key={href}>
              <a href={href} className="inline-flex min-h-11 items-center text-brand-600 underline underline-offset-4">
                {label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <section id="apa-itu" className="mt-10 scroll-mt-6">
        <h2 className="text-2xl font-bold">Apa itu DBD</h2>
        <p className="mt-3 text-lg">
          DBD disebabkan virus dengue yang ditularkan lewat gigitan nyamuk <i>Aedes aegypti</i> dan{" "}
          <i>Aedes albopictus</i>. Nyamuk ini menggigit pada pagi sampai sore hari, dan bertelur di air
          jernih yang tergenang.
        </p>
      </section>

      <section id="perjalanan" className="mt-10 scroll-mt-6">
        <h2 className="text-2xl font-bold">Perjalanan penyakit</h2>
        <p className="mt-2 text-lg">DBD biasanya melewati tiga fase.</p>
        <ol className="mt-4 space-y-4">
          {PHASES.map((p) => (
            <li key={p.name} className={`border-l-8 bg-white p-4 ${p.bar}`}>
              <p className="text-muted">{p.day}</p>
              <p className="text-xl font-bold">{p.name}</p>
              <p className="mt-1 text-lg">{p.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section
        id="tanda-bahaya"
        aria-labelledby="tb"
        className="mt-10 scroll-mt-6 overflow-hidden rounded-md border-2 border-[#c8102e] bg-white"
      >
        <h2 id="tb" className="bg-[#c8102e] px-5 py-3 text-xl font-bold text-white">
          Tanda bahaya: segera ke IGD bila ada
        </h2>
        <div className="p-5">
          <ul className="list-disc space-y-1.5 pl-6 text-lg marker:text-[#c8102e]">
            {WARNING.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
          <a
            href="tel:112"
            className="btn mt-5 w-full bg-[#c8102e] text-white shadow-[0_4px_0_#7a0a1c] hover:bg-[#a00d25] sm:w-auto"
          >
            Telepon 112
          </a>
        </div>
      </section>

      <section id="perawatan" className="mt-10 scroll-mt-6">
        <h2 className="text-2xl font-bold">Perawatan di rumah</h2>
        <ul className="mt-3 list-disc space-y-2 pl-7 text-lg">
          <li>
            <b>Minum 2–3 liter sehari:</b> air putih, oralit, jus buah, susu, atau sup.
          </li>
          <li>
            <b>Untuk demam, pakai parasetamol</b> sesuai dosis. Jangan minum aspirin atau ibuprofen.
          </li>
          <li>Istirahat dan kompres hangat di dahi dan ketiak.</li>
          <li>Periksa darah (trombosit dan hematokrit) ke puskesmas bila demam lebih dari 2 hari.</li>
        </ul>
      </section>

      <section id="pencegahan" className="mt-10 scroll-mt-6">
        <h2 className="text-2xl font-bold">Pencegahan: PSN 3M Plus</h2>
        <p className="mt-2 text-lg">Lakukan Pemberantasan Sarang Nyamuk (PSN) setiap minggu.</p>
        <ul className="mt-3 list-disc space-y-2 pl-7 text-lg">
          {M3.map((m) => (
            <li key={m.title}>
              <b>{m.title}</b> {m.text}
            </li>
          ))}
        </ul>
      </section>

      <section id="mitos" className="mt-10 scroll-mt-6">
        <h2 className="text-2xl font-bold">Mitos dan fakta</h2>
        <div className="mt-3 border-b border-line">
          {MYTHS.map((m) => (
            <details key={m.myth} className="group border-t border-line">
              <summary className="flex min-h-14 list-none items-center gap-3 py-3 text-lg font-bold text-brand-600 [&::-webkit-details-marker]:hidden">
                <ChevronRight
                  className="h-5 w-5 shrink-0 transition-transform group-open:rotate-90"
                  strokeWidth={3}
                  aria-hidden
                />
                <span className="underline underline-offset-4">&ldquo;{m.myth}&rdquo;</span>
              </summary>
              <p className="mb-4 ml-8 border-l-4 border-go-600 pl-4 text-lg">
                <b>Faktanya:</b> {m.fact}
              </p>
            </details>
          ))}
        </div>
      </section>

      <section className="mt-12 border-t-4 border-brand-600 pt-5">
        <h2 className="text-2xl font-bold">Punya gejala DBD?</h2>
        <p className="mt-2 text-lg">Cek gejala Anda dalam 2 menit.</p>
        <StartScreeningButton className="btn-go mt-4 w-full px-6 text-xl sm:w-auto">
          Mulai skrining <ChevronRight className="h-6 w-6" strokeWidth={3} aria-hidden />
        </StartScreeningButton>
        <p className="mt-4 text-lg">
          <Link href="/layanan" className="text-brand-600 underline underline-offset-4">
            Cari puskesmas atau rumah sakit terdekat
          </Link>
        </p>
      </section>

      <p className="mt-10 text-muted">
        Sumber rujukan: Kementerian Kesehatan RI dan pedoman WHO tentang dengue.
      </p>
    </article>
  );
}
