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
    <div className="min-h-dvh bg-crema pb-24 sm:pb-8">
      <header className="sticky top-0 z-30 bg-espresso text-crema shadow-lg">
        <div className="mx-auto flex max-w-4xl items-center gap-3 px-4 py-3">
          <div className="relative size-10 overflow-hidden rounded-full ring-2 ring-caramel">
            <Image src="/logo.jpg" alt="" fill sizes="40px" className="scale-[1.32] object-cover" />
          </div>
          <div className="flex-1 leading-tight">
            <p className="font-display text-lg">الأسمر</p>
            <p className="text-xs text-latte/70">لوحة الإدارة</p>
          </div>
          <Link href="/" target="_blank" className="rounded-full bg-mocha px-3 py-1.5 text-xs font-bold">
            عرض الموقع ↗
          </Link>
          <form action={logout}>
            <button className="rounded-full px-3 py-1.5 text-xs font-bold text-latte/80 hover:bg-mocha">خروج</button>
          </form>
        </div>
        <AdminNav />
      </header>
      <main className="mx-auto max-w-4xl px-4 pt-5">{children}</main>
    </div>
  );
}
