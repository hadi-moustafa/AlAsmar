"use client";

import { useEffect, useState } from "react";
import type { Settings } from "@/lib/types";
import { CheckIcon, TrashIcon, WhatsAppIcon } from "../icons";
import type { Cart } from "./cart";
import { QtyStepper } from "./QtyStepper";
import { Sheet } from "./Sheet";
import { buildOrderMessage, ORDER_TYPES, whatsappUrl, type OrderDetails, type OrderType } from "./whatsapp";
import { Price } from "./Price";

const DETAILS_KEY = "alasmar-customer-v1";
const EMPTY: OrderDetails = { type: "dine_in", name: "", phone: "", table: "", address: "", notes: "" };

// 16px text keeps iOS Safari from zooming into the field.
const input =
  "w-full resize-none rounded-2xl bg-surface-2 px-4 py-3 text-base text-cream outline-none ring-1 ring-line transition placeholder:text-muted/70 focus:ring-2 focus:ring-caramel";

function Field({ label, optional, children }: { label: string; optional?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold">
        {label} {optional && <span className="font-normal text-muted">(اختياري)</span>}
      </span>
      {children}
    </label>
  );
}

export function CartSheet({
  open,
  onClose,
  cart,
  settings,
}: {
  open: boolean;
  onClose: () => void;
  cart: Cart;
  settings: Settings;
}) {
  const [d, setD] = useState<OrderDetails>(EMPTY);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const currency = settings.currency;
  const types = (Object.keys(ORDER_TYPES) as OrderType[]).filter(
    (t) => t !== "delivery" || settings.delivery_enabled === "1",
  );

  useEffect(() => {
    try {
      const saved = localStorage.getItem(DETAILS_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- restore remembered customer details
      if (saved) setD({ ...EMPTY, ...JSON.parse(saved), notes: "", table: "" });
    } catch {}
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset status whenever the sheet reopens
    if (open) setSent(false);
  }, [open]);

  const set = <K extends keyof OrderDetails>(k: K, v: OrderDetails[K]) => {
    setError("");
    setD((prev) => ({ ...prev, [k]: v }));
  };

  const send = () => {
    if (!settings.whatsapp_number) return setError("لم يتم ضبط رقم واتساب المقهى بعد");
    if (!d.name.trim()) return setError("الرجاء إدخال اسمك");
    if (d.type === "delivery" && !d.address.trim()) return setError("الرجاء إدخال عنوان التوصيل");
    if (d.type === "delivery" && !d.phone.trim()) return setError("الرجاء إدخال رقم الهاتف للتوصيل");
    try {
      const { name, phone, address, type } = d;
      localStorage.setItem(DETAILS_KEY, JSON.stringify({ name, phone, address, type }));
    } catch {}
    const msg = buildOrderMessage(cart.lines, cart.total, currency, d);
    window.open(whatsappUrl(settings.whatsapp_number, msg), "_blank", "noopener");
    setSent(true);
  };

  const done = () => {
    cart.clear();
    setD((prev) => ({ ...prev, notes: "", table: "" }));
    onClose();
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="طلبك"
      footer={
        cart.count > 0 && (
          <div className="space-y-3">
            {error && <p className="rounded-2xl bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-300 ring-1 ring-red-500/30">{error}</p>}
            {sent ? (
              <div className="space-y-3">
                <p className="flex items-center justify-center gap-2 text-center text-sm text-muted">
                  <span className="grid size-5 place-items-center rounded-full bg-whatsapp text-ink">
                    <CheckIcon width={13} height={13} strokeWidth={3} />
                  </span>
                  تم فتح واتساب — لا تنسَ الضغط على «إرسال» هناك
                </p>
                <div className="flex gap-2">
                  <button type="button" onClick={send} className="h-13 flex-1 rounded-full font-bold text-whatsapp ring-2 ring-whatsapp/60">
                    إعادة الفتح
                  </button>
                  <button type="button" onClick={done} className="h-13 flex-1 rounded-full bg-cream font-bold text-ink">
                    طلب جديد
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={send}
                className="flex h-14 w-full items-center gap-3 rounded-full bg-whatsapp ps-2 pe-5 font-bold text-ink shadow-lg shadow-whatsapp/25 transition active:scale-[0.98]"
              >
                <span className="grid size-10 place-items-center rounded-full bg-ink/15">
                  <WhatsAppIcon />
                </span>
                <span className="flex-1 text-start">أرسل عبر واتساب</span>
                <span className="tabular-nums"><Price amount={cart.total} currency={currency} /></span>
              </button>
            )}
          </div>
        )
      }
    >
      {cart.count === 0 ? (
        <div className="px-5 py-14 text-center">
          <div className="mx-auto grid size-20 place-items-center rounded-full bg-surface-2 text-4xl ring-1 ring-line">☕</div>
          <p className="mt-4 font-semibold">سلتك فارغة</p>
          <p className="mt-1 text-sm text-muted">أضف مشروبك أو كريبك المفضل من القائمة</p>
        </div>
      ) : (
        <div className="space-y-7 px-5 pb-6">
          <section>
            <ul className="divide-y divide-line">
              {cart.lines.map((l) => (
                <li key={l.key} className="flex items-center gap-3 py-3.5">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{l.name}</p>
                    <p className="mt-0.5 text-[13px] text-muted">
                      {l.option && <span className="text-caramel">{l.option} · </span>}
                      <span className="tabular-nums"><Price amount={l.qty * l.unitPrice} currency={currency} /></span>
                    </p>
                  </div>
                  <QtyStepper size="sm" qty={l.qty} onChange={(q) => cart.setQty(l.key, q)} />
                </li>
              ))}
            </ul>
            <div className="mt-2 flex items-center justify-between border-t border-dashed border-line pt-4">
              <button type="button" onClick={cart.clear} className="flex items-center gap-1.5 text-[13px] font-semibold text-muted active:text-red-300">
                <TrashIcon width={15} height={15} /> إفراغ السلة
              </button>
              <p className="text-lg font-bold">
                <span className="text-sm font-normal text-muted">المجموع </span>
                <span className="tabular-nums text-caramel"><Price amount={cart.total} currency={currency} /></span>
              </p>
            </div>
          </section>

          <fieldset>
            <legend className="mb-2.5 text-sm font-bold">كيف تريد طلبك؟</legend>
            <div className="flex rounded-2xl bg-surface-2 p-1 ring-1 ring-line">
              {types.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => set("type", t)}
                  className={`flex h-12 flex-1 items-center justify-center gap-1.5 rounded-xl text-sm font-semibold transition ${
                    d.type === t ? "bg-cream text-ink shadow" : "text-muted"
                  }`}
                  aria-pressed={d.type === t}
                >
                  <span aria-hidden>{ORDER_TYPES[t].emoji}</span>
                  {ORDER_TYPES[t].label}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="space-y-4">
            <Field label="الاسم">
              <input className={input} value={d.name} onChange={(e) => set("name", e.target.value)} placeholder="اسمك" autoComplete="name" />
            </Field>
            {d.type === "dine_in" && (
              <Field label="رقم الطاولة" optional>
                <input className={input} value={d.table} onChange={(e) => set("table", e.target.value)} inputMode="numeric" placeholder="مثال: 4" />
              </Field>
            )}
            {d.type !== "dine_in" && (
              <Field label="رقم الهاتف" optional={d.type === "pickup"}>
                <input
                  className={`${input} text-right`}
                  value={d.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  inputMode="tel"
                  dir="ltr"
                  placeholder="03 123 456"
                  autoComplete="tel"
                />
              </Field>
            )}
            {d.type === "delivery" && (
              <Field label="عنوان التوصيل">
                <textarea
                  className={input}
                  rows={2}
                  value={d.address}
                  onChange={(e) => set("address", e.target.value)}
                  placeholder="المنطقة، الشارع، البناية، الطابق"
                  autoComplete="street-address"
                />
              </Field>
            )}
            <Field label="ملاحظات" optional>
              <textarea className={input} rows={2} value={d.notes} onChange={(e) => set("notes", e.target.value)} placeholder="مثال: بدون سكر، حليب شوفان…" />
            </Field>
          </div>
        </div>
      )}
    </Sheet>
  );
}
