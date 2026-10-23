"use client";

import { useRef, useState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import { ImageIcon, TrashIcon } from "../icons";

export const inputCls =
  "w-full rounded-xl border border-line bg-surface-2 px-3.5 py-2.5 text-[15px] text-cream outline-none transition placeholder:text-muted/60 focus:border-caramel focus:ring-2 focus:ring-caramel/25";

export function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-bold">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
    </label>
  );
}

export function Checkbox({ name, label, defaultChecked }: { name: string; label: string; defaultChecked?: boolean }) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-xl bg-surface-2 px-3.5 py-3 ring-1 ring-line">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="size-5 accent-caramel" />
      <span className="font-semibold">{label}</span>
    </label>
  );
}

export function SubmitButton({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={`h-12 rounded-full bg-caramel px-6 font-bold text-ink transition hover:bg-honey disabled:opacity-60 ${className}`}
    >
      {pending ? "جارٍ الحفظ…" : children}
    </button>
  );
}

export function FormMessage({ state }: { state: { error?: string; ok?: boolean } | undefined }) {
  if (state?.error) return <p className="rounded-xl bg-red-500/15 px-3 py-2 text-sm font-semibold text-red-300">{state.error}</p>;
  if (state?.ok) return <p className="rounded-xl bg-green-500/15 px-3 py-2 text-sm font-semibold text-green-300">✓ تم الحفظ</p>;
  return null;
}

/** Runs a quick server action (with an optional confirmation) and shows any error it returns. */
export function ActionButton({
  action,
  confirmText,
  className,
  children,
  label,
}: {
  action: () => Promise<string | void>;
  confirmText?: string;
  className?: string;
  children: React.ReactNode;
  label?: string;
}) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={pending}
      className={`${className} disabled:opacity-50`}
      onClick={() => {
        if (confirmText && !window.confirm(confirmText)) return;
        start(async () => {
          const error = await action();
          if (error) window.alert(error);
        });
      }}
    >
      {children}
    </button>
  );
}

export function DeleteButton({ action, what, extra = "" }: { action: () => Promise<string | void>; what: string; extra?: string }) {
  return (
    <ActionButton
      action={action}
      confirmText={`هل أنت متأكد من حذف «${what}»؟${extra} لا يمكن التراجع.`}
      label="حذف"
      className="grid size-9 shrink-0 place-items-center rounded-full text-red-400 transition hover:bg-red-500/15"
    >
      <TrashIcon width={18} height={18} />
    </ActionButton>
  );
}

/** Resize in the browser so uploads stay small and fast on mobile data. */
async function shrink(file: File, max = 1200): Promise<File> {
  if (!file.type.startsWith("image/") || file.type === "image/gif") return file;
  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) return file;
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const toBlob = (type: string) => new Promise<Blob | null>((r) => canvas.toBlob(r, type, 0.82));
  let blob = await toBlob("image/webp");
  if (!blob || blob.type !== "image/webp") blob = await toBlob("image/jpeg");
  if (!blob || blob.size >= file.size) return file;
  const ext = blob.type === "image/webp" ? "webp" : "jpg";
  return new File([blob], `${file.name.replace(/\.[^.]+$/, "")}.${ext}`, { type: blob.type });
}

export function ImageInput({ current }: { current: string | null }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(current);
  const [removed, setRemoved] = useState(false);
  const [busy, setBusy] = useState(false);

  const onChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const file = input.files?.[0];
    if (!file) return;
    setBusy(true);
    const small = await shrink(file);
    const dt = new DataTransfer();
    dt.items.add(small);
    input.files = dt.files;
    setPreview(URL.createObjectURL(small));
    setRemoved(false);
    setBusy(false);
  };

  const remove = () => {
    if (inputRef.current) inputRef.current.value = "";
    setPreview(null);
    setRemoved(true);
  };

  return (
    <div>
      <span className="mb-1 block text-sm font-bold">الصورة</span>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="relative grid size-28 shrink-0 place-items-center overflow-hidden rounded-2xl border-2 border-dashed border-line bg-surface-2 text-muted transition hover:border-caramel"
        >
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element -- local blob preview or sheet link
            <img src={preview} alt="" className="absolute inset-0 size-full object-cover" />
          ) : (
            <ImageIcon width={32} height={32} />
          )}
          {busy && <span className="absolute inset-0 grid place-items-center bg-ink/80 text-xs">جارٍ التجهيز…</span>}
        </button>
        <div className="flex flex-col gap-2 text-sm">
          <button type="button" onClick={() => inputRef.current?.click()} className="rounded-full bg-surface-2 px-4 py-2 font-semibold ring-1 ring-line">
            {preview ? "تغيير الصورة" : "اختر صورة"}
          </button>
          {preview && (
            <button type="button" onClick={remove} className="rounded-full px-4 py-2 font-semibold text-red-400 hover:bg-red-500/15">
              إزالة الصورة
            </button>
          )}
        </div>
      </div>
      <input ref={inputRef} type="file" name="image" accept="image/*" className="hidden" onChange={onChange} />
      <input type="hidden" name="remove_image" value={removed ? "true" : ""} />
    </div>
  );
}
