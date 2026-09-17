"use client";

import { AnimatePresence, motion } from "framer-motion";
import { tierFor } from "@/lib/entropy";
import { CheckIcon, ClockIcon, CopyIcon, LockIcon, PanelHead, TrashIcon } from "./Icons";

export interface HistoryItem {
  id: number;
  value: string;
  bits: number;
}

export default function History({
  items,
  copiedKey,
  onCopy,
  onClear,
}: {
  items: HistoryItem[];
  copiedKey: string | null;
  onCopy: (item: HistoryItem) => void;
  onClear: () => void;
}) {
  return (
    <section className="card panel">
      <PanelHead
        tone="pink"
        icon={<ClockIcon />}
        title="Recent"
        subtitle="This session only, never saved"
        action={
          <AnimatePresence>
            {items.length > 0 && (
              <motion.button
                type="button"
                className="ghost-btn"
                onClick={onClear}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                whileTap={{ scale: 0.96 }}
              >
                <TrashIcon width={14} height={14} /> Clear
              </motion.button>
            )}
          </AnimatePresence>
        }
      />

      <ul className="history-list">
        <AnimatePresence initial={false}>
          {items.length === 0 && (
            <motion.li
              key="empty"
              className="history-empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <LockIcon width={22} height={22} />
              <span>Passwords you generate or copy show up here, blurred until you hover.</span>
            </motion.li>
          )}
          {items.map((item) => {
            const tier = tierFor(item.bits);
            const key = `h-${item.id}`;
            const copied = copiedKey === key;
            return (
              <motion.li
                key={item.id}
                layout
                className="history-item"
                initial={{ opacity: 0, x: -16, scale: 0.96 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 16, scale: 0.96 }}
                transition={{ type: "spring", stiffness: 300, damping: 38 }}
              >
                <span className="history-bar" style={{ background: tier.color }} aria-hidden="true" />
                <button type="button" className="history-value" onClick={() => onCopy(item)} title="Click to copy">
                  {item.value}
                </button>
                <span className="history-meta">
                  <span className="chip" style={{ color: tier.color }}>
                    {Math.round(item.bits)} bits
                  </span>
                  <motion.button
                    type="button"
                    className="icon-btn icon-btn-sm"
                    onClick={() => onCopy(item)}
                    whileTap={{ scale: 0.94 }}
                    aria-label="Copy"
                  >
                    {copied ? <CheckIcon width={14} height={14} /> : <CopyIcon width={14} height={14} />}
                  </motion.button>
                </span>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ul>
    </section>
  );
}
