import { boolean, integer, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const responses = pgTable("responses", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: text("code").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  name: text("name").notNull().default(""),
  age: integer("age").notNull(),
  gender: text("gender").notNull(),
  kecamatan: text("kecamatan").notNull(),
  kelurahan: text("kelurahan").notNull(),
  answers: jsonb("answers").$type<boolean[]>().notNull(),
  componentsMet: integer("components_met").notNull(),
  riskLevel: text("risk_level").notNull(),
  warningSigns: boolean("warning_signs").notNull(),
  consent: boolean("consent").notNull(),
});

export type ResponseRow = typeof responses.$inferSelect;
