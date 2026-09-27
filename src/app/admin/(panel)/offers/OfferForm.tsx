"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Checkbox, Field, FormMessage, ImageInput, inputCls, SubmitButton } from "@/components/admin/ui";
import type { Offer } from "@/lib/types";
import { saveOffer } from "../../actions";

export function OfferForm({ offer }: { offer?: Offer }) {
  const [state, action] = useActionState(saveOffer, undefined);
  return (
    <form action={action} className="space-y-4">
      {offer && <input type="hidden" name="id" value={offer.id} />}
      <ImageInput current={offer?.image_url ?? null} />
      <Field label="عنوان العرض">
        <input name="title" required defaultValue={offer?.title} className={inputCls} placeholder="مثال: عرض الصباح" />
      </Field>
      <Field label="التفاصيل" hint="ماذا يتضمن العرض؟">
        <textarea name="description" rows={2} defaultValue={offer?.description} className={inputCls} placeholder="مثال: كابتشينو + كريب نوتيلا" />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="سعر العرض">
          <input name="price" required inputMode="decimal" defaultValue={offer?.price} className={inputCls} dir="ltr" placeholder="0.00" />
        </Field>
        <Field label="السعر قبل العرض" hint="اختياري — يظهر مشطوباً">
          <input name="old_price" inputMode="decimal" defaultValue={offer?.old_price ?? ""} className={inputCls} dir="ltr" placeholder="0.00" />
        </Field>
      </div>
      <Checkbox name="is_active" label="العرض مفعّل" defaultChecked={offer?.is_active ?? true} />
      <Field label="الترتيب" hint="الرقم الأصغر يظهر أولاً">
        <input name="sort_order" type="number" defaultValue={offer?.sort_order ?? 0} className={`${inputCls} w-32`} dir="ltr" />
      </Field>
      <FormMessage state={state} />
      <div className="flex gap-2">
        <SubmitButton className="flex-1">{offer ? "حفظ التعديلات" : "إضافة العرض"}</SubmitButton>
        <Link href="/admin/offers" className="grid h-12 place-items-center rounded-full px-6 font-bold ring-1 ring-latte">إلغاء</Link>
      </div>
    </form>
  );
}
