import Link from "next/link";

export default function NotFound() {
  return (
    <main className="app-col grid min-h-dvh place-items-center bg-ink px-6 text-center">
      <div>
        <div className="mb-3 text-5xl">🥞</div>
        <h1 className="font-display text-2xl font-bold">الصفحة غير موجودة</h1>
        <Link href="/" className="mt-5 inline-block rounded-full bg-caramel px-6 py-3 font-bold text-ink">
          العودة إلى القائمة
        </Link>
      </div>
    </main>
  );
}
