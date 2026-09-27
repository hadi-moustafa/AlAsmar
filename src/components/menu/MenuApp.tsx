"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { formatPrice } from "@/lib/format";
import type { Category, MenuItem, Offer, Settings } from "@/lib/types";
import { BagIcon, ClockIcon, InstagramIcon, PinIcon, PlusIcon, SearchIcon, XIcon } from "../icons";
import { useCart } from "./cart";
import { CartSheet } from "./CartSheet";
import { ItemCard } from "./ItemCard";
import { OptionSheet } from "./OptionSheet";

type Props = { categories: Category[]; items: MenuItem[]; offers: Offer[]; settings: Settings };

export function MenuApp({ categories, items, offers, settings }: Props) {
  const cart = useCart();
  const currency = settings.currency;
  const [picker, setPicker] = useState<MenuItem | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [bump, setBump] = useState(0);

  const sections = useMemo(
    () =>
      categories
        .map((c) => ({ ...c, items: items.filter((i) => i.category_id === c.id) }))
        .filter((c) => c.items.length > 0),
    [categories, items],
  );
  const iconFor = useMemo(() => new Map(categories.map((c) => [c.id, c.icon])), [categories]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    return items.filter((i) => `${i.name} ${i.description}`.toLowerCase().includes(q));
  }, [items, query]);

  // Pop the cart bar whenever the count goes up.
  const prevCount = useRef(cart.count);
  useEffect(() => {
    if (cart.count > prevCount.current) setBump((b) => b + 1);
    prevCount.current = cart.count;
  }, [cart.count]);

  const addOffer = (o: Offer) => cart.add({ key: `offer:${o.id}`, name: `عرض: ${o.title}`, unitPrice: o.price });
  const closeCart = useCallback(() => setCartOpen(false), []);
  const closePicker = useCallback(() => setPicker(null), []);

  return (
    <div className="min-h-dvh pb-28">
      <Hero settings={settings} />

      <main className="mx-auto max-w-3xl">
        {offers.length > 0 && !results && (
          <section className="pt-6" aria-labelledby="offers-title">
            <h2 id="offers-title" className="mb-3 px-4 font-display text-2xl">
              عروض خاصة <span className="inline-block animate-bounce">🔥</span>
            </h2>
            <div className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2">
              {offers.map((o) => (
                <OfferCard key={o.id} offer={o} qty={cart.qtyOf(`offer:${o.id}`)} currency={currency} onAdd={() => addOffer(o)} />
              ))}
            </div>
          </section>
        )}

        <CategoryNav sections={sections} query={query} setQuery={setQuery} />

        <div className="px-4">
          {results ? (
            <section className="pt-4">
              <p className="mb-3 text-sm text-mocha/70">
                {results.length ? `${results.length} نتيجة لـ «${query}»` : `لا توجد نتائج لـ «${query}»`}
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {results.map((item) => (
                  <ItemCard key={item.id} item={item} icon={iconFor.get(item.category_id) ?? "☕"} cart={cart} currency={currency} onPick={setPicker} />
                ))}
              </div>
            </section>
          ) : sections.length === 0 ? (
            <p className="py-16 text-center text-mocha/70">القائمة قيد التحضير… عُد قريباً ☕</p>
          ) : (
            sections.map((s) => (
              <section key={s.id} id={`cat-${s.id}`} data-cat={s.id} className="scroll-mt-32 pt-6">
                <h2 className="mb-3 flex items-center gap-2 font-display text-2xl">
                  <span aria-hidden>{s.icon}</span>
                  {s.name}
                  <span className="h-px flex-1 bg-gradient-to-l from-latte to-transparent" />
                </h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {s.items.map((item) => (
                    <ItemCard key={item.id} item={item} icon={s.icon} cart={cart} currency={currency} onPick={setPicker} />
                  ))}
                </div>
              </section>
            ))
          )}
        </div>
      </main>

      <Footer settings={settings} />

      {cart.count > 0 && (
        <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 px-4 pb-safe">
          <button
            type="button"
            key={bump}
            onClick={() => setCartOpen(true)}
            className="animate-pop pointer-events-auto mx-auto flex h-15 w-full max-w-lg items-center gap-3 rounded-full bg-espresso px-3 text-crema shadow-2xl shadow-espresso/40 ring-1 ring-caramel/30 transition active:scale-[0.98]"
          >
            <span className="relative grid size-10 place-items-center rounded-full bg-caramel text-espresso">
              <BagIcon />
              <span className="absolute -left-1 -top-1 grid size-5 place-items-center rounded-full bg-whatsapp text-[11px] font-bold text-white">
                {cart.count}
              </span>
            </span>
            <span className="flex-1 text-start font-bold">عرض الطلب</span>
            <span className="rounded-full bg-mocha px-4 py-1.5 font-bold tabular-nums text-honey">{formatPrice(cart.total, currency)}</span>
          </button>
        </div>
      )}

      <CartSheet open={cartOpen} onClose={closeCart} cart={cart} settings={settings} />
      {picker && (
        <OptionSheet
          key={picker.id}
          item={picker}
          currency={currency}
          onClose={closePicker}
          onAdd={(i, qty) => {
            const o = picker.options[i];
            cart.add({ key: `item:${picker.id}:${o.name}`, name: picker.name, option: o.name, unitPrice: o.price }, qty);
            setPicker(null);
          }}
        />
      )}
    </div>
  );
}

