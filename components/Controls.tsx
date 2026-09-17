"use client";

import {
  motion,
  useMotionTemplate,
  useSpring,
  useTransform,
  useVelocity,
} from "framer-motion";
import { useId, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

/** Shared motion: critically damped, smooth and settled with no bounce. */
export const liquid = { type: "spring", stiffness: 260, damping: 34, mass: 1 } as const;
export const press = {
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.97 },
  transition: liquid,
};

/**
 * iOS-style segmented control. The selection pill is driven by springs and
 * stretches along its direction of travel (velocity → width), then snaps back
 * like a droplet. Pressing anywhere on the track makes the pill swell slightly.
 */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
  small,
}: {
  options: { value: T; label: ReactNode }[];
  value: T;
  onChange: (v: T) => void;
  groupId?: string;
  label: string;
  small?: boolean;
}) {
  const track = useRef<HTMLDivElement>(null);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const [ready, setReady] = useState(false);
  const [pressed, setPressed] = useState(false);

  // Critically damped glide (~0.45s), no overshoot.
  const springCfg = { stiffness: 220, damping: 30, mass: 1 };
  const x = useSpring(0, springCfg);
  const y = useSpring(0, springCfg);
  const w = useSpring(0, springCfg);
  const h = useSpring(0, springCfg);

  const vx = useVelocity(x);
  const stretch = useTransform(vx, (v) => Math.min(Math.abs(v) * 0.012, 8));
  const width = useTransform(() => w.get() + stretch.get());
  const left = useTransform(() => x.get() - stretch.get() / 2);
  const squash = useTransform(stretch, [0, 8], [1, 0.96]);
  const transform = useMotionTemplate`translate(${left}px, ${y}px) scaleY(${squash})`;

  const index = Math.max(0, options.findIndex((o) => o.value === value));

  const indexRef = useRef(index);
  indexRef.current = index;

  const place = (instant: boolean) => {
    const b = buttons.current[indexRef.current];
    if (!b) return;
    const apply = instant ? "jump" : "set";
    x[apply](b.offsetLeft);
    y[apply](b.offsetTop);
    w[apply](b.offsetWidth);
    h[apply](b.offsetHeight);
  };

  // Selection changed: glide to the new button (first placement is instant).
  useLayoutEffect(() => {
    place(!ready);
    if (!ready) setReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, options.length]);

  // Track resized (fonts loading, viewport change): snap without animating.
  // One observer for the component's lifetime, ignoring its initial callback,
  // so it can never interrupt a slide in progress.
  useLayoutEffect(() => {
    const el = track.current;
    if (!el) return;
    let lastWidth = el.offsetWidth;
    let lastHeight = el.offsetHeight;
    const ro = new ResizeObserver(() => {
      if (el.offsetWidth === lastWidth && el.offsetHeight === lastHeight) return;
      lastWidth = el.offsetWidth;
      lastHeight = el.offsetHeight;
      place(true);
    });
    ro.observe(el);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={track}
      className={`segmented${small ? " segmented-sm" : ""}`}
      role="radiogroup"
      aria-label={label}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
    >
      <motion.span
        className="seg-pill-track"
        style={{ width, height: h, transform, opacity: ready ? 1 : 0 }}
        aria-hidden="true"
      >
        <motion.span className="seg-pill" animate={{ scale: pressed ? 0.97 : 1 }} transition={liquid} />
      </motion.span>
      {options.map((o, i) => {
        const active = o.value === value;
        return (
          <motion.button
            key={o.value}
            ref={(el) => {
              buttons.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={active}
            className="seg-btn"
            data-active={active}
            onClick={() => onChange(o.value)}
            whileTap={{ scale: 0.98 }}
            transition={liquid}
          >
            <span className="seg-label">{o.label}</span>
          </motion.button>
        );
      })}
    </div>
  );
}

export function Slider({
  label,
  value,
  min,
  max,
  unit,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  unit: string;
  onChange: (v: number) => void;
}) {
  const id = useId();
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="field">
      <div className="field-head">
        <label htmlFor={id}>{label}</label>
        <motion.output layout htmlFor={id} className="field-value" transition={liquid}>
          <motion.span
            key={value}
            initial={{ y: -10, opacity: 0, scale: 0.8 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            transition={liquid}
          >
            {value}
          </motion.span>
          <span className="field-unit">{unit}</span>
        </motion.output>
      </div>
      <input
        id={id}
        type="range"
        className="slider"
        min={min}
        max={max}
        value={value}
        style={{ "--pct": `${pct}%` } as CSSProperties}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <div className="slider-scale" aria-hidden="true">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}

/** iOS switch: the knob stretches while held and springs across. */
export function Switch({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  const [held, setHeld] = useState(false);
  return (
    <motion.button
      type="button"
      role="switch"
      aria-checked={checked}
      className="switch-row"
      onClick={() => onChange(!checked)}
      onPointerDown={() => setHeld(true)}
      onPointerUp={() => setHeld(false)}
      onPointerLeave={() => setHeld(false)}
      whileTap={{ scale: 0.985 }}
      transition={liquid}
    >
      <span className="switch-text">
        <span className="switch-label">{label}</span>
        {description && <span className="switch-desc">{description}</span>}
      </span>
      <span className="switch" data-on={checked}>
        <motion.span
          layout
          className="switch-knob"
          animate={{ width: held ? 28 : 24 }}
          transition={{ type: "spring", stiffness: 400, damping: 42 }}
        />
      </span>
    </motion.button>
  );
}
