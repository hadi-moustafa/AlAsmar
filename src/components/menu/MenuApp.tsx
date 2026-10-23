"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { contactLinks } from "@/lib/contact";
import type { Category, MenuItem, Offer, Settings } from "@/lib/types";
import {
  BagIcon,
  ClockIcon,
  FacebookIcon,
  InstagramIcon,
  NavigationIcon,
  PhoneIcon,
  PinIcon,
  PlusIcon,
  QrIcon,
  SearchIcon,
  WhatsAppIcon,
} from "../icons";
import { useCart } from "./cart";
import { CartSheet } from "./CartSheet";
import { FeaturedCard, ItemRow } from "./ItemCard";
import { ItemSheet } from "./ItemSheet";
import { Price } from "./Price";

type Props = { categories: Category[]; items: MenuItem[]; offers: Offer[]; settings: Settings };
type Section = Category & { items: MenuItem[] };

const TOP_BAR = 60; // px, height of the sticky app bar

export function MenuApp({ categories, items, offers, settings }: Props) {
  const cart = useCart();
  const currency = settings.currency;
  const [open, setOpen] = useState<MenuItem | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const [query, setQuery] = useState("");
  const [bump, setBump] = useState(0);

  const sections = useMemo<Section[]>(
    () =>
      categories
        .map((c) => ({ ...c, items: items.filter((i) => i.category_id === c.id) }))
        .filter((c) => c.items.length > 0),
    [categories, items],
  );
  const iconFor = useMemo(() => new Map(categories.map((c) => [c.id, c.icon])), [categories]);
  const featured = useMemo(() => items.filter((i) => i.is_featured && i.is_available), [items]);

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
  const closeItem = useCallback(() => setOpen(null), []);
  const closeSearch = () => {
    setSearching(false);
    setQuery("");
  };

  const icon = (item: MenuItem) => iconFor.get(item.category_id) ?? "☕";
  const rowProps = { cart, currency, onOpen: setOpen };
  const links = useMemo(() => contactLinks(settings), [settings]);

  return (
    <div className="app-col relative min-h-dvh overflow-x-clip bg-ink pb-32">
      <TopBar searching={searching} query={query} setQuery={setQuery} onSearch={() => setSearching(true)} onCloseSearch={closeSearch} />

      {searching ? (
        <main className="px-5 pt-2">
          {!results ? (
            <p className="py-16 text-center text-muted">اكتب اسم مشروب أو كريب…</p>
          ) : results.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-4xl">🔍</p>
              <p className="mt-3 font-semibold">لا توجد نتائج لـ «{query}»</p>
              <p className="mt-1 text-sm text-muted">جرّب كلمة أخرى</p>
            </div>
          ) : (
            <>
              <p className="pt-2 text-sm text-muted">{results.length} نتيجة</p>
              <div className="divide-y divide-line">
                {results.map((item) => (
                  <ItemRow key={item.id} item={item} icon={icon(item)} {...rowProps} />
                ))}
              </div>
            </>
          )}
        </main>
      ) : (
        <>
          <Hero settings={settings} links={links} />

          {offers.length > 0 && <Offers offers={offers} cart={cart} currency={currency} onAdd={addOffer} />}

          {featured.length > 0 && (
            <section className="mt-9" aria-labelledby="featured-title">
              <SectionTitle id="featured-title" title="الأكثر طلباً" kicker="اختيارات الزبائن" />
              <div className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-5 px-5 pb-1">
                {featured.map((item) => (
                  <FeaturedCard key={item.id} item={item} icon={icon(item)} {...rowProps} />
                ))}
              </div>
            </section>
          )}

          {sections.length === 0 ? (
            <p className="py-20 text-center text-muted">القائمة قيد التحضير… عُد قريباً ☕</p>
          ) : (
            <>
              <CategoryTabs sections={sections} />
              <main className="px-5">
                {sections.map((s) => (
                  <section
                    key={s.id}
                    id={`cat-${s.id}`}
                    data-cat={s.id}
                    className="pt-7"
                    style={{ scrollMarginTop: TOP_BAR + 56 }}
                  >
                    <h2 className="flex items-center gap-2.5 font-display text-xl font-bold">
                      <span className="grid size-9 place-items-center rounded-xl bg-surface-2 text-lg ring-1 ring-line" aria-hidden>
                        {s.icon}
                      </span>
                      {s.name}
                      <span className="text-sm font-normal text-muted">{s.items.length}</span>
                    </h2>
                    <div className="divide-y divide-line">
                      {s.items.map((item) => (
                        <ItemRow key={item.id} item={item} icon={s.icon} {...rowProps} />
                      ))}
                    </div>
                  </section>
                ))}
              </main>
            </>
          )}

          <Footer settings={settings} links={links} />
        </>
      )}

      {cart.count > 0 && (
        <div className="app-col pointer-events-none fixed inset-x-0 bottom-0 z-40 px-4 pb-safe">
          <button
            type="button"
            key={bump}
            onClick={() => setCartOpen(true)}
            className={`${bump ? "animate-pop" : "animate-bar"} pointer-events-auto flex h-16 w-full items-center gap-3 rounded-[22px] bg-caramel ps-2.5 pe-5 text-ink shadow-[0_16px_40px_-8px_rgb(234_165_60/0.45)] transition active:scale-[0.98]`}
          >
            <span className="relative grid size-11 place-items-center rounded-2xl bg-ink/90 text-caramel">
              <BagIcon />
              <span className="absolute -left-1.5 -top-1.5 grid size-5 place-items-center rounded-full bg-cream text-[11px] font-bold text-ink">
                {cart.count}
              </span>
            </span>
            <span className="flex-1 text-start">
              <span className="block text-[11px] font-medium opacity-70">طلبك جاهز؟</span>
              <span className="block font-bold leading-tight">عرض الطلب</span>
            </span>
            <span className="text-lg font-bold tabular-nums"><Price amount={cart.total} currency={currency} /></span>
          </button>
        </div>
      )}

      <CartSheet open={cartOpen} onClose={closeCart} cart={cart} settings={settings} />
      {open && (
        <ItemSheet
          key={open.id}
          item={open}
          icon={icon(open)}
          currency={currency}
          onClose={closeItem}
          onAdd={(i, qty) => {
            if (i === null) cart.add({ key: `item:${open.id}`, name: open.name, unitPrice: open.price }, qty);
            else {
              const o = open.options[i];
              cart.add({ key: `item:${open.id}:${o.name}`, name: open.name, option: o.name, unitPrice: o.price }, qty);
            }
            setOpen(null);
          }}
        />
      )}
    </div>
  );
}

