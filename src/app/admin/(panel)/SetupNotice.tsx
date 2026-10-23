import { serviceAccountEmail } from "@/lib/sheets";
import type { Currency } from "@/lib/types";

/** Shown instead of a page when the sheet can't be reached, with the fix spelled out. */
export function SetupNotice({ error }: { error: unknown }) {
  const email = serviceAccountEmail();
  return (
    <div className="space-y-3 rounded-2xl bg-amber-500/10 p-5 text-sm ring-1 ring-amber-500/30">
      <p className="font-bold text-amber-200">⚠️ تعذّر الوصول إلى جدول Google</p>
      <p className="text-amber-100/90">{error instanceof Error ? error.message : String(error)}</p>
      {email && (
        <p className="text-muted">
          بريد حساب الخدمة: <bdi dir="ltr" className="select-all font-mono text-cream">{email}</bdi>
        </p>
      )}
    </div>
  );
}

/** Settings → currency, for showing prices in the admin lists. */
export function currencyOf(settings: Record<string, string>): Currency {
  return /lbp|ل\.?ل|ليرة/i.test(settings["العملة"] ?? "") ? "LBP" : "USD";
}
