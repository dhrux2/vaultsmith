"use client";

declare global {
  interface PasswordCredentialData {
    id: string;
    password: string;
    name?: string;
    iconURL?: string;
  }
  interface PasswordCredential extends Credential {
    readonly password: string;
  }
  // eslint-disable-next-line no-var
  var PasswordCredential: {
    prototype: PasswordCredential;
    new (data: PasswordCredentialData): PasswordCredential;
  };
}

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useRef, useState } from "react";
import { liquid } from "./Controls";
import { CheckIcon, KeyIcon } from "./Icons";

type Status = "idle" | "saving" | "saved" | "unsupported";

export default function SaveCredential({ password }: { password: string }) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [username, setUsername] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const urlRef = useRef<HTMLInputElement>(null);

  const supported = typeof window !== "undefined" && "credentials" in navigator && "PasswordCredential" in window;

  const save = useCallback(async () => {
    if (!supported || !password) return;
    setStatus("saving");
    try {
      const cred = new PasswordCredential({
        id: username || "user",
        password,
        name: url || undefined,
        iconURL: undefined,
      });
      await navigator.credentials.store(cred);
      setStatus("saved");
      setTimeout(() => {
        setStatus("idle");
        setOpen(false);
        setUrl("");
        setUsername("");
      }, 1800);
    } catch {
      setStatus("idle");
    }
  }, [supported, password, url, username]);

  if (!supported) return null;

  return (
    <div className="save-cred">
      <AnimatePresence mode="wait" initial={false}>
        {!open ? (
          <motion.button
            key="trigger"
            type="button"
            className="save-btn"
            onClick={() => {
              setOpen(true);
              requestAnimationFrame(() => urlRef.current?.focus());
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            transition={liquid}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            title="Save to password manager"
            aria-label="Save to password manager"
          >
            <KeyIcon width={15} height={15} />
            Save
          </motion.button>
        ) : (
          <motion.form
            key="form"
            className="save-form"
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={liquid}
            onSubmit={(e) => {
              e.preventDefault();
              save();
            }}
          >
            <input
              ref={urlRef}
              type="text"
              className="save-input"
              placeholder="Website (e.g. github.com)"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              autoComplete="off"
              spellCheck={false}
            />
            <input
              type="text"
              className="save-input"
              placeholder="Username or email"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="off"
              spellCheck={false}
            />
            <div className="save-actions">
              <button
                type="button"
                className="ghost-btn"
                onClick={() => {
                  setOpen(false);
                  setUrl("");
                  setUsername("");
                  setStatus("idle");
                }}
              >
                Cancel
              </button>
              <motion.button
                type="submit"
                className="save-confirm"
                disabled={status === "saving" || status === "saved"}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                transition={liquid}
              >
                {status === "saved" ? (
                  <>
                    <CheckIcon width={14} height={14} /> Saved
                  </>
                ) : (
                  <>
                    <KeyIcon width={14} height={14} /> Save to manager
                  </>
                )}
              </motion.button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
