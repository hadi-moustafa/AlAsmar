"use client";

export function PrintButton() {
  return (
    <button type="button" onClick={() => window.print()} className="rounded-full bg-espresso px-6 py-3 font-bold text-crema">
      طباعة
    </button>
  );
}
