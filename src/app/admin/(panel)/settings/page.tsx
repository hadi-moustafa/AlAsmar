import { getAdminSettings } from "@/lib/admin-data";
import { flag, SETTING_LABELS } from "@/lib/data";
import { DEFAULT_SETTINGS, type Settings } from "@/lib/types";
import { currencyOf, SetupNotice } from "../SetupNotice";
import { SettingsForm } from "./SettingsForm";

export default async function SettingsPage() {
  let sheet;
  try {
    sheet = await getAdminSettings();
  } catch (err) {
    return <SetupNotice error={err} />;
  }
  // Same as the menu: an empty cell falls back to the built-in default.
  const settings: Settings = { ...DEFAULT_SETTINGS };
  for (const [label, key] of Object.entries(SETTING_LABELS)) if (sheet[label]) settings[key] = sheet[label] as never;
  settings.currency = currencyOf({ "العملة": settings.currency });
  settings.delivery_enabled = flag(settings.delivery_enabled, true) ? "1" : "0";

  return (
    <div>
      <h1 className="mb-4 font-display text-2xl font-bold">الإعدادات</h1>
      <SettingsForm settings={settings} />
    </div>
  );
}
