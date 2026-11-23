"use client";

import type { Profile } from "./validation";
import type { RiskLevel } from "./scoring";

const KEY_PROFILE = "sidbd.profile";
const KEY_CONSENT = "sidbd.consent";
const KEY_DRAFT = "sidbd.draft";
const KEY_HISTORY = "sidbd.history";

export type HistoryItem = { code: string; level: RiskLevel; componentsMet: number; date: string };
export type Draft = { answers: (boolean | null)[]; step: number };

function read<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

export const store = {
  getProfile: () => {
    const p = read<Profile>(KEY_PROFILE);
    return p && typeof p.name === "string" && p.name.trim().length >= 2 ? p : null;
  },
  getProfileDraft: () => read<Partial<Profile>>(KEY_PROFILE),
  setProfile: (p: Profile) => write(KEY_PROFILE, p),
  clearProfile: () => localStorage.removeItem(KEY_PROFILE),
  getConsent: () => read<boolean>(KEY_CONSENT) === true,
  setConsent: (v: boolean) => write(KEY_CONSENT, v),
  getDraft: () => read<Draft>(KEY_DRAFT),
  setDraft: (d: Draft) => write(KEY_DRAFT, d),
  clearDraft: () => localStorage.removeItem(KEY_DRAFT),
  getHistory: () => read<HistoryItem[]>(KEY_HISTORY) ?? [],
  addHistory: (item: HistoryItem) => {
    const list = (read<HistoryItem[]>(KEY_HISTORY) ?? []).filter((h) => h.code !== item.code);
    write(KEY_HISTORY, [item, ...list].slice(0, 20));
  },
  clearAll: () => {
    [KEY_PROFILE, KEY_CONSENT, KEY_DRAFT, KEY_HISTORY].forEach((k) => localStorage.removeItem(k));
  },
};
