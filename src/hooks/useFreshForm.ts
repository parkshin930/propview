import { useEffect, useRef } from "react";

type CleanupKey = {
  storage: "local" | "session";
  key: string;
};

type Options = {
  /** When true, run reset on first mount. */
  resetOnMount?: boolean;
  /** When provided, run reset every time this flag becomes true (e.g. modal open). */
  active?: boolean;
  /** Storage keys to remove when reset runs and on unmount. */
  cleanupKeys?: CleanupKey[];
};

function removeKey(k: CleanupKey) {
  try {
    if (typeof window === "undefined") return;
    const s = k.storage === "local" ? window.localStorage : window.sessionStorage;
    s.removeItem(k.key);
  } catch {
    // ignore
  }
}

/**
 * Enforces "always a fresh canvas" for write/edit forms.
 * - Resets state on mount and/or when `active` turns true (modal open)
 * - Removes any draft keys from storage (if provided)
 *
 * Usage:
 *   useFreshForm(resetFn, { active: isOpen })
 */
export function useFreshForm(reset: () => void, options: Options = {}) {
  const { resetOnMount = true, active, cleanupKeys = [] } = options;
  const prevActive = useRef<boolean | undefined>(undefined);

  useEffect(() => {
    if (!resetOnMount) return;
    reset();
    cleanupKeys.forEach(removeKey);
    return () => {
      cleanupKeys.forEach(removeKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (typeof active === "undefined") return;
    const was = prevActive.current;
    prevActive.current = active;
    if (!was && active) {
      reset();
      cleanupKeys.forEach(removeKey);
    }
  }, [active, cleanupKeys, reset]);
}

