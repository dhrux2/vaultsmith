"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { passphraseEntropy, passwordEntropy, tierFor } from "@/lib/entropy";
import {
  activeGroups,
  CHARSET_KEYS,
  CHARSETS,
  generatePassphrase,
  generatePassword,
  type Capitalization,
  type CharsetKey,
  type PassphraseOptions,
  type PasswordOptions,
} from "@/lib/generator";
import { WORDLIST } from "@/lib/wordlist";
import { liquid, Segmented, Slider, Switch } from "./Controls";
import History, { type HistoryItem } from "./History";
import { CheckIcon, GaugeIcon, HeartIcon, Logo, PanelHead, SlidersIcon } from "./Icons";
import OutputDisplay from "./OutputDisplay";
import StrengthMeter from "./StrengthMeter";
import Tester from "./Tester";
import ThemeToggle from "./ThemeToggle";
import { useCopy } from "./useCopy";

type Mode = "password" | "passphrase";
type Tab = "forge" | "inspect";

const DEFAULT_PASSWORD: PasswordOptions = {
  length: 20,
  sets: { lower: true, upper: true, digits: true, symbols: true },
  excludeLookalikes: false,
};

const DEFAULT_PASSPHRASE: PassphraseOptions = {
  words: 6,
  separator: "-",
  capitalization: "first",
  includeNumber: true,
};

const SEPARATORS = [
  { value: "-", label: "-" },
  { value: ".", label: "." },
  { value: "_", label: "_" },
  { value: " ", label: "space" },
  { value: "", label: "none" },
];

const ease = { type: "spring", stiffness: 170, damping: 28 } as const;
const panel = {
  initial: { opacity: 0, y: 18, scale: 0.97 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -10, scale: 0.98 },
  transition: { type: "spring", stiffness: 260, damping: 34 },
} as const;

