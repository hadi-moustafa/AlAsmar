import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "دخول الإدارة | الأسمر", robots: { index: false } };

export default async function LoginPage() {
  if (await isAdmin()) redirect("/admin");
  return (
    <main className="grid min-h-dvh place-items-center bg-ink px-4">
      <div className="w-full max-w-sm rounded-3xl bg-surface p-6 shadow-2xl ring-1 ring-line">
        <div className="relative mx-auto size-24 overflow-hidden rounded-full ring-4 ring-caramel">
          <Image src="/logo.jpg" alt="الأسمر" fill sizes="96px" className="scale-[1.32] object-cover" />
        </div>
        <h1 className="mt-4 text-center font-display text-2xl font-bold">لوحة الإدارة</h1>
        <p className="mb-5 text-center text-sm text-muted">سجّل الدخول للمتابعة</p>
        <LoginForm />
        <Link
          href="/"
          className="mt-3 flex h-12 w-full items-center justify-center rounded-full font-bold text-muted ring-1 ring-line transition hover:bg-surface-2"
        >
          → العودة إلى القائمة
        </Link>
      </div>
    </main>
  );
}
