import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "دخول الإدارة | الأسمر", robots: { index: false } };

export default async function LoginPage() {
  if (await isAdmin()) redirect("/admin");
  return (
    <main className="grid min-h-dvh place-items-center bg-espresso px-4">
      <div className="w-full max-w-sm rounded-3xl bg-crema p-6 shadow-2xl">
        <div className="relative mx-auto size-24 overflow-hidden rounded-full ring-4 ring-caramel">
          <Image src="/logo.jpg" alt="الأسمر" fill sizes="96px" className="scale-[1.32] object-cover" />
        </div>
        <h1 className="mt-4 text-center font-display text-2xl">لوحة الإدارة</h1>
        <p className="mb-5 text-center text-sm text-mocha/70">أدخل كلمة المرور للمتابعة</p>
        <LoginForm />
      </div>
    </main>
  );
}
