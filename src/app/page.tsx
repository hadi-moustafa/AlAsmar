import { MenuApp } from "@/components/menu/MenuApp";
import { getPublicMenu } from "@/lib/data";

// Always render with fresh prices/availability; the menu is small and the query is cheap.
export const dynamic = "force-dynamic";

export default async function Home() {
  const { categories, items, offers, settings } = await getPublicMenu();
  return <MenuApp categories={categories} items={items} offers={offers} settings={settings} />;
}
