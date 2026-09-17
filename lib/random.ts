/**
 * Cryptographically secure, unbiased random helpers.
 * Uses rejection sampling so `randomInt(n)` is exactly uniform —
 * a plain `value % n` would slightly favour low numbers.
 */
const UINT32_RANGE = 0x1_0000_0000;

export function randomInt(max: number): number {
  if (!Number.isInteger(max) || max <= 0 || max > UINT32_RANGE) {
    throw new RangeError(`randomInt: max must be an integer in 1..2^32, got ${max}`);
  }
  const limit = UINT32_RANGE - (UINT32_RANGE % max);
  const buf = new Uint32Array(1);
  do {
    crypto.getRandomValues(buf);
  } while (buf[0] >= limit);
  return buf[0] % max;
}

export function pick<T>(items: readonly T[]): T {
  return items[randomInt(items.length)];
}

export function randomBool(): boolean {
  return randomInt(2) === 1;
}