export default function Vaultsmith() {
  const [tab, setTab] = useState<Tab>("forge");
  const [mode, setMode] = useState<Mode>("password");
  const [pw, setPw] = useState(DEFAULT_PASSWORD);
  const [pp, setPp] = useState(DEFAULT_PASSPHRASE);
  const [value, setValue] = useState("");
  const [scrambleKey, setScrambleKey] = useState(0);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [scenario, setScenario] = useState("fast");
  const [shake, setShake] = useState<CharsetKey | null>(null);
  const { copiedKey, copy } = useCopy();
  const nextId = useRef(0);

  const bits = useMemo(
    () => (mode === "password" ? passwordEntropy(pw) : passphraseEntropy(pp)),
    [mode, pw, pp],
  );
  const tier = tierFor(bits);

  const make = useCallback(
    () => (mode === "password" ? generatePassword(pw) : generatePassphrase(pp)),
    [mode, pw, pp],
  );

  // Any option change re-forges instantly (no scramble, so sliders stay smooth).
  useEffect(() => {
    setValue(make());
  }, [make]);

  const remember = useCallback((v: string, b: number) => {
    if (!v) return;
    setHistory((h) =>
      [{ id: nextId.current++, value: v, bits: b }, ...h.filter((x) => x.value !== v)].slice(0, 8),
    );
  }, []);

  const regenerate = useCallback(() => {
    const v = make();
    setValue(v);
    setScrambleKey((k) => k + 1);
    remember(v, bits);
  }, [make, remember, bits]);

  const copyCurrent = useCallback(() => {
    copy(value, "main");
    remember(value, bits);
  }, [copy, value, remember, bits]);

  // Keyboard shortcuts: G = generate, C = copy.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (tab !== "forge" || e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement;
      if (target.closest("input, textarea, [contenteditable]")) return;
      const key = e.key.toLowerCase();
      if (key === "g") {
        e.preventDefault();
        regenerate();
      } else if (key === "c") {
        e.preventDefault();
        copyCurrent();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [tab, regenerate, copyCurrent]);

  const toggleSet = (k: CharsetKey) => {
    const enabled = CHARSET_KEYS.filter((key) => pw.sets[key]);
    if (pw.sets[k] && enabled.length === 1) {
      setShake(k); // can't turn off the last set
      return;
    }
    setPw({ ...pw, sets: { ...pw.sets, [k]: !pw.sets[k] } });
  };

  const poolSize = activeGroups(pw).reduce((n, g) => n + g.length, 0);

  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Liquid-glass specular highlight that follows the pointer across every card.
  useEffect(() => {
    let frame = 0;
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        document.querySelectorAll<HTMLElement>(".card, .nav").forEach((el) => {
          const r = el.getBoundingClientRect();
          el.style.setProperty("--mx", `${e.clientX - r.left}px`);
          el.style.setProperty("--my", `${e.clientY - r.top}px`);
        });
      });
    };
    window.addEventListener("pointermove", onMove);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  const goTo = (t: Tab) => {
    setTab(t);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const historyPanel = (
    <History
      items={history}
      copiedKey={copiedKey}
      onCopy={(item) => copy(item.value, `h-${item.id}`)}
      onClear={() => setHistory([])}
    />
  );

  return (
    <div className="shell" style={{ "--tier": tier.color } as React.CSSProperties}>
      <div className="nav-wrap">
        <motion.nav
          className="nav"
          data-scrolled={scrolled}
          initial={{ opacity: 0, y: -30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 30 }}
          layout
        >
          <button type="button" className="nav-brand" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            <motion.span whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} transition={liquid}>
              <Logo size={44} />
            </motion.span>
            <span className="nav-name">Vaultsmith</span>
          </button>
          <Segmented
            label="Section"
            value={tab}
            onChange={setTab}
            options={[
              { value: "forge", label: "Forge" },
              { value: "inspect", label: "Inspect" },
            ]}
          />
          <ThemeToggle />
        </motion.nav>
      </div>

      <motion.header
        className="intro"
        initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ type: "spring", stiffness: 140, damping: 26, delay: 0.1 }}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={liquid}
          >
            <span className="eyebrow">{tab === "forge" ? "Generator" : "Analyzer"}</span>
            <h1 className={`intro-title${tab === "forge" ? " intro-title--single" : ""}`}>
              {tab === "forge" ? (
                <>
                  <span className="line">Forge keys</span> <em className="line">worth keeping.</em>
                </>
              ) : (
                <>
                  <span className="line">See your password</span>{" "}
                  <em className="line">the way attackers do.</em>
                </>
              )}
            </h1>
          </motion.div>
        </AnimatePresence>
      </motion.header>

      <AnimatePresence mode="wait" initial={false}>
        {tab === "forge" ? (
          <motion.div key="forge" className="page" {...panel}>
            {/* Hero: the secret itself */}
            <motion.section
              className="card hero"
              initial={{ opacity: 0, y: 40, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ ...ease, delay: 0.05 }}
            >
              <div className="hero-top">
                <Segmented
                  label="Generator type"
                  groupId="mode"
                  value={mode}
                  onChange={setMode}
                  options={[
                    { value: "password", label: "Password" },
                    { value: "passphrase", label: "Passphrase" },
                  ]}
                />
                <span className="tier-badge" style={{ color: tier.color }}>
                  <span className="tier-badge-dot" style={{ background: tier.color }} />
                  {tier.label} · {bits.toFixed(0)} bits
                </span>
              </div>

              <OutputDisplay
                value={value}
                scrambleKey={scrambleKey}
                copied={copiedKey === "main"}
                onCopy={copyCurrent}
                onRegenerate={regenerate}
              />

              <p className="hero-foot">
                <span>Generated with crypto.getRandomValues, never leaves this tab</span>
                <span className="kbd-hints">
                  <kbd>G</kbd> generate <kbd>C</kbd> copy
                </span>
              </p>
            </motion.section>

            <div className="bento">
              {/* Customize */}
              <motion.section
                className="card panel"
                initial={{ opacity: 0, y: 40, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ ...ease, delay: 0.12 }}
              >
                <PanelHead
                  tone="violet"
                  icon={<SlidersIcon />}
                  title="Customize"
                  subtitle={mode === "password" ? "Length and character sets" : "Words and formatting"}
                />

                <AnimatePresence mode="wait" initial={false}>
                  {mode === "password" ? (
                    <motion.div key="pw" className="stack" {...panel}>
                      <div className="group">
                        <Slider
                          label="Length"
                          value={pw.length}
                          min={4}
                          max={64}
                          unit="chars"
                          onChange={(length) => setPw({ ...pw, length })}
                        />
                      </div>

                      <div className="group">
                        <span className="group-label">Character sets</span>
                        <div className="charset-grid" role="group" aria-label="Character sets">
                          {CHARSET_KEYS.map((k) => {
                            const on = pw.sets[k];
                            return (
                              <motion.button
                                key={k}
                                type="button"
                                role="checkbox"
                                aria-checked={on}
                                className="charset"
                                data-on={on}
                                onClick={() => toggleSet(k)}
                                whileHover={{ y: -1 }}
                                whileTap={{ scale: 0.98 }}
                                animate={shake === k ? { x: [0, -8, 8, -5, 5, 0] } : { x: 0 }}
                                transition={shake === k ? { duration: 0.4 } : liquid}
                                onAnimationComplete={() => shake === k && setShake(null)}
                              >
                                <span className="charset-check">
                                  <AnimatePresence>
                                    {on && (
                                      <motion.span
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        exit={{ scale: 0 }}
                                        transition={{ type: "spring", stiffness: 500, damping: 40 }}
                                        className="icon-wrap"
                                      >
                                        <CheckIcon width={12} height={12} strokeWidth={3} />
                                      </motion.span>
                                    )}
                                  </AnimatePresence>
                                </span>
                                <span className="charset-text">
                                  <span className="charset-label">{CHARSETS[k].label}</span>
                                  <span className="charset-hint">{CHARSETS[k].hint}</span>
                                </span>
                              </motion.button>
                            );
                          })}
                        </div>
                      </div>

                      <Switch
                        label="Exclude look-alikes"
                        description="Drops 0 O o 1 l I | so it's easy to retype"
                        checked={pw.excludeLookalikes}
                        onChange={(excludeLookalikes) => setPw({ ...pw, excludeLookalikes })}
                      />

                      <p className="formula">
                        <span>{pw.length} × log₂({poolSize})</span>
                        <span>− required-set penalty</span>
                        <span>=</span>
                        <strong>{bits.toFixed(1)} bits</strong>
                      </p>
                    </motion.div>
                  ) : (
                    <motion.div key="pp" className="stack" {...panel}>
                      <div className="group">
                        <Slider
                          label="Words"
                          value={pp.words}
                          min={3}
                          max={10}
                          unit="words"
                          onChange={(words) => setPp({ ...pp, words })}
                        />
                      </div>

                      <div className="group">
                        <span className="group-label">Separator</span>
                        <Segmented
                          small
                          label="Separator"
                          groupId="sep"
                          value={pp.separator}
                          onChange={(separator) => setPp({ ...pp, separator })}
                          options={SEPARATORS}
                        />
                        <span className="group-label">Capitalization</span>
                        <Segmented<Capitalization>
                          small
                          label="Capitalization"
                          groupId="caps"
                          value={pp.capitalization}
                          onChange={(capitalization) => setPp({ ...pp, capitalization })}
                          options={[
                            { value: "none", label: "none" },
                            { value: "first", label: "Title" },
                            { value: "random", label: "rAnDoM" },
                          ]}
                        />
                      </div>

                      <Switch
                        label="Add a number"
                        description="Appends a random digit to a random word"
                        checked={pp.includeNumber}
                        onChange={(includeNumber) => setPp({ ...pp, includeNumber })}
                      />

                      <p className="formula">
                        <span>{WORDLIST.length} words</span>
                        <span>^</span>
                        <span>{pp.words}</span>
                        {pp.capitalization === "random" && <span>+ {pp.words} caps</span>}
                        {pp.includeNumber && <span>+ digit</span>}
                        <span>=</span>
                        <strong>{bits.toFixed(1)} bits</strong>
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.section>

              <motion.div
                className="bento-col"
                initial={{ opacity: 0, y: 40, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ ...ease, delay: 0.2 }}
              >
                <section className="card panel">
                  <PanelHead tone="tier" icon={<GaugeIcon />} title="Strength" subtitle="Exact entropy of this generator" />
                  <StrengthMeter bits={bits} scenario={scenario} onScenario={setScenario} idPrefix="forge" />
                </section>
                {historyPanel}
              </motion.div>
            </div>
          </motion.div>
        ) : (
          <motion.div key="inspect" className="page" {...panel}>
            <Tester scenario={scenario} onScenario={setScenario} sidebar={historyPanel} />
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="footer">
        <span className="footer-brand">© {new Date().getFullYear()} Vaultsmith</span>
        <nav className="footer-links" aria-label="Footer">
          <button type="button" onClick={() => { setMode("password"); goTo("forge"); }}>Password</button>
          <button type="button" onClick={() => { setMode("passphrase"); goTo("forge"); }}>Passphrase</button>
          <button type="button" onClick={() => goTo("inspect")}>Inspector</button>
        </nav>
        <span className="kbd-hints">
          <kbd>G</kbd> generate <kbd>C</kbd> copy
        </span>
      </footer>

      <div className="credit-line">
        <a
          className="credit"
          href="https://www.dhruvupadhyay.com/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Made with <HeartIcon width={11} height={11} className="credit-heart" /> by Dhruv
        </a>
      </div>
    </div>
  );
}
