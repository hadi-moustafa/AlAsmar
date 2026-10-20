"use client";

import Image from "next/image";
import { useState } from "react";
import type { Currency, MenuItem } from "@/lib/types";
import { QtyStepper } from "./QtyStepper";
import { Sheet } from "./Sheet";
import { Price } from "./Price";

/** Item details: photo, description, size/option choice and quantity. */
export function ItemSheet({
  item,
  icon,
  currency,
  onClose,
  onAdd,
}: {
  item: MenuItem;
  icon: string;
  currency: Currency;
  onClose: () => void;
  onAdd: (optionIndex: number | null, qty: number) => void;
}) {
  const hasOptions = item.options.length > 0;
  const [choice, setChoice] = useState(0);
  const [qty, setQty] = useState(1);
  const unit = hasOptions ? item.options[choice].price : item.price;

  return (
    <Sheet
      open
      onClose={onClose}
      title={item.name}
      hideTitle
      footer={
        <div className="flex items-center gap-3">
          <QtyStepper qty={qty} onChange={(q) => setQty(Math.max(1, q))} />
          <button
            type="button"
            disabled={!item.is_available}
            onClick={() => onAdd(hasOptions ? choice : null, qty)}
            className="flex h-13 flex-1 items-center justify-between rounded-full bg-caramel px-5 font-bold text-ink shadow-lg shadow-caramel/20 transition active:scale-[0.98] disabled:bg-surface-2 disabled:text-muted disabled:shadow-none"
          >
            <span>{item.is_available ? "أضف للطلب" : "غير متوفر حالياً"}</span>
            {item.is_available && <span className="tabular-nums"><Price amount={unit * qty} currency={currency} /></span>}
          </button>
        </div>
      }
    >
      <div className="relative aspect-[4/3] w-full bg-gradient-to-br from-surface-2 via-surface to-ink">
        {item.image_url ? (
          <Image src={item.image_url} alt={item.name} fill sizes="440px" className="object-cover" />
        ) : (
          <span className="grid h-full place-items-center text-8xl" aria-hidden>
            {icon}
          </span>
        )}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-surface to-transparent" />
      </div>

      <div className="-mt-6 px-5 pb-6">
        <div className="relative flex items-start justify-between gap-4">
          <h2 className="font-display text-2xl font-bold leading-snug">{item.name}</h2>
          {(hasOptions || item.price > 0) && (
            <p className="shrink-0 pt-1 text-lg font-bold tabular-nums text-caramel">
              {hasOptions && <span className="text-xs font-medium text-muted">من </span>}
              <Price amount={hasOptions ? Math.min(...item.options.map((o) => o.price)) : item.price} currency={currency} />
            </p>
          )}
        </div>
        {item.description && <p className="mt-2 leading-relaxed text-muted">{item.description}</p>}

        {hasOptions && (
          <fieldset className="mt-6">
            <legend className="mb-3 flex w-full items-center justify-between text-sm font-bold">
              اختر الحجم / النوع
              <span className="rounded-full bg-caramel/15 px-2 py-0.5 text-[11px] text-caramel">مطلوب</span>
            </legend>
            <div className="space-y-2">
              {item.options.map((o, i) => (
                <label
                  key={o.name}
                  className={`flex cursor-pointer items-center justify-between rounded-2xl px-4 py-3.5 ring-1 transition ${
                    i === choice ? "bg-caramel/10 ring-caramel" : "bg-surface-2 ring-line"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <input type="radio" name="option" className="sr-only" checked={i === choice} onChange={() => setChoice(i)} />
                    <span
                      className={`grid size-5 place-items-center rounded-full ring-2 transition ${
                        i === choice ? "ring-caramel" : "ring-line"
                      }`}
                      aria-hidden
                    >
                      {i === choice && <span className="size-2.5 rounded-full bg-caramel" />}
                    </span>
                    <span className="font-semibold">{o.name}</span>
                  </span>
                  <span className="font-bold tabular-nums text-cream"><Price amount={o.price} currency={currency} /></span>
                </label>
              ))}
            </div>
          </fieldset>
        )}
      </div>
    </Sheet>
  );
}
