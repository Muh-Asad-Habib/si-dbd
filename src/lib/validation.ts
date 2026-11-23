import { z } from "zod";
import regions from "@/data/regions.json";

const kecamatanMap = regions.kecamatan as Record<string, string[]>;

export const LAINNYA = "Lainnya";

export const profileSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2)
      .max(80)
      .regex(/^[\p{L}\p{M} .,'-]+$/u),
    age: z.number().int().min(1).max(120),
    gender: z.enum(["Laki-laki", "Perempuan"]),
    kecamatan: z.string().min(1).max(80),
    kelurahan: z.string().min(1).max(80),
  })
  .refine(
    (p) =>
      p.kecamatan === LAINNYA ||
      (kecamatanMap[p.kecamatan] &&
        (p.kelurahan === LAINNYA || kecamatanMap[p.kecamatan].includes(p.kelurahan))),
    { message: "Kecamatan/kelurahan tidak valid" },
  );

export const submissionSchema = z.object({
  profile: profileSchema,
  answers: z.array(z.boolean()).length(10),
  consent: z.literal(true),
});

export type Profile = z.infer<typeof profileSchema>;
