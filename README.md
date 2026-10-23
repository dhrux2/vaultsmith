<div align="center">

<img src="public/vaultsmith-logo.png" alt="Vaultsmith" width="88">

# Vaultsmith

Make a password worth keeping. See what makes it strong.

[Open Vaultsmith](https://vaultsmith.vercel.app) · [Run locally](#run-locally) · [How it works](#how-it-works)

![Next.js](https://img.shields.io/badge/Next.js-161b22?style=flat-square&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-161b22?style=flat-square&logo=typescript&logoColor=white)
![Web Crypto](https://img.shields.io/badge/Web_Crypto-161b22?style=flat-square)
[![MIT license](https://img.shields.io/badge/License-MIT-161b22?style=flat-square)](LICENSE)

</div>

---

Vaultsmith creates passwords and memorable passphrases right in your browser. Tweak the options, see how they change the number of possible combinations, and copy a result when you're happy with it. The inspector also checks existing passwords for common patterns and compares its strength estimate with a basic character-pool calculation.

## What you can do 🔑

- **Generate passwords:** choose 4–64 characters, toggle lowercase letters, uppercase letters, numbers, and symbols, or leave out lookalike characters.
- **Build passphrases:** combine 3–10 words and pick a separator, capitalization style, and optional number.
- **Inspect a password:** look for dictionary words, common passwords, keyboard walks, sequences, years, and leetspeak substitutions.
- **Compare attack scenarios:** switch between four assumed guessing rates to see how the crack-time estimate changes.
- **Find a recent result:** keep up to eight entries in session memory, copy one again, or clear the list.
- **Pick a theme:** choose light or dark mode, or follow your device setting.
- **Save through your browser:** use the Save button to request credential storage in browsers that support the Credential Management API.

### Keyboard shortcuts

| Key | Action |
| --- | --- |
| `G` | Generate another password or passphrase |
| `C` | Copy the current result |

Shortcuts work in the Forge view while you're outside a text field.

## How it works

The generator and strength calculations are separate from the interface. Random choices use `crypto.getRandomValues`. Rejection sampling avoids modulo bias, the slight skew that can come from taking a random integer modulo the pool size.

When the length allows it, a generated password must include every character group you've selected. Results that miss a group are rejected. The entropy calculation uses inclusion–exclusion to count the valid combinations. Passphrase entropy comes from the bundled wordlist and your chosen options.

The inspector lowers its estimate when it spots recognizable patterns. For passwords you enter yourself, this is a heuristic estimate. Crack times also depend on fixed guessing-rate assumptions: they help compare scenarios, but aren't measured predictions.

## Privacy and storage 🔒

Generation and inspection happen locally, with no application backend or database.

- Password history stays in React state and disappears when you reload.
- Your theme preference is saved in local storage.
- Copy writes the result to your system clipboard.
- The optional Save action passes the credential to your browser's credential manager. That browser's settings control storage and any sync.

## Built with 🛠️

Next.js 16, React 19, and TypeScript. Framer Motion handles interface transitions, GSAP powers the background layer, and `next/font/local` serves the fonts locally.

## Run locally

Install Node.js 22 LTS and npm, then:

```bash
git clone https://github.com/dhrux2/vaultsmith.git
cd vaultsmith
npm ci
npm run dev
```

Open [localhost:3000](http://localhost:3000). You don't need environment variables or external services.

For a production build:

```bash
npm run build
npm run start
```

## Code map

| Location | What lives here |
| --- | --- |
| `app/` | Page shell, global styles, metadata, and local fonts |
| `components/Vaultsmith.tsx` | Generator controls, shortcuts, and session state |
| `components/Tester.tsx` | Password inspection interface |
| `lib/generator.ts` | Password and passphrase generation |
| `lib/random.ts` | Random selection helpers |
| `lib/entropy.ts` | Entropy calculations and attack scenarios |
| `lib/analyze.ts` | Pattern detection and strength estimates |

## Further work 🌱

The next useful additions are tests for the generator's rules and entropy calculations, a wider dictionary for the inspector, and comparisons with established password-strength estimators. These would make changes easier to verify. The package doesn't have an automated test script yet.

## License

[MIT](LICENSE). Built by [Dhruv Upadhyay](https://dhruvupadhyay.com).
