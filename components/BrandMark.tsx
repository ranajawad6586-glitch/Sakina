export function BrandMark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 50 50"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="sakinaBrandGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#e8c08a" />
          <stop offset="100%" stopColor="#b8895a" />
        </linearGradient>
      </defs>
      <polygon
        points="25,3 47,25 25,47 3,25"
        fill="none"
        stroke="url(#sakinaBrandGrad)"
        strokeWidth="1.5"
      />
      <polygon
        points="25,11 39,25 25,39 11,25"
        fill="none"
        stroke="url(#sakinaBrandGrad)"
        strokeWidth="1"
      />
      <circle
        cx="25"
        cy="25"
        r="4"
        fill="url(#sakinaBrandGrad)"
        opacity="0.7"
      />
    </svg>
  );
}
