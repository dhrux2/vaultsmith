<div align="center">

<img src="public/vaultsmith-logo.png" alt="Vaultsmith" width="88">

# Vaultsmith

Passwords, passphrases, and a closer look at their strength.

[Open Vaultsmith](https://vaultsmith.vercel.app) · [Run locally](#run-locally) · [How it works](#how-it-works)

![Next.js](https://img.shields.io/badge/Next.js-161b22?style=flat-square&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-161b22?style=flat-square&logo=typescript&logoColor=white)
![Web Crypto](https://img.shields.io/badge/Web_Crypto-161b22?style=flat-square)
[![MIT license](https://img.shields.io/badge/License-MIT-161b22?style=flat-square)](LICENSE)

</div>

---

Vaultsmith generates passwords and memorable passphrases in the browser. Adjust the options, see how they change the available combinations, and copy a result when you're ready. A separate inspector checks existing passwords for common patterns and compares its estimate with a simple character-pool calculation.

## What you can do

- **Generate passwords:** choose 4–64 characters, enable lowercase letters, uppercase letters, numbers, or symbols, and exclude lookalike characters.
- **Build passphrases:** combine 3–10 words with a choice of separator, capitalization, and an optional number.
- **Inspect a password:** check for dictionary words, common passwords, keyboard walks, sequences, years, and leetspeak substitutions.
- **Compare attack scenarios:** switch between the app's four assumed guessing rates to see how the displayed crack-time estimate changes.
- **Revisit recent results:** keep up to eight entries in session memory, copy them again, or clear the list.
- **Choose a theme:** use light or dark mode, or follow the device preference.
- **Save through the browser:** request credential storage using the Save button in browsers that support the Credential Management API.

### Keyboard shortcuts

| Key | Action |
| --- | --- |
| `G` | Generate another password or passphrase |
| `C` | Copy the current result |

Shortcuts work in the Forge view when focus is outside a text field.

## How it works

The generation code and the strength calculations live separately from the interface. Random choices use `crypto.getRandomValues`; rejection sampling avoids the bias introduced by taking a random integer modulo the pool size.

Password generation also rejects results that omit a selected character group, when the requested length allows every group to appear. The entropy calculation uses inclusion–exclusion to count those valid combinations. Passphrase entropy is calculated from the bundled wordlist and the selected options.

The inspector takes a different approach: it reduces its estimate when it finds recognizable patterns. That makes it a heuristic for arbitrary input. Crack times use fixed guessing-rate assumptions; they are comparisons within the model, not measured predictions.

## Privacy and storage

Generation and inspection run locally, with no application backend or database. Password history stays in React state and disappears on reload. The theme preference is saved in local storage. Copying a result writes it to the system clipboard. The optional Save action hands the credential to the browser's credential manager; storage and any sync then follow that browser's settings.

## Built with

Next.js 16, React 19, and TypeScript, with Framer Motion for interface transitions and GSAP for the background layer. Fonts are served locally through `next/font/local`.

## Run locally

Install Node.js 22 LTS and npm, then:

```bash
git clone https://github.com/dhrux2/vaultsmith.git
cd vaultsmith
npm ci
npm run dev
```

Open [localhost:3000](http://localhost:3000). No environment variables or external services are required.

For a production build:

```bash
npm run build
npm run start
```

## Code map

| Location | Responsibility |
| --- | --- |
| `app/` | Page shell, global styles, metadata, and local fonts |
| `components/Vaultsmith.tsx` | Generator controls, shortcuts, and session state |
| `components/Tester.tsx` | Password inspection interface |
| `lib/generator.ts` | Password and passphrase generation |
| `lib/random.ts` | Random selection helpers |
| `lib/entropy.ts` | Entropy calculations and attack scenarios |
| `lib/analyze.ts` | Pattern detection and strength estimates |

## Further work

Automated coverage for the generator constraints and entropy calculations would make changes easier to verify. The inspector could also benefit from a broader dictionary and comparisons against established password-strength estimators. There is no automated test script in the current package.

## License

[MIT](LICENSE). Built by [Dhruv Upadhyay](https://dhruvupadhyay.com).
