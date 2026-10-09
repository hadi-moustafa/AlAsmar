import { MenuApp } from "@/components/menu/MenuApp";
import { getPublicMenu, isSheetConfigured } from "@/lib/data";

// The menu lives in a Google Sheet; edits there show up within a minute.
export const revalidate = 60;

export default async function Home() {
  if (!isSheetConfigured()) {
    return (
      <main className="app-col grid min-h-dvh place-items-center bg-ink px-6 text-center">
        <div>
          <div className="mb-3 text-5xl">☕</div>
          <h1 className="font-display text-2xl font-bold">القائمة قيد التحضير</h1>
          <p className="mt-2 text-muted">لم يتم ربط جدول Google بعد (GOOGLE_SHEET_ID).</p>
        </div>
      </main>
    );
  }
  const { categories, items, offers, settings } = await getPublicMenu();
  return <MenuApp categories={categories} items={items} offers={offers} settings={settings} />;
}
