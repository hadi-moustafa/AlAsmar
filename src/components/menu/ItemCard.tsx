"use client";

import Image from "next/image";
import type { Currency, MenuItem } from "@/lib/types";
import { PlusIcon } from "../icons";
import type { Cart } from "./cart";
import { QtyStepper } from "./QtyStepper";
import { Price } from "./Price";

type CardProps = {
  item: MenuItem;
  icon: string;
  cart: Cart;
  currency: Currency;
  onOpen: (item: MenuItem) => void;
};

/** Price label: options show their lowest price as "from". */
function fromPrice(item: MenuItem) {
  return item.options.length ? Math.min(...item.options.map((o) => o.price)) : item.price;
}

function useQuickAdd({ item, cart, onOpen }: Pick<CardProps, "item" | "cart" | "onOpen">) {
  const key = `item:${item.id}`;
  const hasOptions = item.options.length > 0;
  return {
    key,
    hasOptions,
    qty: cart.qtyOf(key),
    add: () => (hasOptions ? onOpen(item) : cart.add({ key, name: item.name, unitPrice: item.price })),
  };
}

function Thumb({ item, icon, className, sizes }: { item: MenuItem; icon: string; className: string; sizes: string }) {
  return (
    <div className={`relative overflow-hidden bg-gradient-to-br from-surface-2 to-ink ${className}`}>
      {item.image_url ? (
        <Image src={item.image_url} alt="" fill sizes={sizes} className="object-cover" />
      ) : (
        <span className="grid h-full place-items-center text-4xl" aria-hidden>
          {icon}
        </span>
      )}
    </div>
  );
}

function AddButton({ label, qty, onClick }: { label: string; qty: number; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className="relative grid size-9 place-items-center rounded-full bg-caramel text-ink shadow-lg shadow-black/30 transition active:scale-90"
      aria-label={`إضافة ${label}`}
    >
      <PlusIcon width={18} height={18} strokeWidth={2.75} />
      {qty > 0 && (
        <span className="absolute -right-1.5 -top-1.5 grid size-5 place-items-center rounded-full bg-cream text-[11px] font-bold text-ink ring-2 ring-ink">
          {qty}
        </span>
      )}
    </button>
  );
}

/** Menu list row: text on the start side, square photo on the end side. */
export function ItemRow({ item, icon, cart, currency, onOpen }: CardProps) {
  const { key, hasOptions, qty, add } = useQuickAdd({ item, cart, onOpen });
  return (
    <article
      onClick={() => onOpen(item)}
      className={`flex cursor-pointer gap-4 py-4 transition active:opacity-70 ${item.is_available ? "" : "opacity-45"}`}
    >
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-2">
          <h3 className="truncate font-semibold">{item.name}</h3>
          {item.is_featured && item.is_available && (
            <span className="shrink-0 rounded-full bg-caramel/15 px-2 py-0.5 text-[10px] font-bold text-caramel">مميّز</span>
          )}
        </div>
        {item.description && <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-muted">{item.description}</p>}
        <div className="mt-auto flex items-center gap-2 pt-2.5">
          <span className="font-bold tabular-nums">
            {hasOptions && <span className="text-xs font-normal text-muted">من </span>}
            <Price amount={fromPrice(item)} currency={currency} />
          </span>
          {hasOptions && <span className="truncate text-[11px] text-muted">· {item.options.length} أحجام</span>}
          {!item.is_available && <span className="text-xs font-semibold text-muted">· غير متوفر</span>}
        </div>
      </div>

      <div className="relative shrink-0">
        <Thumb item={item} icon={icon} className="size-26 rounded-2xl ring-1 ring-line" sizes="104px" />
        {item.is_available && (
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2" onClick={(e) => e.stopPropagation()}>
            {qty > 0 && !hasOptions ? (
              <QtyStepper size="sm" qty={qty} onChange={(q) => cart.setQty(key, q)} />
            ) : (
              <AddButton label={item.name} qty={qty} onClick={add} />
            )}
          </div>
        )}
      </div>
    </article>
  );
}

/** Tall photo card for the horizontal "most popular" strip. */
export function FeaturedCard({ item, icon, cart, currency, onOpen }: CardProps) {
  const { qty, add } = useQuickAdd({ item, cart, onOpen });
  return (
    <article onClick={() => onOpen(item)} className="w-40 shrink-0 cursor-pointer snap-start transition active:scale-[0.98]">
      <div className="relative">
        <Thumb item={item} icon={icon} className="aspect-[4/5] w-full rounded-3xl ring-1 ring-line" sizes="160px" />
        <div className="absolute bottom-2 left-2">
          <AddButton label={item.name} qty={qty} onClick={add} />
        </div>
      </div>
      <h3 className="mt-2.5 truncate text-sm font-semibold">{item.name}</h3>
      <p className="text-sm font-bold tabular-nums text-caramel"><Price amount={fromPrice(item)} currency={currency} /></p>
    </article>
  );
}
