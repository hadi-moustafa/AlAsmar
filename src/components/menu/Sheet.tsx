"use client";

import { useEffect } from "react";
import { XIcon } from "../icons";

/** Bottom sheet on mobile, centered dialog on larger screens. */
export function Sheet({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-label={title}>
      <button
        type="button"
        aria-label="إغلاق"
        className="animate-fade absolute inset-0 bg-espresso/60 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div className="animate-sheet relative flex max-h-[92dvh] w-full max-w-lg flex-col rounded-t-3xl bg-crema shadow-2xl sm:rounded-3xl">
        <div className="mx-auto mt-2 h-1.5 w-12 rounded-full bg-latte sm:hidden" />
        <header className="flex items-center justify-between px-5 pb-2 pt-3">
          <h2 className="font-display text-xl">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="grid size-9 place-items-center rounded-full bg-latte/70 text-mocha transition hover:bg-latte"
            aria-label="إغلاق"
          >
            <XIcon width={18} height={18} />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto overscroll-contain px-5 pb-4">{children}</div>
        {footer && <div className="pb-safe border-t border-latte px-5 pt-3">{footer}</div>}
      </div>
    </div>
  );
}
