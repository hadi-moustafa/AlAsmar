import type { Currency } from "./types";

export function formatPrice(amount: number, currency: Currency) {
  if (currency === "LBP") {
    return `${Math.round(amount).toLocaleString("en-US")} ل.ل`;
  }
  const fixed = Number.isInteger(amount) ? amount.toString() : amount.toFixed(2);
  return `$${fixed}`;
}
