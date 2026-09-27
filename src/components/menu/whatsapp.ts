import { formatPrice } from "@/lib/format";
import type { Currency } from "@/lib/types";
import type { CartLine } from "./cart";

export type OrderType = "dine_in" | "pickup" | "delivery";

export const ORDER_TYPES: Record<OrderType, { label: string; emoji: string }> = {
  dine_in: { label: "في المقهى", emoji: "🪑" },
  pickup: { label: "استلام", emoji: "🛍️" },
  delivery: { label: "توصيل", emoji: "🛵" },
};

export type OrderDetails = {
  type: OrderType;
  name: string;
  phone: string;
  table: string;
  address: string;
  notes: string;
};

// No emoji in the message: WhatsApp's link redirect has been known to corrupt them into "�".
export function buildOrderMessage(lines: CartLine[], total: number, currency: Currency, d: OrderDetails) {
  const out: string[] = ["*طلب جديد - الأسمر*", ""];
  for (const l of lines) {
    const opt = l.option ? ` (${l.option})` : "";
    out.push(`- ${l.qty} × ${l.name}${opt}: ${formatPrice(l.qty * l.unitPrice, currency)}`);
  }
  out.push("", `*المجموع: ${formatPrice(total, currency)}*`, "");
  out.push(`نوع الطلب: ${ORDER_TYPES[d.type].label}`);
  if (d.name) out.push(`الاسم: ${d.name}`);
  if (d.phone) out.push(`الهاتف: ${d.phone}`);
  if (d.type === "dine_in" && d.table) out.push(`رقم الطاولة: ${d.table}`);
  if (d.type === "delivery" && d.address) out.push(`العنوان: ${d.address}`);
  if (d.notes) out.push(`ملاحظات: ${d.notes}`);
  return out.join("\n");
}

export function whatsappUrl(number: string, message: string) {
  const phone = number.replace(/[^\d]/g, "");
  return `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(message)}`;
}
