import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";

config({ path: ".env.local" });
const sql = neon(process.env.DATABASE_URL);

await sql`
  CREATE TABLE IF NOT EXISTS responses (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    code text NOT NULL UNIQUE,
    created_at timestamptz NOT NULL DEFAULT now(),
    age integer NOT NULL,
    gender text NOT NULL,
    kecamatan text NOT NULL,
    kelurahan text NOT NULL,
    answers jsonb NOT NULL,
    components_met integer NOT NULL,
    risk_level text NOT NULL,
    warning_signs boolean NOT NULL,
    consent boolean NOT NULL
  )`;
await sql`CREATE INDEX IF NOT EXISTS responses_created_at_idx ON responses (created_at DESC)`;
console.log("Tabel responses siap.");
