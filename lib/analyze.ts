import { WORDLIST } from "./wordlist";

/**
 * Estimates the strength of a human-chosen password.
 *
 * Human passwords aren't random, so `length × log2(pool)` wildly overestimates
 * them. Instead we walk the string and charge each chunk what an attacker
 * would actually pay to guess it: a dictionary word costs ~log2(dictionary),
 * a repeated or sequential character costs ~1–2 bits, and so on.
 * This is a heuristic (in the spirit of zxcvbn), not a guarantee.
 */

const COMMON_PASSWORDS = [
  "123456", "password", "123456789", "12345678", "12345", "qwerty", "abc123", "football",
  "1234567", "monkey", "111111", "letmein", "1234", "1234567890", "dragon", "baseball",
  "sunshine", "iloveyou", "trustno1", "princess", "adobe123", "123123", "welcome", "login",
  "admin", "qwerty123", "solo", "1q2w3e4r", "master", "666666", "photoshop", "1qaz2wsx",
  "qwertyuiop", "ashley", "mustang", "121212", "starwars", "654321", "bailey", "access",
  "flower", "555555", "passw0rd", "shadow", "lovely", "7777777", "michael", "superman",
  "batman", "696969", "hello", "charlie", "aa123456", "donald", "password1", "qazwsx",
  "freedom", "whatever", "ninja", "azerty", "jesus", "hunter2", "cheese", "computer",
  "hottie", "loveme", "zaq1zaq1", "maggie", "jordan", "internet", "killer", "pepper",
  "secret", "summer", "winter", "matrix", "google", "samsung", "chocolate", "soccer",
];

const EXTRA_WORDS = [
  "password", "pass", "admin", "login", "love", "hello", "secret", "welcome", "master",
  "dragon", "monkey", "sunshine", "princess", "football", "baseball", "soccer", "hockey",
  "summer", "winter", "spring", "shadow", "freedom", "letmein", "qwerty", "iloveyou",
  "super", "star", "wars", "user", "test", "guest", "root", "money", "happy", "family",
  "baby", "angel", "cookie", "orange", "purple", "yellow", "black", "white", "blue",
];

const DICTIONARY = new Set([...WORDLIST, ...EXTRA_WORDS].filter((w) => w.length >= 4));
const DICT_BITS = Math.log2(DICTIONARY.size + COMMON_PASSWORDS.length);
const MAX_WORD = Math.max(...[...DICTIONARY].map((w) => w.length));

const KEYBOARD_ROWS = ["1234567890", "qwertyuiop", "asdfghjkl", "zxcvbnm"];

const LEET: Record<string, string> = {
  "@": "a", "4": "a", "3": "e", "1": "i", "!": "i", "0": "o", "$": "s", "5": "s", "7": "t", "+": "t",
};

export type Finding =
  | "common"
  | "dictionary"
  | "repeat"
  | "sequence"
  | "keyboard"
  | "year"
  | "short"
  | "single-class";

export interface Analysis {
  bits: number;
  poolSize: number;
  classes: { lower: boolean; upper: boolean; digits: boolean; symbols: boolean; other: boolean };
  findings: { kind: Finding; message: string }[];
}

export function analyzePassword(pw: string): Analysis {
  const classes = {
    lower: /[a-z]/.test(pw),
    upper: /[A-Z]/.test(pw),
    digits: /[0-9]/.test(pw),
    symbols: /[\x21-\x2f\x3a-\x40\x5b-\x60\x7b-\x7e ]/.test(pw),
    other: /[^\x20-\x7e]/.test(pw),
  };
  const poolSize =
    (classes.lower ? 26 : 0) +
    (classes.upper ? 26 : 0) +
    (classes.digits ? 10 : 0) +
    (classes.symbols ? 33 : 0) +
    (classes.other ? 100 : 0);

  const findings: Analysis["findings"] = [];
  const add = (kind: Finding, message: string) => {
    if (!findings.some((f) => f.kind === kind)) findings.push({ kind, message });
  };

  if (!pw) return { bits: 0, poolSize: 0, classes, findings };

  const chars = [...pw];
  const lower = pw.toLowerCase();
  const deleet = [...lower].map((c) => LEET[c] ?? c).join("");

  const commonRank = COMMON_PASSWORDS.findIndex((p) => p === lower || p === deleet);
  if (commonRank >= 0) {
    add("common", "This is one of the most common passwords in breach lists.");
    return { bits: Math.log2(commonRank + 2), poolSize, classes, findings };
  }

  const perChar = Math.log2(Math.max(poolSize, 2));
  const naive = chars.length * perChar;

  let bits = 0;
  let i = 0;
  while (i < chars.length) {
    // 1. Dictionary word (longest match, leetspeak-aware)
    let matched = 0;
    for (let len = Math.min(MAX_WORD, chars.length - i); len >= 4; len--) {
      const slice = deleet.slice(i, i + len);
      if (DICTIONARY.has(slice)) {
        matched = len;
        add("dictionary", `Contains the dictionary word “${slice}”.`);
        break;
      }
    }
    if (matched) {
      const original = pw.slice(i, i + matched);
      const hasCaps = /[A-Z]/.test(original);
      const hasLeet = original.toLowerCase() !== deleet.slice(i, i + matched);
      bits += DICT_BITS + (hasCaps ? 1 : 0) + (hasLeet ? 1 : 0);
      i += matched;
      continue;
    }

    // 2. Year like 1987 or 2024
    const year = pw.slice(i, i + 4);
    if (/^(19|20)\d\d$/.test(year)) {
      add("year", "Contains something that looks like a year.");
      bits += Math.log2(150);
      i += 4;
      continue;
    }

    // 3. Character-level patterns relative to the previous character
    const c = lower[i];
    const prev = i > 0 ? lower[i - 1] : "";
    if (prev && c === prev) {
      add("repeat", "Repeated characters are cheap to guess.");
      bits += 1;
    } else if (prev && isSequential(prev, c)) {
      add("sequence", "Sequences like “abc” or “123” add almost nothing.");
      bits += 2;
    } else if (prev && isKeyboardAdjacent(prev, c)) {
      add("keyboard", "Keyboard walks like “qwerty” are among the first things tried.");
      bits += 2;
    } else {
      bits += perChar;
    }
    i++;
  }

  if (chars.length < 12) add("short", "Shorter than 12 characters — length is the cheapest strength.");
  const classCount = Object.values(classes).filter(Boolean).length;
  if (classCount === 1 && chars.length < 20) add("single-class", "Uses only one type of character.");

  return { bits: Math.min(bits, naive), poolSize, classes, findings };
}

function isSequential(a: string, b: string): boolean {
  const alnum = /[a-z0-9]/;
  return alnum.test(a) && alnum.test(b) && Math.abs(a.charCodeAt(0) - b.charCodeAt(0)) === 1;
}

function isKeyboardAdjacent(a: string, b: string): boolean {
  return KEYBOARD_ROWS.some((row) => {
    const ia = row.indexOf(a);
    const ib = row.indexOf(b);
    return ia >= 0 && ib >= 0 && Math.abs(ia - ib) === 1;
  });
}
