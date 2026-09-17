"use client";

import { useEffect, useRef } from "react";

type Orb = { x: number; y: number; size: number; kind: "disc" | "ring" };

/**
 * Scattered layout, generated once from a fixed seed so server and client
 * render identically (no hydration mismatch) while still looking random.
 * x / y are in vw / vh; size is in px. Deeper layers extend further down
 * because they travel further on scroll.
 */
function scatter(seed: number, count: number, yRange: number): Orb[] {
  let s = seed;
  const rand = () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
  return Array.from({ length: count }, () => ({
    x: rand() * 110 - 5,
    y: rand() * yRange - 8,
    size: Math.round(80 + Math.pow(rand(), 1.6) * 640),
    kind: rand() < 0.3 ? "ring" : "disc",
  }));
}

const LAYERS = [
  { depth: 0.03, orbs: scatter(7, 6, 110) },
  { depth: 0.07, orbs: scatter(131, 6, 130) },
  { depth: 0.12, orbs: scatter(911, 5, 150) },
];

/** Near-invisible embossed circles across the page, moving only slightly on scroll. */
export default function Aurora() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const layers = Array.from(root.current?.querySelectorAll<HTMLElement>(".orb-layer") ?? []);
    let frame = 0;

    const update = () => {
      frame = 0;
      const y = window.scrollY;
      layers.forEach((layer) => {
        const depth = Number(layer.dataset.depth ?? 0);
        layer.style.transform = `translate3d(0, ${(-y * depth).toFixed(1)}px, 0)`;
      });
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div ref={root} className="backdrop" aria-hidden="true">
      {LAYERS.map((layer, li) => (
        <div key={li} className="orb-layer" data-depth={layer.depth}>
          {layer.orbs.map((o, i) => (
            <div
              key={i}
              className={`orb ${o.kind === "ring" ? "orb-ring" : "orb-emboss"}`}
              style={{
                left: `${o.x}vw`,
                top: `${o.y}vh`,
                width: o.size,
                height: o.size,
                marginLeft: -o.size / 2,
                marginTop: -o.size / 2,
              }}
            />
          ))}
        </div>
      ))}
      <div className="grain" />
    </div>
  );
}
