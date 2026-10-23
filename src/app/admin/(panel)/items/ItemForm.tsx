"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { Checkbox, Field, FormMessage, ImageInput, inputCls, SubmitButton } from "@/components/admin/ui";
import { PlusIcon, XIcon } from "@/components/icons";
import type { AdminItem } from "@/lib/admin-data";
import { saveItem } from "../../actions";

type OptionRow = { name: string; price: string };

export function ItemForm({ item, categories, defaultCategory }: { item?: AdminItem; categories: string[]; defaultCategory?: string }) {
  const [state, action] = useActionState(saveItem, undefined);
  const [options, setOptions] = useState<OptionRow[]>(
    item?.options.map((o) => ({ name: o.name, price: String(o.price) })) ?? [],
  );
  const hasOptions = options.length > 0;

  const update = (i: number, patch: Partial<OptionRow>) =>
    setOptions((prev) => prev.map((o, j) => (j === i ? { ...o, ...patch } : o)));

  return (
    <form action={action} className="space-y-4">
      {item && <input type="hidden" name="row" value={item.row} />}
      {item && <input type="hidden" name="expected" value={item.name} />}
      <input type="hidden" name="options" value={JSON.stringify(options)} />

      <ImageInput current={item?.image_url ?? null} />

      <Field label="اسم الصنف">
        <input name="name" required defaultValue={item?.name} className={inputCls} placeholder="مثال: كابتشينو" />
      </Field>

      <Field label="القسم" hint="اختر من القائمة أو اكتب اسم قسم جديد">
        <input name="category" required list="categories" defaultValue={item?.category ?? defaultCategory} className={inputCls} />
        <datalist id="categories">
          {categories.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
      </Field>

      <Field label="الوصف" hint="اختياري — سطر أو سطرين عن المكونات">
        <textarea name="description" rows={2} defaultValue={item?.description} className={inputCls} placeholder="مثال: إسبريسو مع حليب مبخّر ورغوة كثيفة" />
      </Field>

      {!hasOptions && (
        <Field label="السعر" hint="اتركه فارغاً إذا لم يُحدَّد السعر بعد">
          <input name="price" inputMode="decimal" defaultValue={item?.price ?? ""} className={inputCls} dir="ltr" placeholder="0" />
        </Field>
      )}

      <div className="rounded-2xl bg-surface p-4 ring-1 ring-line">
        <div className="mb-2 flex items-center justify-between gap-2">
          <div>
            <p className="text-sm font-bold">الأحجام / الخيارات</p>
            <p className="text-xs text-muted">اختياري — مثل Medium / Large، ولكل منها سعر</p>
          </div>
          <button
            type="button"
            onClick={() => setOptions((o) => [...o, { name: "", price: "" }])}
            className="flex shrink-0 items-center gap-1 rounded-full bg-surface-2 px-3 py-1.5 text-sm font-bold ring-1 ring-line"
          >
            <PlusIcon width={16} height={16} /> إضافة
          </button>
        </div>
        {options.map((o, i) => (
          <div key={i} className="mt-2 flex gap-2">
            <input value={o.name} onChange={(e) => update(i, { name: e.target.value })} className={inputCls} placeholder="الاسم (مثال: Large)" />
            <input value={o.price} onChange={(e) => update(i, { price: e.target.value })} className={`${inputCls} w-28`} inputMode="decimal" dir="ltr" placeholder="السعر" />
            <button type="button" onClick={() => setOptions((prev) => prev.filter((_, j) => j !== i))} className="grid size-11 shrink-0 place-items-center rounded-xl text-red-400 hover:bg-red-500/15" aria-label="حذف الخيار">
              <XIcon width={18} height={18} />
            </button>
          </div>
        ))}
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <Checkbox name="available" label="متوفر حالياً" defaultChecked={item?.available ?? true} />
        <Checkbox name="featured" label="⭐ صنف مميّز" defaultChecked={item?.featured ?? false} />
      </div>

      <FormMessage state={state} />
      <div className="flex gap-2">
        <SubmitButton className="flex-1">{item ? "حفظ التعديلات" : "إضافة الصنف"}</SubmitButton>
        <Link href="/admin" className="grid h-12 place-items-center rounded-full px-6 font-bold ring-1 ring-line">إلغاء</Link>
      </div>
    </form>
  );
}
