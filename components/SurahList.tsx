"use client";

import { useMemo, useState } from "react";
import type { SurahMeta } from "@/lib/types";
import { SurahCard } from "./SurahCard";

type Filter = "all" | "meccan" | "medinan";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "meccan", label: "Meccan" },
  { id: "medinan", label: "Medinan" },
];

export function SurahList({ surahs }: { surahs: SurahMeta[] }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return surahs.filter((s) => {
      if (filter !== "all" && s.type !== filter) return false;
      if (!q) return true;
      return (
        s.name_en.toLowerCase().includes(q) ||
        s.meaning.toLowerCase().includes(q) ||
        String(s.number) === q ||
        s.name_ar.includes(query.trim())
      );
    });
  }, [surahs, query, filter]);

  return (
    <>
      <div className="mb-9 flex flex-wrap items-center justify-between gap-[14px]">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, meaning, or number…"
          aria-label="Search surahs"
          className="font-cormorant min-w-[240px] flex-1 rounded-md border border-line bg-surface px-5 py-[14px] text-[17px] text-cream transition-colors duration-300 placeholder:italic placeholder:text-muted focus:border-gold focus:outline-none"
        />
        <div className="flex gap-2">
          {FILTERS.map((f) => {
            const active = filter === f.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                className={`font-cinzel rounded-md border px-[18px] py-[10px] text-[11px] uppercase tracking-[0.2em] transition-colors duration-250 ${
                  active
                    ? "border-gold bg-gold text-ink"
                    : "border-line bg-transparent text-muted hover:border-gold-deep hover:text-cream"
                }`}
                aria-pressed={active}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="px-5 py-20 text-center text-muted">
          <div className="font-amiri mb-3 text-[28px] text-gold-deep">
            لَا شَيْء
          </div>
          <div>No surahs match your search.</div>
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
          {filtered.map((s) => (
            <SurahCard key={s.number} surah={s} />
          ))}
        </div>
      )}
    </>
  );
}
