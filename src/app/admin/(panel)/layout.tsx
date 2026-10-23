import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { logout } from "../actions";
import { AdminNav } from "./AdminNav";

export const metadata: Metadata = { title: "لوحة الإدارة | الأسمر", robots: { index: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <div className="min-h-dvh bg-ink pb-24 sm:pb-8">
      <header className="sticky top-0 z-30 border-b border-line bg-surface">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
          <div className="relative size-10 overflow-hidden rounded-full ring-2 ring-caramel">
            <Image src="/logo.jpg" alt="" fill sizes="40px" className="scale-[1.32] object-cover" />
          </div>
          <div className="flex-1 leading-tight">
            <p className="font-display text-lg font-bold">الأسمر</p>
            <p className="text-xs text-muted">لوحة الإدارة</p>
          </div>
          <Link href="/" target="_blank" className="rounded-full bg-surface-2 px-3 py-1.5 text-xs font-bold ring-1 ring-line">
            عرض الموقع ↗
          </Link>
          <form action={logout}>
            <button className="rounded-full px-3 py-1.5 text-xs font-bold text-muted hover:bg-surface-2">خروج</button>
          </form>
        </div>
        <AdminNav />
      </header>
      <main className="mx-auto max-w-3xl px-4 pt-5">{children}</main>
    </div>
  );
}
