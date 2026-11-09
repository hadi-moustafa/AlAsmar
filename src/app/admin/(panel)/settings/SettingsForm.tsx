"use client";

import { useActionState, useState } from "react";
import { Checkbox, Field, FormMessage, inputCls, SubmitButton } from "@/components/admin/ui";
import type { Settings } from "@/lib/types";
import { saveSettings } from "../../actions";

const section = "space-y-4 rounded-2xl bg-surface p-4 ring-1 ring-line";

const moveBtn =
  "grid size-9 place-items-center rounded-full bg-surface ring-1 ring-line transition hover:ring-caramel disabled:opacity-30 disabled:hover:ring-line";

function SectionOrder({ initial }: { initial: string[] }) {
  const [order, setOrder] = useState(initial);
  const move = (from: number, to: number) =>
    setOrder((list) => {
      const next = [...list];
      next.splice(to, 0, ...next.splice(from, 1));
      return next;
    });
  return (
    <>
      <input type="hidden" name="category_order" value={order.join("|")} />
      <ol className="space-y-2">
        {order.map((name, i) => (
          <li key={name} className="flex items-center gap-2 rounded-xl bg-surface-2 px-3 py-2 ring-1 ring-line">
            <span className="w-6 text-center text-sm font-bold text-muted">{i + 1}</span>
            <span className="flex-1 font-semibold" dir="auto">{name}</span>
            <button type="button" aria-label="لأعلى" title="لأعلى" disabled={i === 0} onClick={() => move(i, i - 1)} className={moveBtn}>
              ▲
            </button>
            <button type="button" aria-label="لأسفل" title="لأسفل" disabled={i === order.length - 1} onClick={() => move(i, i + 1)} className={moveBtn}>
              ▼
            </button>
          </li>
        ))}
      </ol>
    </>
  );
}

export function SettingsForm({ settings, sections }: { settings: Settings; sections: string[] }) {
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
        <div>
          <h2 className="font-bold">📋 ترتيب الأقسام</h2>
          <p className="mt-1 text-xs text-muted">بهذا الترتيب تظهر الأقسام في القائمة — استخدم الأسهم للتحريك ثم احفظ</p>
        </div>
        {sections.length ? <SectionOrder initial={sections} /> : <p className="text-sm text-muted">لا توجد أقسام بعد</p>}
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
