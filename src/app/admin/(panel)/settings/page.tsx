import { getSettings } from "@/lib/data";
import { SettingsForm } from "./SettingsForm";

export default async function SettingsPage() {
  const settings = await getSettings();
  return (
    <div className="mx-auto max-w-xl">
      <h1 className="font-display text-2xl">الإعدادات</h1>
      <p className="mb-5 text-sm text-mocha/70">معلومات المقهى ورقم واتساب الذي تصل إليه الطلبات.</p>
      <SettingsForm settings={settings} />
    </div>
  );
}
