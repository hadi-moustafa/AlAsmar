"use client";

import { useActionState } from "react";
import { Checkbox, Field, FormMessage, inputCls, SubmitButton } from "@/components/admin/ui";
import type { Settings } from "@/lib/types";
import { saveSettings } from "../../actions";

const section = "space-y-4 rounded-2xl bg-surface p-4 ring-1 ring-line";

export function SettingsForm({ settings }: { settings: Settings }) {
  const [state, action] = useActionState(saveSettings, undefined);
  return (
    <form action={action} className="space-y-4">
      <section className={section}>
        <h2 className="font-bold">🟢 استقبال الطلبات</h2>
        <Field label="رقم واتساب" hint="مع رمز الدولة وبدون + أو 00 — مثال: 96170123456">
          <input name="whatsapp_number" required defaultValue={settings.whatsapp_number} inputMode="tel" dir="ltr" className={inputCls} placeholder="961XXXXXXXX" />
        </Field>
        <Field label="العملة">
          <select name="currency" defaultValue={settings.currency} className={inputCls}>
            <option value="USD">دولار أميركي ($)</option>
            <option value="LBP">ليرة لبنانية (ل.ل)</option>
          </select>
        </Field>
        <Checkbox name="delivery_enabled" label="🛵 خدمة التوصيل متاحة" defaultChecked={settings.delivery_enabled === "1"} />
      </section>

      <section className={section}>
        <h2 className="font-bold">☕ معلومات المقهى</h2>
        <Field label="الشعار النصي" hint="يظهر تحت اسم المقهى">
          <input name="tagline" defaultValue={settings.tagline} className={inputCls} />
        </Field>
        <Field label="شريط إعلان" hint="اختياري — يظهر أعلى الصفحة، مثال: 🎉 خصم 20% كل يوم جمعة">
          <input name="announcement" defaultValue={settings.announcement} className={inputCls} />
        </Field>
        <Field label="أوقات العمل">
          <input name="hours" defaultValue={settings.hours} className={inputCls} placeholder="يومياً 8 صباحاً – 12 منتصف الليل" />
        </Field>
        <Field label="العنوان">
          <input name="address" defaultValue={settings.address} className={inputCls} placeholder="المدينة، الشارع" />
        </Field>
      </section>

      <section className={section}>
        <h2 className="font-bold">📞 التواصل</h2>
        <Field label="رقم الهاتف">
          <input name="phone" defaultValue={settings.phone} inputMode="tel" dir="ltr" className={inputCls} />
        </Field>
        <Field label="رابط الموقع على الخريطة" hint="رابط Google Maps">
          <input name="maps_url" defaultValue={settings.maps_url} dir="ltr" className={inputCls} placeholder="https://maps.app.goo.gl/…" />
        </Field>
        <Field label="إنستغرام" hint="رابط الحساب أو اسمه">
          <input name="instagram" defaultValue={settings.instagram} dir="ltr" className={inputCls} />
        </Field>
        <Field label="فيسبوك" hint="رابط الصفحة">
          <input name="facebook" defaultValue={settings.facebook} dir="ltr" className={inputCls} />
        </Field>
      </section>

      <FormMessage state={state} />
      <SubmitButton className="w-full">حفظ الإعدادات</SubmitButton>
    </form>
  );
}
