"use client";

import Image from "next/image";
import { useState } from "react";
import { formatPrice } from "@/lib/format";
import type { Currency, MenuItem } from "@/lib/types";
import { QtyStepper } from "./QtyStepper";
import { Sheet } from "./Sheet";

export function OptionSheet({
  item,
  currency,
  onClose,
  onAdd,
}: {
  item: MenuItem;
  currency: Currency;
  onClose: () => void;
  onAdd: (optionIndex: number, qty: number) => void;
}) {
  const [choice, setChoice] = useState(0);
  const [qty, setQty] = useState(1);
  const option = item.options[choice];

  return (
    <Sheet
      open
      onClose={onClose}
      title={item.name}
      footer={
        <div className="flex items-center gap-3">
          <QtyStepper qty={qty} onChange={(q) => setQty(Math.max(1, q))} />
          <button
            type="button"
            onClick={() => onAdd(choice, qty)}
            className="flex h-12 flex-1 items-center justify-between rounded-full bg-caramel px-5 font-bold text-espresso transition hover:bg-honey active:scale-[0.98]"
          >
            <span>أضف للطلب</span>
            <span className="tabular-nums">{formatPrice(option.price * qty, currency)}</span>
          </button>
        </div>
      }
    >
      {item.image_url && (
        <div className="relative mb-4 aspect-[16/10] overflow-hidden rounded-2xl">
          <Image src={item.image_url} alt={item.name} fill sizes="(max-width: 640px) 100vw, 512px" className="object-cover" />
        </div>
      )}
      {item.description && <p className="mb-4 text-sm text-mocha/80">{item.description}</p>}

      <fieldset>
        <legend className="mb-2 text-sm font-bold">اختر الحجم / النوع</legend>
        <div className="space-y-2">
          {item.options.map((o, i) => (
            <label
              key={o.name}
              className={`flex cursor-pointer items-center justify-between rounded-2xl border-2 px-4 py-3 transition ${
                i === choice ? "border-caramel bg-foam" : "border-latte bg-foam/50"
              }`}
            >
              <span className="flex items-center gap-3">
                <input
                  type="radio"
                  name="option"
                  className="size-4 accent-caramel-dark"
                  checked={i === choice}
                  onChange={() => setChoice(i)}
                />
                <span className="font-semibold">{o.name}</span>
              </span>
              <span className="font-bold tabular-nums text-caramel-dark">{formatPrice(o.price, currency)}</span>
            </label>
          ))}
        </div>
      </fieldset>
    </Sheet>
  );
}
