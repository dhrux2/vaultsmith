import { activeGroups, type PassphraseOptions, type PasswordOptions } from "./generator";
import { WORDLIST } from "./wordlist";

/**
 * Exact entropy (bits) of `generatePassword` output.
 *
 * With pool size N, length L and required groups g₁…gₖ, the number of valid
 * passwords follows from inclusion–exclusion:
 *
 *   count = Σ_{S ⊆ groups} (−1)^|S| · (N − |∪S|)^L
 *
 * We work in log space to avoid overflow: log2(count) = L·log2(N) + log2(Σ …(1 − |∪S|/N)^L).
 */
export function passwordEntropy(opts: PasswordOptions): number {
  const groups = activeGroups(opts);
  const N = groups.reduce((n, g) => n + g.length, 0);
  const L = opts.length;
  if (N === 0 || L <= 0) return 0;

  const base = L * Math.log2(N);
  if (L < groups.length || groups.length === 1) return base;

  let fraction = 0;
  for (let mask = 0; mask < 1 << groups.length; mask++) {
    let excluded = 0;
    let bits = 0;
    groups.forEach((g, i) => {
      if (mask & (1 << i)) {
        excluded += g.length;
        bits++;
      }
    });
    fraction += (bits % 2 ? -1 : 1) * Math.pow(1 - excluded / N, L);
  }
  return base + Math.log2(fraction);
}

/**
 * Entropy of `generatePassphrase` output. Assumes the attacker knows the
 * wordlist, word count and separator, and gets nothing for free beyond that.
 */
export function passphraseEntropy(opts: PassphraseOptions): number {
  if (opts.words <= 0) return 0;
  let bits = opts.words * Math.log2(WORDLIST.length);
  if (opts.capitalization === "random") bits += opts.words; // one coin flip per word
  if (opts.includeNumber) bits += Math.log2(10 * opts.words); // which digit × which word
  return bits;
}

export interface Tier {
  min: number;
  label: string;
  color: string;
  blurb: string;
}

export const TIERS: Tier[] = [
  { min: 0, label: "Fragile", color: "#ff6b8f", blurb: "Cracked before you finish typing it." },
  { min: 36, label: "Weak", color: "#ff9a6b", blurb: "Holds off casual guessing, not much else." },
  { min: 60, label: "Fair", color: "#f5c451", blurb: "Decent for low-value accounts." },
  { min: 80, label: "Strong", color: "#4fd1a1", blurb: "Solid against offline attacks." },
  { min: 100, label: "Fortress", color: "#6aa8ff", blurb: "Effectively uncrackable by brute force." },
];

export function tierFor(bits: number): Tier {
  return [...TIERS].reverse().find((t) => bits >= t.min) ?? TIERS[0];
}

export interface AttackScenario {
  id: string;
  label: string;
  detail: string;
  guessesPerSecond: number;
}

export const SCENARIOS: AttackScenario[] = [
  { id: "online", label: "Online", detail: "Rate-limited login · 100 guesses/hour", guessesPerSecond: 100 / 3600 },
  { id: "slow", label: "Slow hash", detail: "Offline bcrypt · 10k guesses/sec", guessesPerSecond: 1e4 },
  { id: "fast", label: "GPU rig", detail: "Offline fast hash · 10B guesses/sec", guessesPerSecond: 1e10 },
  { id: "cluster", label: "Nation-state", detail: "Massive cluster · 1T guesses/sec", guessesPerSecond: 1e12 },
];

const UNITS: [number, string][] = [
  [60, "second"],
  [60, "minute"],
  [24, "hour"],
  [30.4375, "day"],
  [12, "month"],
  [100, "year"],
  [10, "century"],
];

const UNIVERSE_AGE_YEARS = 1.38e10;

/**
 * Average time to crack: half the keyspace, 2^(bits−1) guesses.
 * Computed in log10 so 256-bit keys don't overflow to Infinity.
 */
export function crackTime(bits: number, guessesPerSecond: number): string {
  if (bits <= 0) return "instantly";
  const log10Seconds = (bits - 1) * Math.log10(2) - Math.log10(guessesPerSecond);
  if (log10Seconds < 0) return "instantly";

  const log10Years = log10Seconds - Math.log10(365.25 * 24 * 3600);
  if (log10Years > Math.log10(UNIVERSE_AGE_YEARS)) {
    const times = log10Years - Math.log10(UNIVERSE_AGE_YEARS);
    return times < 3
      ? `${Math.round(10 ** times).toLocaleString()}× the age of the universe`
      : `10${superscript(Math.floor(times))} × the age of the universe`;
  }
  if (log10Years >= 6) {
    const millennia = 10 ** (log10Years - 3);
    return `${formatCompact(millennia)} millennia`;
  }

  let value = 10 ** log10Seconds;
  for (const [size, unit] of UNITS) {
    if (value < size) return formatDuration(value, unit);
    value /= size;
  }
  return formatDuration(value, "millennium");
}

function formatDuration(value: number, unit: string): string {
  const rounded = Math.max(1, Math.round(value));
  return `${rounded.toLocaleString()} ${pluralize(unit, rounded)}`;
}

function pluralize(unit: string, n: number): string {
  if (n === 1) return unit;
  if (unit === "century") return "centuries";
  if (unit === "millennium") return "millennia";
  return unit + "s";
}

function superscript(n: number): string {
  return [...String(n)].map((d) => "⁰¹²³⁴⁵⁶⁷⁸⁹"[Number(d)]).join("");
}

function formatCompact(n: number): string {
  return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(n);
}
