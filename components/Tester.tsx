"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState, type ReactNode } from "react";
import { analyzePassword } from "@/lib/analyze";
import { tierFor } from "@/lib/entropy";
import { AlertIcon, CheckIcon, EyeIcon, EyeOffIcon, GaugeIcon, PanelHead, SearchIcon } from "./Icons";
import StrengthMeter from "./StrengthMeter";

const CLASS_LABELS = {
  lower: "a–z",
  upper: "A–Z",
  digits: "0–9",
  symbols: "#$&",
  other: "Unicode",
} as const;

export default function Tester({
  scenario,
  onScenario,
  sidebar,
}: {
  scenario: string;
  onScenario: (id: string) => void;
  sidebar: ReactNode;
}) {
  const [input, setInput] = useState("");
  const [visible, setVisible] = useState(false);
  const analysis = useMemo(() => analyzePassword(input), [input]);
  const naive = input ? [...input].length * Math.log2(Math.max(analysis.poolSize, 2)) : 0;
  const tier = tierFor(analysis.bits);

  return (
    <>
      <section className="card hero">
        <div className="hero-top">
          <div className="hero-titles">
            <span className="eyebrow">Inspect</span>
            <h2>How strong is yours?</h2>
          </div>
          {input && (
            <span className="tier-badge" style={{ color: tier.color }}>
              <span className="tier-badge-dot" style={{ background: tier.color }} />
              {tier.label} · {analysis.bits.toFixed(0)} bits
            </span>
          )}
        </div>

        <div className="tester-input-wrap">
          <SearchIcon className="tester-search" />
          <input
            className="tester-input"
            type={visible ? "text" : "password"}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type or paste a password…"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            aria-label="Password to test"
            autoFocus
          />
          <motion.button
            type="button"
            className="icon-btn"
            onClick={() => setVisible((v) => !v)}
            whileTap={{ scale: 0.95 }}
            aria-label={visible ? "Hide password" : "Show password"}
          >
            {visible ? <EyeOffIcon /> : <EyeIcon />}
          </motion.button>
        </div>

        <div className="class-row">
          {(Object.keys(CLASS_LABELS) as (keyof typeof CLASS_LABELS)[]).map((k) => (
            <span key={k} className="class-chip" data-on={analysis.classes[k]}>
              {CLASS_LABELS[k]}
            </span>
          ))}
          <span className="class-pool">Checked locally · pool {analysis.poolSize}</span>
        </div>
      </section>

      <div className="bento">
        <div className="bento-col">
          <section className="card panel">
            <PanelHead tone="tier" icon={<GaugeIcon />} title="Strength" subtitle="Pattern-aware estimate" />
            <StrengthMeter bits={analysis.bits} scenario={scenario} onScenario={onScenario} idPrefix="test" />
          </section>

          <section className="card panel">
            <PanelHead tone="violet" icon={<AlertIcon />} title="Findings" subtitle="What an attacker would exploit" />
            <div className="compare">
              <div>
                <span className="eyebrow">Naive math</span>
                <strong>{naive.toFixed(1)} bits</strong>
                <span className="muted small">length × log₂(pool)</span>
              </div>
              <div className="compare-arrow" aria-hidden="true">→</div>
              <div>
                <span className="eyebrow">Pattern-aware</span>
                <strong style={{ color: input ? tier.color : undefined }}>{analysis.bits.toFixed(1)} bits</strong>
                <span className="muted small">what an attacker pays</span>
              </div>
            </div>

            <ul className="findings">
              <AnimatePresence initial={false}>
                {!input && (
                  <motion.li key="idle" className="finding finding-idle" exit={{ opacity: 0, height: 0 }}>
                    <SearchIcon width={16} height={16} />
                    <span>Start typing to see the breakdown.</span>
                  </motion.li>
                )}
                {analysis.findings.map((f) => (
                  <motion.li
                    key={f.kind}
                    layout
                    className="finding"
                    initial={{ opacity: 0, height: 0, y: -6 }}
                    animate={{ opacity: 1, height: "auto", y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.22 }}
                  >
                    <AlertIcon width={16} height={16} />
                    <span>{f.message}</span>
                  </motion.li>
                ))}
                {input && analysis.findings.length === 0 && (
                  <motion.li
                    key="clean"
                    className="finding finding-good"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <CheckIcon width={16} height={16} />
                    <span>No obvious patterns found.</span>
                  </motion.li>
                )}
              </AnimatePresence>
            </ul>
          </section>
        </div>
        <div className="bento-col">{sidebar}</div>
      </div>
    </>
  );
}
