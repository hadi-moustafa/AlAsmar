"use client";

import { useEffect, useRef, useState } from "react";
import { XIcon } from "../icons";

/** Phone-style bottom sheet; drag the top bar down (or tap outside) to close. */
export function Sheet({
  open,
  onClose,
  title,
  hideTitle = false,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  hideTitle?: boolean;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  const [drag, setDrag] = useState(0);
  const start = useRef<number | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
      setDrag(0);
    };
  }, [open, onClose]);

  if (!open) return null;

  const onPointerDown = (e: React.PointerEvent) => {
    start.current = e.clientY;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (start.current !== null) setDrag(Math.max(0, e.clientY - start.current));
  };
  const onPointerUp = () => {
    start.current = null;
    if (drag > 110) onClose();
    else setDrag(0);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" role="dialog" aria-modal="true" aria-label={title}>
      <button
        type="button"
        aria-label="إغلاق"
        className="animate-fade absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className="app-col animate-sheet relative flex max-h-[92dvh] flex-col overflow-hidden rounded-t-[28px] bg-surface shadow-[0_-20px_60px_-10px_rgb(0_0_0/0.6)] ring-1 ring-line"
        style={drag ? { transform: `translateY(${drag}px)`, transition: "none" } : { transition: "transform .25s" }}
      >
        <div
          className="absolute inset-x-0 top-0 z-10 flex touch-none justify-center pb-3 pt-2.5"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <span className="h-1.5 w-10 rounded-full bg-cream/25" />
        </div>
        {hideTitle ? (
          <button
            type="button"
            onClick={onClose}
            className="absolute left-4 top-4 z-20 grid size-9 place-items-center rounded-full bg-black/45 text-cream backdrop-blur-md"
            aria-label="إغلاق"
          >
            <XIcon width={18} height={18} />
          </button>
        ) : (
          <header className="flex items-center justify-between px-5 pb-3 pt-6">
            <h2 className="font-display text-xl font-bold">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              className="grid size-9 place-items-center rounded-full bg-surface-2 text-muted ring-1 ring-line"
              aria-label="إغلاق"
            >
              <XIcon width={18} height={18} />
            </button>
          </header>
        )}
        <div className="flex-1 overflow-y-auto overscroll-contain">{children}</div>
        {footer && <div className="pb-safe border-t border-line bg-surface/95 px-5 pt-3 backdrop-blur">{footer}</div>}
      </div>
    </div>
  );
}
