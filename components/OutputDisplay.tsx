"use client";

import { AnimatePresence, motion } from "framer-motion";
import gsap from "gsap";
import { useEffect, useRef, useState } from "react";
import { liquid } from "./Controls";
import { CheckIcon, CopyIcon, RefreshIcon } from "./Icons";

const GLYPHS = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&*?";

function charClass(c: string): string {
  if (/[0-9]/.test(c)) return "ch-digit";
  if (/[A-Za-z]/.test(c)) return "";
  return "ch-symbol";
}

export default function OutputDisplay({
  value,
  scrambleKey,
  copied,
  onCopy,
  onRegenerate,
}: {
  value: string;
  scrambleKey: number;
  copied: boolean;
  onCopy: () => void;
  onRegenerate: () => void;
}) {
  const [display, setDisplay] = useState(value);
  const [spins, setSpins] = useState(0);
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
  const lastKey = useRef(scrambleKey);
  const lastValue = useRef("");

  // "Forging" effect: characters settle left-to-right out of random glyphs.
  useEffect(() => {
    const prevKey = lastKey.current;
    const prevValue = lastValue.current;
    const shouldScramble = scrambleKey !== prevKey || (prevValue === "" && value !== "");
    lastKey.current = scrambleKey;
    lastValue.current = value;

    if (!shouldScramble || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplay(value);
      return;
    }

    const state = { p: 0 };
    const tween = gsap.to(state, {
      p: 1,
      duration: Math.min(0.9, 0.35 + value.length * 0.012),
      ease: "power2.out",
      onUpdate: () => {
        const settled = Math.floor(state.p * value.length);
        let s = value.slice(0, settled);
        for (let i = settled; i < value.length; i++) {
          s += GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        }
        setDisplay(s);
      },
      onComplete: () => setDisplay(value),
    });

    return () => {
      // If interrupted (e.g. Strict Mode remount), allow the next run to animate again.
      if (tween.progress() < 1) {
        lastKey.current = prevKey;
        lastValue.current = prevValue;
      }
      tween.kill();
    };
  }, [value, scrambleKey]);

  const size = value.length > 44 ? "sm" : value.length > 26 ? "md" : "lg";

  return (
    <div className="output" data-copied={copied}>
      <button
        type="button"
        className="output-text"
        data-size={size}
        onClick={onCopy}
        aria-label={`Generated secret: ${value}. Click to copy.`}
        title="Click to copy"
      >
        {display ? (
          [...display].map((c, i) => (
            <span key={i} className={charClass(c)}>
              {c}
            </span>
          ))
        ) : (
          <span className="output-placeholder">forging…</span>
        )}
      </button>

      <div className="output-actions">
        <motion.button
          type="button"
          className="icon-btn"
          onClick={() => {
            setSpins((s) => s + 1);
            onRegenerate();
          }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.95 }}
          transition={liquid}
          aria-label="Generate a new one (G)"
          title="Generate new (G)"
        >
          <motion.span
            className="icon-wrap"
            animate={{ rotate: spins * 360 }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          >
            <RefreshIcon />
          </motion.span>
        </motion.button>

        <motion.button
          type="button"
          className="copy-btn"
          data-copied={copied}
          onClick={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            const id = Date.now();
            setRipples((rs) => [...rs, { id, x: e.clientX - r.left, y: e.clientY - r.top }]);
            onCopy();
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          transition={liquid}
          aria-label="Copy to clipboard (C)"
          title="Copy (C)"
        >
          <AnimatePresence>
            {ripples.map((rp) => (
              <motion.span
                key={rp.id}
                className="ripple"
                style={{ left: rp.x, top: rp.y }}
                initial={{ scale: 0, opacity: 0.55 }}
                animate={{ scale: 9, opacity: 0 }}
                transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
                onAnimationComplete={() => setRipples((rs) => rs.filter((x) => x.id !== rp.id))}
              />
            ))}
          </AnimatePresence>
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={copied ? "done" : "copy"}
              className="copy-inner"
              initial={{ y: 12, opacity: 0, filter: "blur(4px)" }}
              animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
              exit={{ y: -12, opacity: 0, filter: "blur(4px)" }}
              transition={{ duration: 0.18 }}
            >
              {copied ? <CheckIcon /> : <CopyIcon />}
              {copied ? "Copied" : "Copy"}
            </motion.span>
          </AnimatePresence>
        </motion.button>
      </div>
    </div>
  );
}
