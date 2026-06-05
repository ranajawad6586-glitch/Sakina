"use client";

import { useEffect, useState } from "react";
import { DEFAULT_RECITER_ID, RECITERS } from "@/lib/reciters";

const STORAGE_KEY = "sakina:reciter";
const CHANGE_EVENT = "sakina:reciter-changed";

export function ReciterPicker() {
  const [selected, setSelected] = useState(DEFAULT_RECITER_ID);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored && RECITERS.some((r) => r.id === stored)) {
        setSelected(stored);
      }
    } catch {
      // ignore
    }
    setReady(true);
  }, []);

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value;
    setSelected(value);
    try {
      window.localStorage.setItem(STORAGE_KEY, value);
    } catch {
      // ignore
    }
    window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
  }

  return (
    <div
      className="font-cinzel mt-6 inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.2em] text-gold-deep"
      style={{ visibility: ready ? "visible" : "hidden" }}
    >
      <label htmlFor="reciter-select">Recited by</label>
      <select
        id="reciter-select"
        value={selected}
        onChange={onChange}
        className="font-cormorant rounded border border-line bg-surface px-3 py-1.5 text-[14px] normal-case tracking-normal text-cream focus:border-gold focus:outline-none"
      >
        {RECITERS.map((r) => (
          <option key={r.id} value={r.id}>
            {r.name}
          </option>
        ))}
      </select>
    </div>
  );
}
