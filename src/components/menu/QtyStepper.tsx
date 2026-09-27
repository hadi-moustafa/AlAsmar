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
  const btn = size === "sm" ? "size-8" : "size-10";
  return (
    <div className="flex items-center gap-1 rounded-full bg-espresso p-1 text-crema">
      <button type="button" className={`${btn} grid place-items-center rounded-full transition hover:bg-mocha active:scale-90`} onClick={() => onChange(qty + 1)} aria-label="زيادة">
        <PlusIcon width={16} height={16} />
      </button>
      <span className="min-w-6 text-center font-bold tabular-nums">{qty}</span>
      <button type="button" className={`${btn} grid place-items-center rounded-full transition hover:bg-mocha active:scale-90`} onClick={() => onChange(qty - 1)} aria-label="إنقاص">
        <MinusIcon width={16} height={16} />
      </button>
    </div>
  );
}
