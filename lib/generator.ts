import { pick, randomBool, randomInt } from "./random";
import { WORDLIST } from "./wordlist";

export type CharsetKey = "lower" | "upper" | "digits" | "symbols";

export const CHARSETS: Record<CharsetKey, { label: string; hint: string; chars: string }> = {
  lower: { label: "Lowercase", hint: "a–z", chars: "abcdefghijklmnopqrstuvwxyz" },
  upper: { label: "Uppercase", hint: "A–Z", chars: "ABCDEFGHIJKLMNOPQRSTUVWXYZ" },
  digits: { label: "Numbers", hint: "0–9", chars: "0123456789" },
  symbols: { label: "Symbols", hint: "!@#$…", chars: "!@#$%^&*()-_=+[]{};:,.<>/?~" },
};

export const CHARSET_KEYS = Object.keys(CHARSETS) as CharsetKey[];

/** Characters that are easy to confuse with each other in many fonts. */
export const LOOKALIKES = "0Oo1lI|";

export interface PasswordOptions {
  length: number;
  sets: Record<CharsetKey, boolean>;
  excludeLookalikes: boolean;
}

export type Capitalization = "none" | "first" | "random";

export interface PassphraseOptions {
  words: number;
  separator: string;
  capitalization: Capitalization;
  includeNumber: boolean;
}

/** The effective (filtered) character groups for the given options. */
export function activeGroups(opts: PasswordOptions): string[] {
  return CHARSET_KEYS.filter((k) => opts.sets[k])
    .map((k) =>
      opts.excludeLookalikes
        ? [...CHARSETS[k].chars].filter((c) => !LOOKALIKES.includes(c)).join("")
        : CHARSETS[k].chars,
    )
    .filter((g) => g.length > 0);
}

/**
 * Generates a password that contains at least one character from every
 * selected group (when the length allows it). We use rejection sampling
 * instead of "insert one of each, then shuffle", which keeps the output
 * exactly uniform over all valid passwords — so the entropy formula in
 * `passwordEntropy` is precise rather than an approximation.
 */
export function generatePassword(opts: PasswordOptions): string {
  const groups = activeGroups(opts);
  if (groups.length === 0 || opts.length <= 0) return "";
  const pool = groups.join("");
  const enforce = opts.length >= groups.length;

  for (;;) {
    let out = "";
    for (let i = 0; i < opts.length; i++) out += pool[randomInt(pool.length)];
    if (!enforce || groups.every((g) => [...out].some((c) => g.includes(c)))) return out;
  }
}

export function generatePassphrase(opts: PassphraseOptions): string {
  const words = Array.from({ length: opts.words }, () => pick(WORDLIST));
  const cased = words.map((w) => {
    if (opts.capitalization === "first" || (opts.capitalization === "random" && randomBool())) {
      return w[0].toUpperCase() + w.slice(1);
    }
    return w;
  });
  if (opts.includeNumber && cased.length > 0) {
    const i = randomInt(cased.length);
    cased[i] = cased[i] + randomInt(10);
  }
  return cased.join(opts.separator);
}
