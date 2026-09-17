# Vaultsmith

A password and passphrase generator that does the math honestly instead of
just showing a progress bar. Every number on screen — entropy, crack time,
pattern penalties — is computed from the actual generation logic, not
guessed.

Built with Next.js, TypeScript, and Framer Motion.

## Features

- **Password generator** — adjustable length (4–64), toggleable character
  sets, and an option to exclude visually ambiguous characters (`0 O o 1 l I |`).
- **Passphrase generator** — configurable word count, separator, and
  capitalization style, drawn from a curated wordlist.
- **Real entropy math, not an estimate.** Password entropy accounts for the
  "each selected character set must appear at least once" constraint using
  inclusion–exclusion, so the bits shown are the exact log₂ of the number of
  strings the generator can actually produce — not `length × log2(poolSize)`.
- **Strength inspector** — paste in any password and see a pattern-aware
  score (dictionary words, leetspeak substitutions, keyboard walks,
  sequences, years, common-password lists) alongside the naive
  length-times-pool-size number, so you can see exactly how much the naive
  formula overestimates real-world passwords.
- **Crack-time estimates** across four attack scenarios (rate-limited login,
  offline slow hash, GPU cluster, nation-state), computed in log space so it
  doesn't overflow on high-entropy inputs.
- **Session-only history** — recently generated/copied values are kept in
  memory for the session and blurred until hovered; nothing is persisted or
  sent anywhere.
- Light/dark theme that follows the OS setting live, with a matching favicon
  swap.
- No network requests, no analytics, no storage. Generation uses
  `crypto.getRandomValues` with rejection sampling to avoid modulo bias.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run build   # production build
npm run start   # serve the production build
```

## Tech stack

- [Next.js](https://nextjs.org/) (App Router) + TypeScript
- [Framer Motion](https://www.framer.com/motion/) for UI motion
- [GSAP](https://gsap.com/) for the background layer
- Self-hosted variable fonts via `next/font/local`
- No backend, no database — everything runs client-side

## Project structure

```
app/                Next.js app router pages, global styles, fonts
components/          UI components (generator, inspector, controls, theme)
lib/
  generator.ts       Password/passphrase generation (CSPRNG-backed)
  entropy.ts          Entropy math, crack-time estimation, strength tiers
  analyze.ts           Pattern-aware password strength analysis
  random.ts             Unbiased random helpers over crypto.getRandomValues
  wordlist.ts             Passphrase wordlist
```

## License

MIT — see [LICENSE](LICENSE).
