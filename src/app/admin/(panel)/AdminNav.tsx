"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/admin", label: "الأصناف", icon: "🍽️", match: (p: string) => p === "/admin" || p.startsWith("/admin/items") },
  { href: "/admin/categories", label: "الأقسام", icon: "🗂️", match: (p: string) => p.startsWith("/admin/categories") },
  { href: "/admin/offers", label: "العروض", icon: "🎁", match: (p: string) => p.startsWith("/admin/offers") },
  { href: "/admin/settings", label: "الإعدادات", icon: "⚙️", match: (p: string) => p.startsWith("/admin/settings") },
];

export function AdminNav() {
  const pathname = usePathname();
  const tabs = LINKS.map((l) => {
    const active = l.match(pathname);
    return { ...l, active };
  });

  return (
    <>
      {/* Desktop: tabs under the header */}
      <nav className="mx-auto hidden max-w-3xl gap-1 px-4 pb-2 sm:flex">
        {tabs.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className={`rounded-full px-4 py-1.5 text-sm font-bold transition ${t.active ? "bg-caramel text-ink" : "text-muted hover:bg-surface-2"}`}
          >
            {t.icon} {t.label}
          </Link>
        ))}
      </nav>
      {/* Mobile: bottom tab bar */}
      <nav className="pb-safe fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-line bg-surface pt-1 sm:hidden">
        {tabs.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className={`flex flex-col items-center gap-0.5 py-1.5 text-[11px] font-bold ${t.active ? "text-caramel" : "text-muted"}`}
          >
            <span className="text-xl">{t.icon}</span>
            {t.label}
          </Link>
        ))}
      </nav>
    </>
  );
}
