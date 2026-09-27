import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center bg-crema px-6 text-center">
      <div>
        <div className="mb-3 text-5xl">🥞</div>
        <h1 className="font-display text-2xl">الصفحة غير موجودة</h1>
        <Link href="/" className="mt-5 inline-block rounded-full bg-espresso px-6 py-3 font-bold text-crema">
          العودة إلى القائمة
        </Link>
      </div>
    </main>
  );
}
