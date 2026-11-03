"use client";

export type EffectKind = "pour" | "flip";

/** The little scene shown when an item is added. Decorative: it never blocks taps on the menu. */
export function SelectionEffect({ kind, onDone }: { kind: EffectKind; onDone: () => void }) {
  return (
    <div className="app-col pointer-events-none fixed inset-x-0 bottom-24 z-[60] flex justify-center" aria-hidden>
      <div
        className="effect-card rounded-[28px] bg-surface/95 p-3 shadow-2xl shadow-black/50 ring-1 ring-line backdrop-blur"
        onAnimationEnd={(e) => {
          if (e.target === e.currentTarget) onDone();
        }}
      >
        <svg viewBox="0 0 120 120" className="size-28">
          {kind === "pour" ? <PourScene /> : <FlipScene />}
        </svg>
      </div>
    </div>
  );
}

/** A pot filling a cup. */
function PourScene() {
  return (
    <>
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
    </>
  );
}

/** A pancake tossed from a pan: pale side up on the way out, golden side up on landing. */
function FlipScene() {
  return (
    <>
      {/* Steam after it lands */}
      <g className="flip-steam" fill="none" stroke="var(--color-muted)" strokeWidth="2.5" strokeLinecap="round">
        <path d="M38 72c-3-4 3-6 0-11" />
        <path d="M66 72c-3-4 3-6 0-11" />
      </g>

      {/* Crumbs thrown off by the landing */}
      <g className="flip-crumbs" fill="var(--color-honey)">
        <circle cx="20" cy="78" r="1.8" />
        <circle cx="84" cy="76" r="1.5" />
        <circle cx="28" cy="70" r="1.3" />
      </g>

      {/* Pan */}
      <g className="flip-pan">
        <path d="M20 90h64l-4 11a7 7 0 0 1-6.6 5H30.6a7 7 0 0 1-6.6-5z" fill="var(--color-mocha)" />
        <path d="M18 90h68" stroke="var(--color-cream)" strokeWidth="4" strokeLinecap="round" />
        <path d="M86 90l26-8" stroke="var(--color-cream)" strokeWidth="5" strokeLinecap="round" />
      </g>

      {/* Pancake */}
      <g className="flip-rise">
        <g className="flip-spin">
          <ellipse cx="52" cy="84" rx="27" ry="6.5" fill="var(--color-caramel-dark)" />
          <ellipse className="flip-side-pale" cx="52" cy="81.5" rx="27" ry="6.5" fill="var(--color-latte)" />
          <g className="flip-side-golden">
            <ellipse cx="52" cy="81.5" rx="27" ry="6.5" fill="var(--color-caramel)" />
            <ellipse cx="52" cy="81.5" rx="15" ry="3.2" fill="var(--color-honey)" />
          </g>
        </g>
      </g>
    </>
  );
}
