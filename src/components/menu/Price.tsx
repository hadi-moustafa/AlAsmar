import { formatPrice } from "@/lib/format";
import type { Currency } from "@/lib/types";

/** A price kept left-to-right so "$3" doesn't flip to "3$" inside Arabic text. */
export function Price({ amount, currency }: { amount: number; currency: Currency }) {
  return (
    <bdi dir="ltr" className="tabular-nums">
      {formatPrice(amount, currency)}
    </bdi>
  );
}