function Hero({ settings }: { settings: Settings }) {
  return (
    <header className="relative overflow-hidden bg-espresso text-crema">
      <div className="pointer-events-none absolute inset-0 opacity-40 [background:radial-gradient(60%_50%_at_50%_0%,#e39a2d55,transparent),radial-gradient(40%_40%_at_100%_100%,#3b3029,transparent)]" />
      {settings.announcement && (
        <p className="relative bg-caramel px-4 py-1.5 text-center text-sm font-bold text-espresso">{settings.announcement}</p>
      )}
      <div className="relative mx-auto flex max-w-3xl flex-col items-center px-4 pb-9 pt-8 text-center">
        <div className="relative">
          <div className="steam absolute -top-6 left-1/2 flex -translate-x-1/2 gap-2" aria-hidden>
            <span className="block h-6 w-1.5 rounded-full bg-crema/50 blur-[2px]" />
            <span className="block h-7 w-1.5 rounded-full bg-crema/50 blur-[2px]" />
            <span className="block h-6 w-1.5 rounded-full bg-crema/50 blur-[2px]" />
          </div>
          <div className="relative size-32 overflow-hidden rounded-full shadow-[0_0_0_4px_#e39a2d,0_20px_40px_-10px_#000]">
            <Image src="/logo.jpg" alt="شعار الأسمر" fill priority sizes="128px" className="scale-[1.32] object-cover" />
          </div>
        </div>
        <h1 className="mt-5 font-display text-5xl leading-tight">
          <span className="text-gradient-caramel">الأسمر</span>
        </h1>
        <p className="mt-1 text-sm font-semibold tracking-[0.3em] text-latte/70" dir="ltr">
          BARISTA · AL-ASMAR
        </p>
        {settings.tagline && <p className="mt-3 max-w-sm text-[15px] text-latte">{settings.tagline}</p>}

        {(settings.hours || settings.address || settings.instagram) && (
          <div className="mt-5 flex flex-wrap justify-center gap-2 text-xs">
            {settings.hours && (
              <span className="flex items-center gap-1.5 rounded-full bg-roast px-3 py-1.5 ring-1 ring-mocha">
                <ClockIcon width={14} height={14} className="text-caramel" /> {settings.hours}
              </span>
            )}
            {settings.address && (
              <span className="flex items-center gap-1.5 rounded-full bg-roast px-3 py-1.5 ring-1 ring-mocha">
                <PinIcon width={14} height={14} className="text-caramel" /> {settings.address}
              </span>
            )}
            {settings.instagram && (
              <a
                href={`https://instagram.com/${settings.instagram.replace(/^@/, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-full bg-roast px-3 py-1.5 ring-1 ring-mocha transition hover:ring-caramel"
              >
                <InstagramIcon width={14} height={14} className="text-caramel" />
                <span dir="ltr">@{settings.instagram.replace(/^@/, "")}</span>
              </a>
            )}
          </div>
        )}
      </div>
      {/* wavy bottom edge */}
      <svg className="relative -mb-px block h-6 w-full text-crema" viewBox="0 0 1440 48" preserveAspectRatio="none" aria-hidden>
        <path fill="currentColor" d="M0 48h1440V24c-120 16-240 24-360 16S840 8 720 8 480 32 360 40 120 40 0 24v24Z" />
      </svg>
    </header>
  );
}

function OfferCard({ offer, qty, currency, onAdd }: { offer: Offer; qty: number; currency: Settings["currency"]; onAdd: () => void }) {
  const discount = offer.old_price && offer.old_price > offer.price ? Math.round((1 - offer.price / offer.old_price) * 100) : 0;
  return (
    <article className="relative flex w-[78%] max-w-xs shrink-0 snap-start flex-col overflow-hidden rounded-3xl bg-espresso text-crema shadow-card">
      <div className="relative aspect-[16/9] bg-gradient-to-br from-caramel via-caramel-dark to-mocha">
        {offer.image_url ? (
          <Image src={offer.image_url} alt={offer.title} fill sizes="320px" className="object-cover" />
        ) : (
          <span className="grid h-full place-items-center text-6xl">🎁</span>
        )}
        {discount > 0 && (
          <span className="absolute left-3 top-3 rounded-full bg-whatsapp px-2.5 py-1 text-xs font-extrabold text-white shadow">
            وفّر {discount}%
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-display text-xl">{offer.title}</h3>
        {offer.description && <p className="mt-1 line-clamp-2 text-sm text-latte/80">{offer.description}</p>}
        <div className="mt-auto flex items-center justify-between pt-3">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-extrabold tabular-nums text-honey">{formatPrice(offer.price, currency)}</span>
            {offer.old_price && offer.old_price > offer.price && (
              <span className="text-sm tabular-nums text-latte/50 line-through">{formatPrice(offer.old_price, currency)}</span>
            )}
          </div>
          <button
            type="button"
            onClick={onAdd}
            className="flex items-center gap-1 rounded-full bg-caramel px-3.5 py-2 text-sm font-bold text-espresso transition hover:bg-honey active:scale-95"
          >
            <PlusIcon width={16} height={16} /> {qty > 0 ? `أضف (${qty})` : "أضف"}
          </button>
        </div>
      </div>
    </article>
  );
}

function CategoryNav({
  sections,
  query,
  setQuery,
}: {
  sections: (Category & { items: MenuItem[] })[];
  query: string;
  setQuery: (q: string) => void;
}) {
  const [active, setActive] = useState<number | undefined>(sections[0]?.id);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>("[data-cat]");
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(Number(visible[0].target.getAttribute("data-cat")));
      },
      { rootMargin: "-130px 0px -55% 0px" },
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [sections, query]);

  useEffect(() => {
    // Scroll only the chip row (scrollIntoView would also move the page).
    const nav = navRef.current;
    const chip = nav?.querySelector<HTMLElement>(`[data-chip="${active}"]`);
    if (!nav || !chip) return;
    const offset = chip.offsetLeft - (nav.clientWidth - chip.offsetWidth) / 2;
    nav.scrollTo({ left: offset, behavior: "smooth" });
  }, [active]);

  return (
    <nav className="sticky top-0 z-30 mt-4 bg-crema/90 pb-2 pt-3 backdrop-blur-md" aria-label="أقسام القائمة">
      <div className="px-4">
        <label className="relative block">
          <span className="sr-only">ابحث في القائمة</span>
          <SearchIcon className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-mocha/50" width={18} height={18} />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث عن مشروب أو كريب…"
            className="h-11 w-full rounded-full border border-latte bg-foam pe-10 ps-10 text-[15px] outline-none transition placeholder:text-mocha/40 focus:border-caramel focus:ring-2 focus:ring-caramel/25 [&::-webkit-search-cancel-button]:hidden"
          />
          {query && (
            <button type="button" onClick={() => setQuery("")} className="absolute left-2 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-full bg-latte text-mocha" aria-label="مسح البحث">
              <XIcon width={14} height={14} />
            </button>
          )}
        </label>
      </div>
      {!query && sections.length > 1 && (
        <div ref={navRef} className="no-scrollbar mt-2.5 flex gap-2 overflow-x-auto px-4">
          {sections.map((s) => (
            <a
              key={s.id}
              href={`#cat-${s.id}`}
              data-chip={s.id}
              onClick={() => setActive(s.id)}
              className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold transition ${
                active === s.id ? "bg-espresso text-crema shadow-md" : "bg-foam text-mocha ring-1 ring-latte hover:bg-latte/50"
              }`}
            >
              <span aria-hidden>{s.icon}</span>
              {s.name}
            </a>
          ))}
        </div>
      )}
    </nav>
  );
}

function Footer({ settings }: { settings: Settings }) {
  return (
    <footer className="mx-auto mt-12 max-w-3xl px-4 text-center text-sm text-mocha/70">
      <div className="mx-auto mb-3 h-px w-24 bg-latte" />
      <p className="font-display text-lg text-mocha">الأسمر — قهوة وكريب</p>
      {settings.address && <p className="mt-1">{settings.address}</p>}
      <p className="mt-2 text-xs">© {new Date().getFullYear()} Barista Al-Asmar</p>
    </footer>
  );
}
