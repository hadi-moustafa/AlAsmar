"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="grid min-h-dvh place-items-center bg-crema px-6 text-center">
      <div>
        <div className="mb-3 text-5xl">☕</div>
        <h1 className="font-display text-2xl">عذراً، حدث خطأ</h1>
        <p className="mt-2 text-mocha/70">نعمل على تحضير القائمة… حاول مرة أخرى بعد قليل.</p>
        <button onClick={reset} className="mt-5 rounded-full bg-espresso px-6 py-3 font-bold text-crema">
          إعادة المحاولة
        </button>
      </div>
    </main>
  );
}
