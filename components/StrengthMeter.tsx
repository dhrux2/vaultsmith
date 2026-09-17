"use client";

import { AnimatePresence, motion, useSpring, useTransform } from "framer-motion";
import { useEffect } from "react";
import { crackTime, SCENARIOS, TIERS, tierFor } from "@/lib/entropy";
import { Segmented } from "./Controls";

const BOUNDS = [...TIERS.map((t) => t.min), 128];
const spring = { type: "spring", stiffness: 170, damping: 28, mass: 1 } as const;

export default function StrengthMeter({
  bits,
  scenario,
  onScenario,
  idPrefix,
}: {
  bits: number;
  scenario: string;
  onScenario: (id: string) => void;
  idPrefix: string;
}) {
  const tier = tierFor(bits);
  const active = SCENARIOS.find((s) => s.id === scenario) ?? SCENARIOS[0];

  const animatedBits = useSpring(bits, { stiffness: 120, damping: 24 });
  useEffect(() => animatedBits.set(bits), [bits, animatedBits]);
  const bitsText = useTransform(animatedBits, (v) => Math.max(0, v).toFixed(1));

  const time = crackTime(bits, active.guessesPerSecond);

  return (
    <section className="meter" aria-label="Strength" style={{ "--tier": tier.color } as React.CSSProperties}>
      <div className="meter-head">
        <div className="meter-tier" aria-live="polite">
          <motion.span className="tier-dot" animate={{ backgroundColor: tier.color }} />
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={tier.label}
              className="tier-label"
              initial={{ y: 14, opacity: 0 }}
              animate={{ y: 0, opacity: 1, color: tier.color }}
              exit={{ y: -14, opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              {tier.label}
            </motion.span>
          </AnimatePresence>
        </div>
        <div className="meter-bits">
          <motion.span className="bits-num">{bitsText}</motion.span>
          <span className="bits-unit">bits of entropy</span>
        </div>
      </div>

      <div className="meter-bar" role="meter" aria-valuemin={0} aria-valuemax={128} aria-valuenow={Math.round(bits)}>
        {TIERS.map((t, i) => {
          const lo = BOUNDS[i];
          const hi = BOUNDS[i + 1];
          const fill = Math.min(1, Math.max(0, (bits - lo) / (hi - lo)));
          return (
            <div key={t.label} className="meter-seg">
              <motion.div
                className="meter-fill"
                initial={false}
                animate={{ scaleX: fill, backgroundColor: tier.color }}
                transition={{ ...spring, delay: i * 0.03 }}
              />
            </div>
          );
        })}
      </div>
      <p className="meter-blurb">{tier.blurb}</p>

      <div className="crack">
        <div className="crack-head">
          <span className="eyebrow">Average time to crack</span>
          <Segmented
            small
            label="Attack scenario"
            groupId={`${idPrefix}-scenario`}
            value={active.id}
            onChange={onScenario}
            options={SCENARIOS.map((s) => ({ value: s.id, label: s.label }))}
          />
        </div>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={time}
            className="crack-time"
            initial={{ opacity: 0, y: 6, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -6, filter: "blur(6px)" }}
            transition={{ duration: 0.2 }}
          >
            {time}
          </motion.div>
        </AnimatePresence>
        <p className="crack-detail">{active.detail}</p>
      </div>
    </section>
  );
}
