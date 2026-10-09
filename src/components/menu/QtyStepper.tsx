"use client";

import { MinusIcon, PlusIcon } from "../icons";

export function QtyStepper({
  qty,
  onChange,
  size = "md",
}: {
  qty: number;
  onChange: (qty: number) => void;
  size?: "sm" | "md";
}) {
  const btn = size === "sm" ? "size-8" : "size-11";
  return (
    <div className="flex items-center rounded-full bg-surface-2 p-1 ring-1 ring-line">
      <button
        type="button"
        className={`${btn} grid place-items-center rounded-full bg-caramel text-ink transition active:scale-90`}
        onClick={() => onChange(qty + 1)}
        aria-label="زيادة"
      >
        <PlusIcon width={16} height={16} strokeWidth={2.5} />
      </button>
      <span className={`${size === "sm" ? "min-w-7 text-sm" : "min-w-9 text-base"} text-center font-bold tabular-nums`}>{qty}</span>
      <button
        type="button"
        className={`${btn} grid place-items-center rounded-full text-cream transition active:scale-90 active:bg-line`}
        onClick={() => onChange(qty - 1)}
        aria-label="إنقاص"
      >
        <MinusIcon width={16} height={16} strokeWidth={2.5} />
      </button>
    </div>
  );
}
