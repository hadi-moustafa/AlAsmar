"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="app-col grid min-h-dvh place-items-center bg-ink px-6 text-center">
      <div>
        <div className="mb-3 text-5xl">☕</div>
        <h1 className="font-display text-2xl font-bold">عذراً، حدث خطأ</h1>
        <p className="mt-2 text-muted">نعمل على تحضير القائمة… حاول مرة أخرى بعد قليل.</p>
        <button onClick={reset} className="mt-5 rounded-full bg-caramel px-6 py-3 font-bold text-ink">
          إعادة المحاولة
        </button>
      </div>
    </main>
  );
}
