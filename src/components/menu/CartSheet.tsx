"use client";

import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/format";
import type { Settings } from "@/lib/types";
import { TrashIcon, WhatsAppIcon } from "../icons";
import type { Cart } from "./cart";
import { QtyStepper } from "./QtyStepper";
import { Sheet } from "./Sheet";
import { buildOrderMessage, ORDER_TYPES, whatsappUrl, type OrderDetails, type OrderType } from "./whatsapp";

const DETAILS_KEY = "alasmar-customer-v1";
const EMPTY: OrderDetails = { type: "dine_in", name: "", phone: "", table: "", address: "", notes: "" };

const input =
  "w-full rounded-xl border border-latte bg-foam px-3.5 py-2.5 text-[15px] outline-none transition placeholder:text-mocha/40 focus:border-caramel focus:ring-2 focus:ring-caramel/25";

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
          <div className="space-y-2">
            {error && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{error}</p>}
            <div className="flex items-center justify-between text-lg font-bold">
              <span>المجموع</span>
              <span className="tabular-nums text-caramel-dark">{formatPrice(cart.total, currency)}</span>
            </div>
            {sent ? (
              <div className="space-y-2">
                <p className="text-center text-sm text-mocha/80">✅ تم فتح واتساب — لا تنسَ الضغط على «إرسال» هناك</p>
                <div className="flex gap-2">
                  <button type="button" onClick={send} className="h-12 flex-1 rounded-full border-2 border-whatsapp font-bold text-whatsapp-dark">
                    إعادة الفتح
                  </button>
                  <button type="button" onClick={done} className="h-12 flex-1 rounded-full bg-espresso font-bold text-crema">
                    تم الإرسال، طلب جديد
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={send}
                className="flex h-13 w-full items-center justify-center gap-2 rounded-full bg-whatsapp text-lg font-bold text-white shadow-lg shadow-whatsapp/30 transition hover:bg-whatsapp-dark active:scale-[0.98]"
              >
                <WhatsAppIcon />
                أرسل الطلب عبر واتساب
              </button>
            )}
          </div>
        )
      }
    >
      {cart.count === 0 ? (
        <div className="py-12 text-center">
          <div className="mb-3 text-5xl">☕</div>
          <p className="font-semibold">سلتك فارغة</p>
          <p className="mt-1 text-sm text-mocha/70">أضف مشروبك أو كريبك المفضل من القائمة</p>
        </div>
      ) : (
        <div className="space-y-5">
          <ul className="divide-y divide-latte rounded-2xl bg-foam px-3 ring-1 ring-latte/60">
            {cart.lines.map((l) => (
              <li key={l.key} className="flex items-center gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{l.name}</p>
                  <p className="text-xs text-mocha/70">
                    {l.option && <span className="text-caramel-dark">{l.option} · </span>}
                    <span className="tabular-nums">{formatPrice(l.unitPrice, currency)}</span>
                  </p>
                </div>
                <span className="w-16 text-left text-sm font-bold tabular-nums">{formatPrice(l.qty * l.unitPrice, currency)}</span>
                <QtyStepper size="sm" qty={l.qty} onChange={(q) => cart.setQty(l.key, q)} />
              </li>
            ))}
          </ul>
          <button type="button" onClick={cart.clear} className="flex items-center gap-1 text-xs font-semibold text-red-700/80 hover:text-red-700">
            <TrashIcon width={14} height={14} /> إفراغ السلة
          </button>

          <fieldset>
            <legend className="mb-2 text-sm font-bold">كيف تريد طلبك؟</legend>
            <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${types.length}, minmax(0, 1fr))` }}>
              {types.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => set("type", t)}
                  className={`rounded-2xl border-2 px-2 py-2.5 text-sm font-bold transition ${
                    d.type === t ? "border-caramel bg-caramel/15" : "border-latte bg-foam"
                  }`}
                  aria-pressed={d.type === t}
                >
                  <span className="block text-xl">{ORDER_TYPES[t].emoji}</span>
                  {ORDER_TYPES[t].label}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="space-y-3">
            <label className="block">
              <span className="mb-1 block text-sm font-semibold">الاسم</span>
              <input className={input} value={d.name} onChange={(e) => set("name", e.target.value)} placeholder="اسمك" autoComplete="name" />
            </label>
            {d.type === "dine_in" && (
              <label className="block">
                <span className="mb-1 block text-sm font-semibold">رقم الطاولة <span className="font-normal text-mocha/60">(اختياري)</span></span>
                <input className={input} value={d.table} onChange={(e) => set("table", e.target.value)} inputMode="numeric" placeholder="مثال: 4" />
              </label>
            )}
            {d.type !== "dine_in" && (
              <label className="block">
                <span className="mb-1 block text-sm font-semibold">
                  رقم الهاتف {d.type === "pickup" && <span className="font-normal text-mocha/60">(اختياري)</span>}
                </span>
                <input className={input} value={d.phone} onChange={(e) => set("phone", e.target.value)} inputMode="tel" dir="ltr" placeholder="03 123 456" autoComplete="tel" />
              </label>
            )}
            {d.type === "delivery" && (
              <label className="block">
                <span className="mb-1 block text-sm font-semibold">عنوان التوصيل</span>
                <textarea className={input} rows={2} value={d.address} onChange={(e) => set("address", e.target.value)} placeholder="المنطقة، الشارع، البناية، الطابق" autoComplete="street-address" />
              </label>
            )}
            <label className="block">
              <span className="mb-1 block text-sm font-semibold">ملاحظات <span className="font-normal text-mocha/60">(اختياري)</span></span>
              <textarea className={input} rows={2} value={d.notes} onChange={(e) => set("notes", e.target.value)} placeholder="مثال: بدون سكر، حليب شوفان…" />
            </label>
          </div>
        </div>
      )}
    </Sheet>
  );
}
