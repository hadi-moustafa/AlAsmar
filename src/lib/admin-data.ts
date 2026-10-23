import "server-only";
import { flag, imageUrl, num, parseOptions, TABS } from "./data";
import { readSheet, type SheetRow } from "./sheets";
import type { ItemOption } from "./types";

/** Columns the admin panel reads and writes, as named in the sheet's header row. */
export const COLS = {
  categories: ["القسم", "الأيقونة"],
  items: ["القسم", "الاسم", "الوصف", "السعر", "الخيارات", "الصورة", "متوفر", "مميز"],
  offers: ["العنوان", "الوصف", "السعر", "السعر القديم", "الصورة", "فعّال"],
  settings: ["الإعداد", "القيمة"],
} as const;

export type AdminCategory = { row: number; name: string; icon: string };
export type AdminItem = {
  row: number;
  category: string;
  name: string;
  description: string;
  price: number | null;
  options: ItemOption[];
  image: string;
  image_url: string | null;
  available: boolean;
  featured: boolean;
};
export type AdminOffer = {
  row: number;
  title: string;
  description: string;
  price: number | null;
  old_price: number | null;
  image: string;
  image_url: string | null;
  active: boolean;
};

export async function getAdminCategories() {
  const { rows } = await readSheet(TABS.categories, COLS.categories);
  return rows
    .filter((r) => r.values["القسم"])
    .map((r): AdminCategory => ({ row: r.row, name: r.values["القسم"], icon: r.values["الأيقونة"] }));
}

const toItem = (r: SheetRow): AdminItem => ({
  row: r.row,
  category: r.values["القسم"] || "أخرى",
  name: r.values["الاسم"],
  description: r.values["الوصف"],
  price: num(r.values["السعر"]),
  options: parseOptions(r.values["الخيارات"]),
  image: r.values["الصورة"],
  image_url: imageUrl(r.values["الصورة"]),
  available: flag(r.values["متوفر"], true),
  featured: flag(r.values["مميز"], false),
});

export async function getAdminItems() {
  const { rows } = await readSheet(TABS.items, COLS.items);
  return rows.filter((r) => r.values["الاسم"]).map(toItem);
}

const toOffer = (r: SheetRow): AdminOffer => ({
  row: r.row,
  title: r.values["العنوان"],
  description: r.values["الوصف"],
  price: num(r.values["السعر"]),
  old_price: num(r.values["السعر القديم"]),
  image: r.values["الصورة"],
  image_url: imageUrl(r.values["الصورة"]),
  active: flag(r.values["فعّال"] || r.values["فعال"], true),
});

export async function getAdminOffers() {
  const { rows } = await readSheet(TABS.offers, COLS.offers);
  return rows.filter((r) => r.values["العنوان"]).map(toOffer);
}

/** Settings-tab values keyed by their Arabic label. */
export async function getAdminSettings() {
  const { rows } = await readSheet(TABS.settings, COLS.settings);
  return Object.fromEntries(rows.map((r) => [r.values["الإعداد"], r.values["القيمة"]]));
}

/** Category names from the categories tab first, then any only used by items. */
export function categoryNames(categories: AdminCategory[], items: AdminItem[]) {
  return [...new Set([...categories.map((c) => c.name), ...items.map((i) => i.category)])];
}
