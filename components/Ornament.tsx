export function Ornament({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex items-center justify-center gap-4 ${className}`}
      aria-hidden="true"
    >
      <span
        className="block h-px w-20"
        style={{
          background:
            "linear-gradient(90deg, transparent, var(--gold), transparent)",
        }}
      />
      <span className="text-[14px] text-gold">✦</span>
      <span
        className="block h-px w-20"
        style={{
          background:
            "linear-gradient(90deg, transparent, var(--gold), transparent)",
        }}
      />
    </div>
  );
}
