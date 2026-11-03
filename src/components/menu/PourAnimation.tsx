"use client";

/** A pot filling a cup. Purely decorative: it never blocks taps on the menu. */
export function PourAnimation({ onDone }: { onDone: () => void }) {
  return (
    <div className="app-col pointer-events-none fixed inset-x-0 bottom-24 z-[60] flex justify-center" aria-hidden>
      <div
        className="pour-card rounded-[28px] bg-surface/95 p-3 shadow-2xl shadow-black/50 ring-1 ring-line backdrop-blur"
        onAnimationEnd={(e) => {
          if (e.target === e.currentTarget) onDone();
        }}
      >
        <svg viewBox="0 0 120 120" className="size-28">
          <defs>
            <clipPath id="pour-cup-inside">
              <path d="M36 62h42v22a14 14 0 0 1-14 14H50a14 14 0 0 1-14-14z" />
            </clipPath>
          </defs>

          {/* Steam, once the cup is full */}
          <g className="pour-steam" fill="none" stroke="var(--color-muted)" strokeWidth="2.5" strokeLinecap="round">
            <path d="M47 54c-3-4 3-6 0-11" />
            <path d="M67 54c-3-4 3-6 0-11" />
          </g>

          {/* Coffee rising inside the cup */}
          <g clipPath="url(#pour-cup-inside)">
            <rect x="36" y="62" width="42" height="36" fill="var(--color-mocha)" />
            <g className="pour-fill">
              <rect x="36" y="66" width="42" height="34" fill="var(--color-caramel-dark)" />
              <rect x="36" y="66" width="42" height="4" fill="var(--color-honey)" />
            </g>
          </g>

          {/* Stream */}
          <rect className="pour-stream" x="55" y="26" width="4" height="70" rx="2" fill="var(--color-caramel-dark)" />

          {/* Cup */}
          <path
            d="M36 62h42v22a14 14 0 0 1-14 14H50a14 14 0 0 1-14-14z"
            fill="none"
            stroke="var(--color-cream)"
            strokeWidth="4"
            strokeLinejoin="round"
          />
          <path d="M78 68h4a9 9 0 0 1 0 18h-5" fill="none" stroke="var(--color-cream)" strokeWidth="4" strokeLinecap="round" />
          <path d="M30 106h54" stroke="var(--color-cream)" strokeWidth="4" strokeLinecap="round" />

          {/* Pot, tipping over the cup */}
          <g className="pour-pot">
            <path d="M58 26 72 14h26v22a6 6 0 0 1-6 6H78a6 6 0 0 1-6-6v-4z" fill="var(--color-caramel)" />
            <path d="M98 19h5a6 6 0 0 1 6 6v3a6 6 0 0 1-6 6h-5" fill="none" stroke="var(--color-caramel)" strokeWidth="4" />
            <rect x="74" y="9" width="22" height="5" rx="2.5" fill="var(--color-honey)" />
          </g>
        </svg>
      </div>
    </div>
  );
}
