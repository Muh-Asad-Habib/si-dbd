export type RiskLevel = "merah" | "kuning" | "hijau";

export type Component = {
  key: string;
  label: string;
  description: string;
  met: boolean;
};

export type ScreeningResult = {
  components: Component[];
  componentsMet: number;
  level: RiskLevel;
  warningSigns: boolean;
};

// answers: index 0..9 sesuai pertanyaan 1..10
export function score(answers: boolean[]): ScreeningResult {
  const a = (n: number) => answers[n - 1] === true;

  const fever = a(1);
  const accompanying = [a(2), a(4), a(5)].filter(Boolean).length >= 2;
  const skinBleeding = a(3) || a(8);
  const warning = a(6) || a(7) || a(8) || a(9) || a(10);

  const components: Component[] = [
    {
      key: "demam",
      label: "Demam mendadak",
      description: "Demam mendadak dalam 2–7 hari terakhir",
      met: fever,
    },
    {
      key: "penyerta",
      label: "Gejala penyerta",
      description: "Minimal 2 dari: mual/muntah, sakit kepala/nyeri belakang mata, nyeri otot/sendi",
      met: accompanying,
    },
    {
      key: "kulit",
      label: "Manifestasi kulit/perdarahan",
      description: "Bintik merah/ruam atau tanda perdarahan",
      met: skinBleeding,
    },
    {
      key: "bahaya",
      label: "Tanda bahaya (warning signs)",
      description: "Nyeri perut hebat, muntah terus, perdarahan, lemas/gelisah, atau tanda syok",
      met: warning,
    },
  ];

  const componentsMet = components.filter((c) => c.met).length;

  let level: RiskLevel = "hijau";
  if (warning) level = "merah";
  else if (fever && (accompanying || skinBleeding)) level = "kuning";

  return { components, componentsMet, level, warningSigns: warning };
}

export const LEVEL_INFO: Record<
  RiskLevel,
  { label: string; title: string; interpretation: string; recommendations: string[] }
> = {
  merah: {
    label: "PERLU PENANGANAN SEGERA",
    title: "Ditemukan tanda bahaya",
    interpretation:
      "Jawaban Anda menunjukkan adanya tanda bahaya (warning signs) yang dapat mengarah ke DBD berat. Kondisi ini perlu diperiksa oleh tenaga kesehatan sesegera mungkin.",
    recommendations: [
      "Segera ke IGD rumah sakit atau puskesmas terdekat hari ini juga, jangan menunggu.",
      "Minta pendamping mengantar Anda. Jangan berkendara sendiri.",
      "Bawa kode responden dan sampaikan gejala yang Anda alami.",
      "Jika sesak, sangat lemas, atau tidak sadar, hubungi 112 / 119 sekarang.",
    ],
  },
  kuning: {
    label: "PERLU PEMERIKSAAN",
    title: "Gejala perlu diperiksa lebih lanjut",
    interpretation:
      "Ditemukan beberapa gejala yang perlu diperiksa lebih lanjut berdasarkan kriteria skrining DBD.",
    recommendations: [
      "Segera kunjungi puskesmas atau fasilitas kesehatan untuk pemeriksaan lebih lanjut.",
      "Minta pemeriksaan darah lengkap (trombosit, hematokrit) atau NS1 sesuai anjuran petugas.",
      "Minum cukup: air putih, oralit, jus, atau sup. Usahakan 2–3 liter per hari.",
      "Gunakan parasetamol untuk demam. Hindari aspirin dan ibuprofen.",
      "Waspadai hari ke-3 sampai ke-5 demam. Saat demam turun justru bisa masuk fase kritis.",
    ],
  },
  hijau: {
    label: "RISIKO RENDAH",
    title: "Belum ditemukan gejala yang mengarah ke DBD",
    interpretation:
      "Berdasarkan jawaban Anda, saat ini belum ditemukan kombinasi gejala yang mengarah ke DBD.",
    recommendations: [
      "Tetap pantau kondisi tubuh. Ulangi skrining bila muncul demam atau gejala baru.",
      "Jika demam lebih dari 2 hari, periksakan diri ke puskesmas.",
      "Lakukan 3M Plus di rumah: menguras, menutup, mendaur ulang, plus cegah gigitan nyamuk.",
    ],
  },
};
