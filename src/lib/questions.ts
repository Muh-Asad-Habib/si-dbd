export type Question = {
  id: number;
  text: string;
  hint: string;
  warning?: boolean;
};

export const QUESTIONS: Question[] = [
  {
    id: 1,
    text: "Apakah Anda mengalami demam mendadak dalam 2–7 hari terakhir?",
    hint: "Demam tinggi yang muncul tiba-tiba, biasanya ≥ 38°C.",
  },
  {
    id: 2,
    text: "Apakah Anda mengalami mual atau muntah?",
    hint: "Termasuk rasa ingin muntah atau tidak nafsu makan.",
  },
  {
    id: 3,
    text: "Apakah muncul bintik-bintik merah atau ruam pada kulit Anda?",
    hint: "Bintik merah yang tidak hilang saat kulit diregangkan.",
  },
  {
    id: 4,
    text: "Apakah Anda mengalami sakit kepala atau nyeri di belakang mata?",
    hint: "Nyeri terasa makin berat saat bola mata digerakkan.",
  },
  {
    id: 5,
    text: "Apakah Anda mengalami nyeri otot, sendi, atau tulang?",
    hint: "Badan terasa pegal dan linu di banyak bagian.",
  },
  {
    id: 6,
    text: "Apakah Anda mengalami nyeri perut yang hebat?",
    hint: "Nyeri perut terus-menerus, terutama di ulu hati atau perut kanan atas.",
    warning: true,
  },
  {
    id: 7,
    text: "Apakah Anda mengalami muntah terus-menerus atau tidak mampu minum?",
    hint: "Muntah berulang sehingga cairan tidak bisa masuk.",
    warning: true,
  },
  {
    id: 8,
    text: "Apakah Anda mengalami perdarahan, seperti mimisan, gusi berdarah, muntah darah, atau BAB berwarna hitam?",
    hint: "Perdarahan sekecil apa pun perlu diwaspadai.",
    warning: true,
  },
  {
    id: 9,
    text: "Apakah Anda mengalami lemas berat, gelisah, atau mengantuk secara tidak biasa?",
    hint: "Sulit dibangunkan, bingung, atau sangat lemah.",
    warning: true,
  },
  {
    id: 10,
    text: "Apakah tangan atau kaki terasa dingin dan lembap, mengalami sesak napas, atau jumlah urine berkurang?",
    hint: "Tanda kemungkinan syok. Tidak buang air kecil lebih dari 4–6 jam.",
    warning: true,
  },
];