function TopBar({
  searching,
  query,
  setQuery,
  onSearch,
  onCloseSearch,
}: {
  searching: boolean;
  query: string;
  setQuery: (q: string) => void;
  onSearch: () => void;
  onCloseSearch: () => void;
}) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-30 flex items-center gap-3 px-4 transition-colors ${
        scrolled || searching ? "border-b border-line bg-ink/85 backdrop-blur-xl" : "border-b border-transparent"
      }`}
      style={{ height: TOP_BAR }}
    >
      {searching ? (
        <>
          <label className="relative flex-1">
            <span className="sr-only">ابحث في القائمة</span>
            <SearchIcon className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-muted" width={18} height={18} />
            <input
              autoFocus
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ابحث في القائمة…"
              className="h-11 w-full rounded-2xl bg-surface-2 pe-4 ps-10 text-base text-cream outline-none ring-1 ring-line transition placeholder:text-muted focus:ring-caramel [&::-webkit-search-cancel-button]:hidden"
            />
          </label>
          <button type="button" onClick={onCloseSearch} className="h-11 px-1 text-sm font-semibold text-caramel">
            إلغاء
          </button>
        </>
      ) : (
        <>
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex flex-1 items-center gap-3 text-start"
            aria-label="العودة إلى الأعلى"
          >
            <span className="relative size-10 shrink-0 overflow-hidden rounded-full ring-2 ring-caramel/70">
              <Image src="/logo.jpg" alt="" fill priority sizes="40px" className="scale-[1.32] object-cover" />
            </span>
            <span className={`leading-tight transition-opacity ${scrolled ? "opacity-100" : "opacity-0"}`}>
              <span className="block font-display text-base font-bold">الأسمر</span>
              <span className="block text-[11px] text-muted">قهوة وكريب</span>
            </span>
          </button>
          <a
            href="#visit"
            className="grid size-10 place-items-center rounded-full bg-surface-2 text-cream ring-1 ring-line transition active:scale-90"
            aria-label="الموقع والتواصل"
          >
            <PinIcon width={19} height={19} />
          </a>
          <button
            type="button"
            onClick={onSearch}
            className="grid size-10 place-items-center rounded-full bg-surface-2 text-cream ring-1 ring-line transition active:scale-90"
            aria-label="بحث"
          >
            <SearchIcon width={19} height={19} />
          </button>
        </>
      )}
    </header>
  );
}

type Links = ReturnType<typeof contactLinks>;

function QuickActions({ links }: { links: Links }) {
  const actions = [
    links.maps && { href: links.maps, label: "الموقع", icon: <NavigationIcon /> },
    links.tel && { href: links.tel, label: "اتصل بنا", icon: <PhoneIcon /> },
    links.instagram && { href: links.instagram, label: "انستغرام", icon: <InstagramIcon /> },
    links.facebook && { href: links.facebook, label: "فيسبوك", icon: <FacebookIcon /> },
  ].filter(Boolean) as { href: string; label: string; icon: React.ReactNode }[];
  if (!actions.length) return null;

  return (
    <nav className="mt-5 grid gap-2" style={{ gridTemplateColumns: `repeat(${actions.length}, minmax(0, 1fr))` }} aria-label="تواصل معنا">
      {actions.map((a) => (
        <a
          key={a.label}
          href={a.href}
          target={a.href.startsWith("tel:") ? undefined : "_blank"}
          rel="noopener noreferrer"
          className="flex flex-col items-center gap-1.5 rounded-2xl bg-surface/80 py-3 text-[12px] font-medium text-cream ring-1 ring-line backdrop-blur transition active:scale-95 active:bg-surface-2"
        >
          <span className="text-caramel">{a.icon}</span>
          {a.label}
        </a>
      ))}
    </nav>
  );
}

function Hero({ settings, links }: { settings: Settings; links: Links }) {
  const chips = [
    settings.hours && { icon: <ClockIcon width={14} height={14} />, text: settings.hours },
    settings.address && { icon: <PinIcon width={14} height={14} />, text: settings.address },
  ].filter(Boolean) as { icon: React.ReactNode; text: string }[];

  return (
    <section className="relative -mt-[60px] pt-[60px]">
      {/* warm glow behind the headline */}
      <div className="pointer-events-none absolute -top-24 left-1/2 size-[420px] -translate-x-1/2 rounded-full bg-caramel/25 blur-[90px]" />
      <div className="grain pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_bottom,black_40%,transparent)]" />

      <div className="animate-rise relative px-5 pt-2">
        {settings.announcement && (
          <p className="mb-4 inline-flex max-w-full items-center gap-2 rounded-full bg-caramel/15 py-1.5 pe-3.5 ps-1.5 text-[13px] font-semibold text-caramel ring-1 ring-caramel/30">
            <span className="rounded-full bg-caramel px-2 py-0.5 text-[11px] font-bold text-ink">جديد</span>
            <span className="truncate">{settings.announcement}</span>
          </p>
        )}
        <p className="text-xs font-medium tracking-[0.25em] text-caramel" dir="ltr">
          BARISTA · AL-ASMAR
        </p>
        <h1 className="mt-1.5 font-display text-[34px] font-extrabold leading-[1.15]">
          شو بتحب{" "}
          <span className="bg-gradient-to-l from-honey to-caramel bg-clip-text text-transparent">تشرب اليوم؟</span>
        </h1>
        {settings.tagline && <p className="mt-2 text-[15px] leading-relaxed text-muted">{settings.tagline}</p>}

        {chips.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {chips.map((c) => (
              <span key={c.text} className="flex items-center gap-1.5 rounded-full bg-surface px-3 py-1.5 text-xs text-cream ring-1 ring-line">
                <span className="text-caramel">{c.icon}</span>
                {c.text}
              </span>
            ))}
          </div>
        )}

        <QuickActions links={links} />
      </div>
    </section>
  );
}

function SectionTitle({ id, title, kicker }: { id: string; title: string; kicker?: string }) {
  return (
    <div className="mb-3.5 px-5">
      {kicker && <p className="text-xs font-medium text-caramel">{kicker}</p>}
      <h2 id={id} className="font-display text-xl font-bold">
        {title}
      </h2>
    </div>
  );
}

function Offers({
  offers,
  cart,
  currency,
  onAdd,
}: {
  offers: Offer[];
  cart: ReturnType<typeof useCart>;
  currency: Settings["currency"];
  onAdd: (o: Offer) => void;
}) {
  const [index, setIndex] = useState(0);
  const track = useRef<HTMLDivElement>(null);

  const onScroll = () => {
    const el = track.current;
    if (!el?.firstElementChild) return;
    const w = (el.firstElementChild as HTMLElement).offsetWidth + 12;
    setIndex(Math.min(offers.length - 1, Math.round(Math.abs(el.scrollLeft) / w)));
  };

  return (
    <section className="mt-8" aria-labelledby="offers-title">
      <SectionTitle id="offers-title" title="عروض خاصة" kicker="لفترة محدودة" />
      <div ref={track} onScroll={onScroll} className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-5 px-5">
        {offers.map((o) => (
          <OfferCard key={o.id} offer={o} qty={cart.qtyOf(`offer:${o.id}`)} currency={currency} onAdd={() => onAdd(o)} single={offers.length === 1} />
        ))}
      </div>
      {offers.length > 1 && (
        <div className="mt-3 flex justify-center gap-1.5" aria-hidden>
          {offers.map((o, i) => (
            <span key={o.id} className={`h-1.5 rounded-full transition-all ${i === index ? "w-5 bg-caramel" : "w-1.5 bg-line"}`} />
          ))}
        </div>
      )}
    </section>
  );
}

function OfferCard({
  offer,
  qty,
  currency,
  onAdd,
  single,
}: {
  offer: Offer;
  qty: number;
  currency: Settings["currency"];
  onAdd: () => void;
  single: boolean;
}) {
  const discount = offer.old_price && offer.old_price > offer.price ? Math.round((1 - offer.price / offer.old_price) * 100) : 0;
  return (
    <article
      className={`relative aspect-[16/10] shrink-0 snap-start overflow-hidden rounded-[28px] ring-1 ring-line ${single ? "w-full" : "w-[86%]"}`}
    >
      {offer.image_url ? (
        <Image src={offer.image_url} alt="" fill sizes="400px" className="object-cover" />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-caramel via-caramel-dark to-mocha">
          <span className="absolute -bottom-6 -left-4 rotate-12 text-[120px] opacity-30" aria-hidden>
            🎁
          </span>
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

      {discount > 0 && (
        <span dir="ltr" className="absolute right-4 top-4 rounded-full bg-cream px-2.5 py-1 text-xs font-extrabold text-ink">-{discount}%</span>
      )}

      <div className="absolute inset-x-0 bottom-0 flex items-end gap-3 p-4">
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-xl font-bold text-white">{offer.title}</h3>
          {offer.description && <p className="mt-0.5 line-clamp-1 text-sm text-white/75">{offer.description}</p>}
          <p className="mt-1.5 flex items-baseline gap-2">
            <span className="text-lg font-bold tabular-nums text-honey"><Price amount={offer.price} currency={currency} /></span>
            {discount > 0 && <span className="text-sm tabular-nums text-white/50 line-through"><Price amount={offer.old_price!} currency={currency} /></span>}
          </p>
        </div>
        <button
          type="button"
          onClick={onAdd}
          className="flex h-11 shrink-0 items-center gap-1.5 rounded-full bg-caramel px-4 text-sm font-bold text-ink transition active:scale-95"
        >
          <PlusIcon width={16} height={16} strokeWidth={2.75} />
          {qty > 0 ? `أضف (${qty})` : "أضف"}
        </button>
      </div>
    </article>
  );
}

function CategoryTabs({ sections }: { sections: Section[] }) {
  const [active, setActive] = useState<number | undefined>(sections[0]?.id);
  const navRef = useRef<HTMLDivElement>(null);
  const lock = useRef(false);

  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>("[data-cat]");
    const observer = new IntersectionObserver(
      (entries) => {
        if (lock.current) return;
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(Number(visible[0].target.getAttribute("data-cat")));
      },
      { rootMargin: `-${TOP_BAR + 60}px 0px -60% 0px` },
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [sections]);

  useEffect(() => {
    // Scroll only the tab row (scrollIntoView would also move the page).
    const nav = navRef.current;
    const tab = nav?.querySelector<HTMLElement>(`[data-tab="${active}"]`);
    if (!nav || !tab) return;
    nav.scrollTo({ left: tab.offsetLeft - (nav.clientWidth - tab.offsetWidth) / 2, behavior: "smooth" });
  }, [active]);

  const go = (id: number) => {
    setActive(id);
    lock.current = true;
    document.getElementById(`cat-${id}`)?.scrollIntoView({ behavior: "smooth" });
    window.setTimeout(() => (lock.current = false), 700);
  };

  return (
    <nav className="sticky z-20 mt-9 bg-ink/85 py-2.5 backdrop-blur-xl" style={{ top: TOP_BAR }} aria-label="أقسام القائمة">
      <div ref={navRef} className="no-scrollbar flex gap-2 overflow-x-auto px-5">
        {sections.map((s) => (
          <button
            key={s.id}
            type="button"
            data-tab={s.id}
            onClick={() => go(s.id)}
            aria-current={active === s.id}
            className={`flex h-10 shrink-0 items-center gap-1.5 rounded-full px-4 text-sm font-semibold transition-colors ${
              active === s.id ? "bg-cream text-ink" : "bg-surface text-muted ring-1 ring-line"
            }`}
          >
            <span aria-hidden>{s.icon}</span>
            {s.name}
          </button>
        ))}
      </div>
    </nav>
  );
}

function Footer({ settings, links }: { settings: Settings; links: Links }) {
  const socials = [
    links.instagram && { href: links.instagram, label: "انستغرام", icon: <InstagramIcon /> },
    links.facebook && { href: links.facebook, label: "فيسبوك", icon: <FacebookIcon /> },
  ].filter(Boolean) as { href: string; label: string; icon: React.ReactNode }[];

  return (
    <footer id="visit" className="mt-14 space-y-3 px-5" style={{ scrollMarginTop: TOP_BAR + 72 }}>
      <h2 className="font-display text-xl font-bold">زورونا</h2>

      {(links.maps || settings.address || settings.hours) && (
        <div className="overflow-hidden rounded-3xl bg-surface ring-1 ring-line">
          {links.maps && (
            <a href={links.maps} target="_blank" rel="noopener noreferrer" className="relative block h-28 overflow-hidden" aria-label="افتح الموقع على الخريطة">
              {/* stylised map tile */}
              <div className="absolute inset-0 bg-surface-2 [background-image:linear-gradient(var(--color-line)_1px,transparent_1px),linear-gradient(90deg,var(--color-line)_1px,transparent_1px)] [background-size:22px_22px]" />
              <div className="absolute -left-6 top-10 h-3 w-[140%] -rotate-12 bg-line" />
              <div className="absolute left-1/3 -top-4 h-[150%] w-3 rotate-[20deg] bg-line" />
              <span className="absolute left-1/2 top-1/2 grid size-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-caramel text-ink shadow-[0_0_0_8px_rgb(234_165_60/0.2)]">
                <PinIcon width={22} height={22} />
              </span>
            </a>
          )}
          <div className="p-4">
            <p className="font-semibold">مقهى الأسمر</p>
            {settings.address && <p className="mt-0.5 text-sm text-muted">{settings.address}</p>}
            {settings.hours && (
              <p className="mt-1 flex items-center gap-1.5 text-sm text-muted">
                <ClockIcon width={14} height={14} className="text-caramel" /> {settings.hours}
              </p>
            )}
            <div className="mt-3 flex gap-2">
              {links.maps && (
                <a
                  href={links.maps}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-caramel font-bold text-ink transition active:scale-[0.98]"
                >
                  <NavigationIcon width={18} height={18} /> الاتجاهات
                </a>
              )}
              {links.tel && (
                <a
                  href={links.tel}
                  className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-surface-2 font-bold ring-1 ring-line transition active:scale-[0.98]"
                >
                  <PhoneIcon width={18} height={18} className="text-caramel" />
                  <bdi dir="ltr">{settings.phone}</bdi>
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {(socials.length > 0 || links.whatsapp) && (
        <div className="grid grid-cols-2 gap-2">
          {socials.map((x) => (
            <a
              key={x.href}
              href={x.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-14 items-center gap-2.5 rounded-2xl bg-surface px-4 text-sm font-semibold ring-1 ring-line transition active:bg-surface-2"
            >
              <span className="text-caramel">{x.icon}</span>
              {x.label}
            </a>
          ))}
          {links.whatsapp && (
            <a
              href={links.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-14 items-center gap-2.5 rounded-2xl bg-surface px-4 text-sm font-semibold ring-1 ring-line transition active:bg-surface-2"
            >
              <WhatsAppIcon width={20} height={20} className="text-whatsapp" /> واتساب
            </a>
          )}
          <Link
            href="/qr"
            className="flex h-14 items-center gap-2.5 rounded-2xl bg-surface px-4 text-sm font-semibold ring-1 ring-line transition active:bg-surface-2"
          >
            <QrIcon className="text-caramel" /> رمز QR للقائمة
          </Link>
        </div>
      )}

      <div className="flex flex-col items-center pt-8 text-center">
        <div className="relative size-12 overflow-hidden rounded-full ring-2 ring-caramel/70">
          <Image src="/logo.jpg" alt="شعار الأسمر" fill sizes="48px" className="scale-[1.32] object-cover" />
        </div>
        <p className="mt-2 font-display font-bold">الأسمر — قهوة وكريب</p>
        <p className="mt-1 text-[11px] text-muted/60">© {new Date().getFullYear()} Barista Al-Asmar</p>
        {/* Discreet on purpose: it's for the owner, and the panel asks for a login. */}
        <Link href="/admin" className="mt-3 px-3 py-1.5 text-[11px] text-muted/50 transition active:text-caramel">
          دخول الإدارة
        </Link>
      </div>
    </footer>
  );
}
