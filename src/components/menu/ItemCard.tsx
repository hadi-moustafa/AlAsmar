"use client";

import Image from "next/image";
import { formatPrice } from "@/lib/format";
import type { Currency, MenuItem } from "@/lib/types";
import { PlusIcon } from "../icons";
import type { Cart } from "./cart";
import { QtyStepper } from "./QtyStepper";

export function ItemCard({
  item,
  icon,
  cart,
  currency,
  onPick,
}: {
  item: MenuItem;
  icon: string;
  cart: Cart;
  currency: Currency;
  onPick: (item: MenuItem) => void;
}) {
  const key = `item:${item.id}`;
  const hasOptions = item.options.length > 0;
  const qty = cart.qtyOf(key);

  const add = () =>
    hasOptions ? onPick(item) : cart.add({ key, name: item.name, unitPrice: item.price });

  return (
    <article
      className={`group flex gap-3 rounded-2xl bg-foam p-2.5 shadow-card ring-1 ring-latte/60 transition ${
        item.is_available ? "" : "opacity-55 grayscale"
      }`}
    >
      <button
        type="button"
        onClick={item.is_available ? add : undefined}
        className="relative size-24 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-latte to-caramel/40 sm:size-28"
        aria-label={`إضافة ${item.name}`}
        tabIndex={-1}
      >
        {item.image_url ? (
          <Image
            src={item.image_url}
            alt={item.name}
            fill
            sizes="112px"
            className="object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <span className="grid h-full place-items-center text-4xl">{icon}</span>
        )}
        {item.is_featured && item.is_available && (
          <span className="absolute right-1 top-1 rounded-full bg-caramel px-1.5 py-0.5 text-[10px] font-bold text-espresso shadow">
            ⭐ مميّز
          </span>
        )}
      </button>

      <div className="flex min-w-0 flex-1 flex-col py-0.5">
        <h3 className="text-[15px] font-bold leading-snug">{item.name}</h3>
        {item.description && (
          <p className="mt-0.5 line-clamp-2 text-[13px] leading-relaxed text-mocha/75">{item.description}</p>
        )}
        {hasOptions && (
          <p className="mt-1 truncate text-[11px] text-caramel-dark">
            {item.options.map((o) => o.name).join(" · ")}
          </p>
        )}

        <div className="mt-auto flex items-end justify-between gap-2 pt-2">
          <div className="leading-none">
            {hasOptions && <span className="block text-[10px] text-mocha/60">يبدأ من</span>}
            <span className="font-bold tabular-nums text-caramel-dark">{formatPrice(item.price, currency)}</span>
          </div>

          {!item.is_available ? (
            <span className="rounded-full bg-latte px-3 py-1.5 text-xs font-semibold text-mocha">غير متوفر حالياً</span>
          ) : qty > 0 && !hasOptions ? (
            <QtyStepper size="sm" qty={qty} onChange={(q) => cart.setQty(key, q)} />
          ) : (
            <button
              type="button"
              onClick={add}
              className="relative grid size-10 place-items-center rounded-full bg-caramel text-espresso shadow-md shadow-caramel/30 transition hover:bg-honey active:scale-90"
              aria-label={`إضافة ${item.name}`}
            >
              <PlusIcon />
              {qty > 0 && (
                <span className="absolute -left-1 -top-1 grid size-5 place-items-center rounded-full bg-espresso text-[11px] font-bold text-crema">
                  {qty}
                </span>
              )}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
