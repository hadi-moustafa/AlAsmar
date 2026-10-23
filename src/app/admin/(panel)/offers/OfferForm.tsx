"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Checkbox, Field, FormMessage, ImageInput, inputCls, SubmitButton } from "@/components/admin/ui";
import type { AdminOffer } from "@/lib/admin-data";
import { saveOffer } from "../../actions";

export function OfferForm({ offer }: { offer?: AdminOffer }) {
  const [state, action] = useActionState(saveOffer, undefined);
  return (
    <form action={action} className="space-y-4">
      {offer && <input type="hidden" name="row" value={offer.row} />}
      {offer && <input type="hidden" name="expected" value={offer.title} />}
      <ImageInput current={offer?.image_url ?? null} />
      <Field label="عنوان العرض">
        <input name="title" required defaultValue={offer?.title} className={inputCls} placeholder="مثال: عرض الصباح" />
      </Field>
      <Field label="التفاصيل" hint="ماذا يتضمن العرض؟">
        <textarea name="description" rows={2} defaultValue={offer?.description} className={inputCls} placeholder="مثال: كابتشينو + كريب نوتيلا" />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="سعر العرض">
          <input name="price" required inputMode="decimal" defaultValue={offer?.price ?? ""} className={inputCls} dir="ltr" placeholder="0" />
        </Field>
        <Field label="السعر قبل العرض" hint="اختياري — يظهر مشطوباً">
          <input name="old_price" inputMode="decimal" defaultValue={offer?.old_price ?? ""} className={inputCls} dir="ltr" placeholder="0" />
        </Field>
      </div>
      <Checkbox name="active" label="العرض مفعّل" defaultChecked={offer?.active ?? true} />
      <FormMessage state={state} />
      <div className="flex gap-2">
        <SubmitButton className="flex-1">{offer ? "حفظ التعديلات" : "إضافة العرض"}</SubmitButton>
        <Link href="/admin/offers" className="grid h-12 place-items-center rounded-full px-6 font-bold ring-1 ring-line">إلغاء</Link>
      </div>
    </form>
  );
}
